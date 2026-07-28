import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { createCustomer, createFirstPayment, isBrandTier, isTrainerTier, mollieConfigured, planLabel, type BillingCycle, type PlanTier } from '@/lib/mollie'
import { SITE_URL } from '@/lib/email'
import { getPricingCatalog } from '@/lib/data'
import { monthlyPrice } from '@/lib/pricing'

/** POST /api/subscription/start { tier } - create/reuse Mollie customer + first payment. */
export async function POST(req: Request) {
  try {
    if (!mollieConfigured()) {
      return NextResponse.json({ error: 'Betalingen zijn nog niet geconfigureerd (MOLLIE_API_KEY ontbreekt).' }, { status: 503 })
    }
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: await getHeaders() })
    if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })

    const u = user as { id: number; email: string; name?: string; role?: string; mollieCustomerId?: string }
    if (u.role !== 'trainer' && u.role !== 'brand') {
      return NextResponse.json({ error: 'Alleen opleiders kunnen een abonnement starten.' }, { status: 400 })
    }

    const body = await req.json()
    const tier = body.tier as PlanTier
    const billingCycle: BillingCycle = body.billingCycle === 'monthly' ? 'monthly' : 'yearly'
    if ((!isTrainerTier(tier) && !isBrandTier(tier)) || (u.role === 'brand' ? !isBrandTier(tier) : !isTrainerTier(tier))) {
      return NextResponse.json({ error: 'Ongeldige formule.' }, { status: 400 })
    }
    const catalog = await getPricingCatalog()
    if (billingCycle === 'monthly' && !catalog.billing.monthlyEnabled) {
      return NextResponse.json({ error: 'Maandelijkse betaling is niet beschikbaar.' }, { status: 400 })
    }
    const audience = u.role === 'brand' ? catalog.brands : catalog.opleiders
    const selected = audience.tiers.find((item) => item.key === tier)
    if (!selected) return NextResponse.json({ error: 'Ongeldige formule.' }, { status: 400 })
    const annualPrice = selected.annualPrice || Number(selected.price.replace(/[^\d]/g, ''))
    const amount = (billingCycle === 'monthly' ? monthlyPrice(annualPrice, catalog.billing.monthlyMarkupPercent) : annualPrice).toFixed(2)
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

    // Reuse the customer if we already created one for this user.
    let customerId = u.mollieCustomerId
    if (!customerId) {
      const customer = await createCustomer(u.name || u.email, u.email)
      customerId = customer.id
    }

    // Persist the chosen tier + mark pending_payment before redirecting to Mollie.
    // This stores the selection so the dashboard banner can re-trigger checkout,
    // and keeps status non-active until the webhook confirms payment.paid.
    await payload.update({
      collection: 'users',
      id: u.id,
      data: {
        mollieCustomerId: customerId,
        ...(u.role === 'brand' ? { brandTier: tier } : { subscriptionTier: tier }),
        subscriptionStatus: 'pending_payment',
        subscriptionBillingCycle: billingCycle,
        subscriptionCommitment: catalog.billing.monthlyCommitment,
        subscriptionTrialEndsAt: trialEndsAt.toISOString(),
        subscriptionMinimumEndsAt: catalog.billing.monthlyCommitment === 'annual' ? minimumEndsAt.toISOString() : null,
      } as never,
      overrideAccess: true,
    })

    const payment = await createFirstPayment({
      customerId,
      tier,
      trialEnabled: catalog.billing.trialEnabled,
      amount,
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
      },
    })

    const checkoutUrl = payment._links?.checkout?.href
    if (!checkoutUrl) return NextResponse.json({ error: 'Kon de betaling niet starten.' }, { status: 502 })
    return NextResponse.json({ checkoutUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Er ging iets mis.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
