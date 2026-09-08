import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { cancelSubscription, mollieConfigured } from '@/lib/mollie'
import { brevoRemoveFromList } from '@/lib/brevo'
import { sendEmail, emailHtml } from '@/lib/email'

/** POST /api/subscription/cancel - cancel the current user's Mollie subscription. */
export async function POST() {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: await getHeaders() })
    if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })

    const u = user as {
      id: number
      email: string
      subscriptionTier?: string
      brandTier?: string
      subscriptionExpiresAt?: string
      mollieCustomerId?: string
      mollieSubscriptionId?: string
    }

    if (mollieConfigured() && u.mollieCustomerId && u.mollieSubscriptionId) {
      await cancelSubscription(u.mollieCustomerId, u.mollieSubscriptionId).catch((err) => console.error('[mollie] cancel failed', err))
    }

    await payload.update({
      collection: 'users',
      id: u.id,
      data: {
        subscriptionStatus: 'canceled',
        subscriptionCancelAtPeriodEnd: true,
        subscriptionCanceledAt: new Date().toISOString(),
      } as never,
      overrideAccess: true,
    })

    if (u.subscriptionTier === 'medium' || u.subscriptionTier === 'premium') {
      await brevoRemoveFromList(u.email)
    }

    const endDate = u.subscriptionExpiresAt ? new Date(u.subscriptionExpiresAt) : new Date()
    await sendEmail({
      to: u.email,
      subject: 'Bevestiging stopzetting automatische verlenging',
      html: emailHtml([
        'Je hebt de automatische verlenging van je Blissify-abonnement stopgezet.',
        `Je abonnement en de bijbehorende voordelen blijven actief tot ${endDate.toLocaleDateString('nl-BE')}.`,
        'Er vindt geen terugbetaling plaats voor de reeds betaalde abonnementsperiode.',
      ]),
    })

    return NextResponse.json({ success: true, effectiveAt: endDate.toISOString() })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Annuleren mislukt.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
