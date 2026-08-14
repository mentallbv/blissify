import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { cancelSubscription, mollieConfigured } from '@/lib/mollie'
import { brevoRemoveFromList } from '@/lib/brevo'

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
      subscriptionCommitment?: string
      subscriptionMinimumEndsAt?: string
      subscriptionTrialEndsAt?: string
      mollieCustomerId?: string
      mollieSubscriptionId?: string
    }

    // During the trial the subscription has not charged yet, so the annual
    // commitment has not started either - cancelling must always be possible.
    const inTrial = Boolean(u.subscriptionTrialEndsAt && new Date(u.subscriptionTrialEndsAt).getTime() > Date.now())

    if (
      !inTrial &&
      u.subscriptionCommitment === 'annual' &&
      u.subscriptionMinimumEndsAt &&
      new Date(u.subscriptionMinimumEndsAt).getTime() > Date.now()
    ) {
      return NextResponse.json(
        {
          error: `Dit abonnement heeft een jaarverbintenis en kan worden opgezegd vanaf ${new Date(u.subscriptionMinimumEndsAt).toLocaleDateString('nl-BE')}.`,
        },
        { status: 409 },
      )
    }

    if (mollieConfigured() && u.mollieCustomerId && u.mollieSubscriptionId) {
      await cancelSubscription(u.mollieCustomerId, u.mollieSubscriptionId).catch((err) => console.error('[mollie] cancel failed', err))
    }

    await payload.update({
      collection: 'users',
      id: u.id,
      data: {
        subscriptionStatus: 'canceled',
        // Cancelling inside the trial voids the commitment that never started.
        // The paid period ends now too: nothing was paid for, so entitlement
        // must not run to the expiry date the webhook wrote a year out.
        ...(inTrial ? { subscriptionMinimumEndsAt: null, subscriptionExpiresAt: new Date().toISOString() } : {}),
      } as never,
      overrideAccess: true,
    })

    if (u.subscriptionTier === 'medium' || u.subscriptionTier === 'premium') {
      await brevoRemoveFromList(u.email)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Annuleren mislukt.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
