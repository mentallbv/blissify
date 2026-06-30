import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getPayment, createSubscription, TIER_LABEL, type Tier } from '@/lib/mollie'
import { brevoAddContact } from '@/lib/brevo'
import { sendEmail, emailHtml, ADMIN_EMAIL, SITE_URL } from '@/lib/email'

type AnyUser = { id: number; email: string; subscriptionTier?: string; mollieCustomerId?: string; mollieSubscriptionId?: string }

function oneYearFromNow(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString()
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

    const tier = ((payment.metadata as { tier?: Tier } | undefined)?.tier || (user.subscriptionTier as Tier) || 'basis') as Tier

    if (payment.status === 'paid') {
      const data: Record<string, unknown> = {
        subscriptionTier: tier,
        subscriptionStatus: 'active',
        subscriptionExpiresAt: oneYearFromNow(),
      }

      // First (mandate-creating) payment succeeded -> create the recurring subscription.
      if (payment.sequenceType === 'first' && payment.customerId && !user.mollieSubscriptionId) {
        try {
          const sub = await createSubscription({ customerId: payment.customerId, tier, description: `Blissify abonnement - ${TIER_LABEL[tier]}` })
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
          `Formule: ${TIER_LABEL[tier]}`,
          `Beheer: ${SITE_URL}/admin`,
        ]),
      })
    }
  } catch (err) {
    console.error('[mollie] webhook error', err)
  }

  return NextResponse.json({ received: true })
}
