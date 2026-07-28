import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { createSubscription, getPayment, isBrandTier, planLabel, type BillingCycle, type PlanTier } from '@/lib/mollie'
import { brevoAddContact } from '@/lib/brevo'
import { sendEmail, emailHtml, ADMIN_EMAIL, SITE_URL } from '@/lib/email'

type AnyUser = {
  id: number
  email: string
  role?: string
  subscriptionTier?: string
  brandTier?: string
  subscriptionBillingCycle?: BillingCycle
  mollieCustomerId?: string
  mollieSubscriptionId?: string
}

/**
 * POST /api/webhooks/mollie - Mollie posts only an `id`; we fetch the real
 * status from the API, then update the user. Always 200 so Mollie stops retrying.
 */
export async function POST(req: Request) {
  let id = ''
  try {
    const text = await req.text()
    id = new URLSearchParams(text).get('id') || ''
  } catch {
    /* ignore */
  }
  if (!id) return NextResponse.json({ received: true })

  // Only payment notifications carry actionable status for us.
  if (!id.startsWith('tr_')) return NextResponse.json({ received: true })

  try {
    const payload = await getPayload({ config: await config })
    const payment = await getPayment(id)

    // Resolve the user: prefer metadata.userId, fall back to the Mollie customer.
    let user: AnyUser | null = null
    const metaUserId = (payment.metadata as { userId?: number | string } | undefined)?.userId
    if (metaUserId != null) {
      user = (await payload.findByID({ collection: 'users', id: metaUserId as never, overrideAccess: true }).catch(() => null)) as AnyUser | null
    }
    if (!user && payment.customerId) {
      const found = await payload.find({ collection: 'users', where: { mollieCustomerId: { equals: payment.customerId } } as never, limit: 1, overrideAccess: true })
      user = (found.docs[0] as AnyUser) || null
    }
    if (!user) return NextResponse.json({ received: true })

    const metadata = payment.metadata as {
      tier?: PlanTier
      role?: string
      billingCycle?: BillingCycle
      amount?: string
      trialEndsAt?: string
      nextChargeAt?: string
      commitment?: 'annual' | 'cancel_anytime'
    } | undefined
    const tier = (metadata?.tier || (user.role === 'brand' ? user.brandTier : user.subscriptionTier) || 'basis') as PlanTier
    const billingCycle = metadata?.billingCycle || user.subscriptionBillingCycle || 'yearly'
    const trialEndsAt = metadata?.trialEndsAt ? new Date(metadata.trialEndsAt) : new Date()
    const nextChargeAt = metadata?.nextChargeAt ? new Date(metadata.nextChargeAt) : trialEndsAt
    const expiresAt = new Date(trialEndsAt)
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    if (payment.status === 'paid') {
      const data: Record<string, unknown> = {
        ...(isBrandTier(tier) ? { brandTier: tier } : { subscriptionTier: tier }),
        subscriptionStatus: 'active',
        subscriptionBillingCycle: billingCycle,
        subscriptionCommitment: metadata?.commitment || 'annual',
        subscriptionTrialEndsAt: trialEndsAt.toISOString(),
        subscriptionExpiresAt: expiresAt.toISOString(),
      }

      // First (mandate-creating) payment succeeded -> create the recurring subscription.
      if (payment.sequenceType === 'first' && payment.customerId && !user.mollieSubscriptionId) {
        try {
          const sub = await createSubscription({
            customerId: payment.customerId,
            tier,
            amount: metadata?.amount || '0.00',
            billingCycle,
            startDate: nextChargeAt.toISOString().slice(0, 10),
            description: `Blissify abonnement - ${planLabel(tier)}`,
          })
          data.mollieSubscriptionId = sub.id
        } catch (err) {
          console.error('[mollie] subscription creation failed', err)
        }
      }

      await payload.update({ collection: 'users', id: user.id, data: data as never, overrideAccess: true })

      if (tier === 'medium' || tier === 'premium') await brevoAddContact(user.email)
    } else if (payment.status === 'failed' || payment.status === 'expired' || payment.status === 'canceled') {
      await payload.update({ collection: 'users', id: user.id, data: { subscriptionStatus: 'inactive' } as never, overrideAccess: true })
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `Betaling mislukt - ${user.email}`,
        html: emailHtml([
          `Een abonnementsbetaling is ${payment.status}.`,
          `Gebruiker: ${user.email}`,
          `Formule: ${planLabel(tier)}`,
          `Beheer: ${SITE_URL}/admin`,
        ]),
      })
    }
  } catch (err) {
    console.error('[mollie] webhook error', err)
  }

  return NextResponse.json({ received: true })
}
