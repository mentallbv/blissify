import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { createCustomer, createFirstPayment, mollieConfigured, planLabel, type BillingCycle, type PlanTier } from '@/lib/mollie'
import { SITE_URL } from '@/lib/email'
import { publishedCoursesOverLimit, resolvePlan } from '@/lib/subscription-plan'
import { tierFeatures } from '@/lib/tier-features'

/** POST /api/subscription/start { tier, billingCycle, method } - create/reuse Mollie customer + first payment. */
export async function POST(req: Request) {
  try {
    if (!mollieConfigured()) {
      return NextResponse.json({ error: 'Betalingen zijn nog niet geconfigureerd (MOLLIE_API_KEY ontbreekt).' }, { status: 503 })
    }
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: await getHeaders() })
    if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })

    const u = user as { id: number; email: string; name?: string; role?: string; mollieCustomerId?: string; subscriptionStatus?: string }
    if (u.role !== 'trainer' && u.role !== 'brand') {
      return NextResponse.json({ error: 'Alleen opleiders kunnen een abonnement starten.' }, { status: 400 })
    }

    const body = await req.json()
    const tier = body.tier as PlanTier
    const billingCycle: BillingCycle = body.billingCycle === 'monthly' ? 'monthly' : 'yearly'
    const method = typeof body.method === 'string' && body.method ? body.method : undefined

    const plan = await resolvePlan(u.role, tier, billingCycle)
    if (!plan.ok) return NextResponse.json({ error: plan.error }, { status: plan.status })
    const { amount, catalog } = plan

    // A downgrade must not silently take courses offline - the user decides
    // which ones to keep, by unpublishing the surplus before switching.
    const surplus = await publishedCoursesOverLimit(payload, u.id, u.role, tier)
    if (surplus > 0) {
      const noun = surplus === 1 ? 'opleiding' : 'opleidingen'
      const limit = tierFeatures(u.role === 'brand' ? 'brand' : 'trainer', tier).courseLimit
      return NextResponse.json(
        {
          error:
            `Deze formule laat maximaal ${limit} actieve ${limit === 1 ? 'opleiding' : 'opleidingen'} toe. ` +
            `Zet eerst ${surplus} ${noun} op concept via je dashboard en kies daarna deze formule.`,
        },
        { status: 409 },
      )
    }
    const now = new Date()
    const trialEndsAt = catalog.billing.trialEnabled
      ? new Date(now.getTime() + catalog.billing.trialDays * 86400000)
      : now
    const nextChargeAt = new Date(trialEndsAt)
    if (!catalog.billing.trialEnabled) {
      if (billingCycle === 'monthly') nextChargeAt.setMonth(nextChargeAt.getMonth() + 1)
      else nextChargeAt.setFullYear(nextChargeAt.getFullYear() + 1)
    }
    const minimumEndsAt = new Date(now)
    minimumEndsAt.setFullYear(minimumEndsAt.getFullYear() + 1)

    // Reuse the customer if we already created one for this user. The id is safe
    // to persist immediately - it says nothing about the subscription state.
    let customerId = u.mollieCustomerId
    if (!customerId) {
      const customer = await createCustomer(u.name || u.email, u.email)
      customerId = customer.id
      await payload.update({ collection: 'users', id: u.id, data: { mollieCustomerId: customerId } as never, overrideAccess: true })
    }

    const payment = await createFirstPayment({
      customerId,
      tier,
      trialEnabled: catalog.billing.trialEnabled,
      amount,
      method,
      description: catalog.billing.trialEnabled ? `Blissify proefperiode - ${planLabel(tier)}` : `Blissify abonnement - ${planLabel(tier)}`,
      redirectUrl: `${SITE_URL}/dashboard/abonnement?betaling=verwerkt`,
      metadata: {
        userId: u.id,
        tier,
        role: u.role,
        billingCycle,
        amount,
        trialEndsAt: trialEndsAt.toISOString(),
        nextChargeAt: nextChargeAt.toISOString(),
        commitment: catalog.billing.monthlyCommitment,
        minimumEndsAt: catalog.billing.monthlyCommitment === 'annual' ? minimumEndsAt.toISOString() : null,
      },
    })

    const checkoutUrl = payment._links?.checkout?.href
    if (!checkoutUrl) return NextResponse.json({ error: 'Kon de betaling niet starten.' }, { status: 502 })

    // Only touch the subscription state once Mollie has accepted the payment, so
    // a failed checkout can never downgrade the account. An already-active
    // subscription (tier change) is left untouched: the webhook applies the new
    // tier on payment.paid, and the current one keeps working until then.
    if (u.subscriptionStatus !== 'active') {
      await payload.update({
        collection: 'users',
        id: u.id,
        data: {
          ...(u.role === 'brand' ? { brandTier: tier } : { subscriptionTier: tier }),
          subscriptionStatus: 'pending_payment',
          subscriptionBillingCycle: billingCycle,
          subscriptionCommitment: catalog.billing.monthlyCommitment,
          subscriptionTrialEndsAt: trialEndsAt.toISOString(),
          subscriptionMinimumEndsAt: catalog.billing.monthlyCommitment === 'annual' ? minimumEndsAt.toISOString() : null,
        } as never,
        overrideAccess: true,
      })
    }

    return NextResponse.json({ checkoutUrl })
  } catch (err) {
    // Mollie errors carry internal ids and are never safe to show to a user.
    console.error('[mollie] checkout start failed', err)
    const raw = err instanceof Error ? err.message : ''
    if (raw.includes('No suitable payment methods found')) {
      return NextResponse.json(
        { error: 'Er is momenteel geen betaalmethode beschikbaar voor een abonnement. Neem contact op met Blissify.' },
        { status: 503 },
      )
    }
    return NextResponse.json({ error: 'We konden de betaling niet starten. Probeer het later opnieuw.' }, { status: 500 })
  }
}
