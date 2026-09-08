import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { cancelSubscription, createSubscription, getPayment, isBrandTier, planLabel, type BillingCycle, type PlanTier } from '@/lib/mollie'
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
      fullRenewalAmount?: string
      proratedCredit?: string
      action?: 'activate' | 'upgrade'
      nextChargeAt?: string
      commitment?: 'annual' | 'cancel_anytime'
      minimumEndsAt?: string | null
    } | undefined
    const tier = (metadata?.tier || (user.role === 'brand' ? user.brandTier : user.subscriptionTier) || 'basis') as PlanTier
    const billingCycle = metadata?.billingCycle || user.subscriptionBillingCycle || 'yearly'
    const periodStartedAt = new Date()
    const nextChargeAt = metadata?.nextChargeAt ? new Date(metadata.nextChargeAt) : new Date(periodStartedAt)
    if (!metadata?.nextChargeAt) {
      if (billingCycle === 'monthly') nextChargeAt.setMonth(nextChargeAt.getMonth() + 1)
      else nextChargeAt.setFullYear(nextChargeAt.getFullYear() + 1)
    }

    if (payment.status === 'paid') {
      const data: Record<string, unknown> = {
        ...(isBrandTier(tier) ? { brandTier: tier } : { subscriptionTier: tier }),
        subscriptionStatus: 'active',
        subscriptionBillingCycle: billingCycle,
        subscriptionCommitment: billingCycle === 'monthly' ? 'cancel_anytime' : 'annual',
        subscriptionTrialEndsAt: null,
        subscriptionStartedAt: periodStartedAt.toISOString(),
        subscriptionExpiresAt: nextChargeAt.toISOString(),
        subscriptionMinimumEndsAt: null,
        subscriptionCancelAtPeriodEnd: false,
        subscriptionCanceledAt: null,
        subscriptionInactiveSince: null,
        pendingSubscriptionTier: null,
        pendingSubscriptionBillingCycle: null,
        pendingSubscriptionEffectiveAt: null,
      }

      // A paid upgrade starts a brand-new period. Stop the old renewal before
      // creating the replacement subscription at the full (not prorated) rate.
      if (metadata?.action === 'upgrade' && payment.customerId && user.mollieSubscriptionId) {
        await cancelSubscription(payment.customerId, user.mollieSubscriptionId).catch((err) => console.error('[mollie] old subscription cancel failed', err))
        data.mollieSubscriptionId = null
      }

      // First payment succeeded -> create the recurring subscription. Upgrades
      // replace the old subscription even though the user previously had one.
      if (payment.sequenceType === 'first' && payment.customerId && (!user.mollieSubscriptionId || metadata?.action === 'upgrade')) {
        try {
          const sub = await createSubscription({
            customerId: payment.customerId,
            tier,
            amount: metadata?.fullRenewalAmount || metadata?.amount || '0.00',
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

      await sendEmail({
        to: user.email,
        subject: `Je Blissify-abonnement is actief - ${planLabel(tier)}`,
        html: emailHtml([
          `Je abonnement ${planLabel(tier)} is actief${metadata?.action === 'upgrade' ? ' na je upgrade' : ''}.`,
          ...(Number(metadata?.proratedCredit || 0) > 0 ? [`Verrekend tegoed van je vorige abonnement: € ${Number(metadata?.proratedCredit).toLocaleString('nl-BE', { minimumFractionDigits: 2 })}.`] : []),
          `Facturatie: ${billingCycle === 'monthly' ? 'maandelijks' : 'jaarlijks'}.`,
          `De huidige periode loopt tot ${nextChargeAt.toLocaleDateString('nl-BE')}.`,
          'Het abonnement wordt automatisch verlengd, tenzij je de verlenging voordien stopzet.',
        ]),
      })

      if (tier === 'medium' || tier === 'premium') await brevoAddContact(user.email)
    } else if (payment.status === 'failed' || payment.status === 'expired' || payment.status === 'canceled') {
      await payload.update({ collection: 'users', id: user.id, data: { subscriptionStatus: 'inactive', subscriptionInactiveSince: new Date().toISOString() } as never, overrideAccess: true })
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
