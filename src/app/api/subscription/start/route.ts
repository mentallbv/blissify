import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { createCustomer, createFirstPayment, mollieConfigured, planLabel, updateSubscription, type BillingCycle, type PlanTier } from '@/lib/mollie'
import { SITE_URL } from '@/lib/email'
import { resolvePlan } from '@/lib/subscription-plan'
import { sendEmail, emailHtml } from '@/lib/email'

/** POST /api/subscription/start { tier, billingCycle, method } - create/reuse Mollie customer + first payment. */
export async function POST(req: Request) {
  try {
    if (!mollieConfigured()) {
      return NextResponse.json({ error: 'Betalingen zijn nog niet geconfigureerd (MOLLIE_API_KEY ontbreekt).' }, { status: 503 })
    }
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: await getHeaders() })
    if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })

    const u = user as { id: number; email: string; name?: string; role?: string; mollieCustomerId?: string; mollieSubscriptionId?: string; subscriptionStatus?: string; subscriptionTier?: string; brandTier?: string; subscriptionBillingCycle?: BillingCycle; subscriptionStartedAt?: string; subscriptionExpiresAt?: string; vatNumber?: string; chamberOfCommerceNumber?: string; professionalBuyerConfirmed?: boolean }
    if (u.role !== 'trainer' && u.role !== 'brand') {
      return NextResponse.json({ error: 'Alleen opleiders kunnen een abonnement starten.' }, { status: 400 })
    }
    if ((!u.vatNumber && !u.chamberOfCommerceNumber) || !u.professionalBuyerConfirmed) {
      return NextResponse.json({ error: 'Vul eerst je btw-nummer en/of ondernemingsnummer in en bevestig dat je beroepsmatig handelt.' }, { status: 409 })
    }

    const body = await req.json()
    const tier = body.tier as PlanTier
    const billingCycle: BillingCycle = body.billingCycle === 'monthly' ? 'monthly' : 'yearly'
    const method = typeof body.method === 'string' && body.method ? body.method : undefined

    const plan = await resolvePlan(u.role, tier, billingCycle)
    if (!plan.ok) return NextResponse.json({ error: plan.error }, { status: plan.status })
    let { amount } = plan
    const now = new Date()
    const nextChargeAt = new Date(now)
    if (billingCycle === 'monthly') nextChargeAt.setMonth(nextChargeAt.getMonth() + 1)
    else nextChargeAt.setFullYear(nextChargeAt.getFullYear() + 1)
    const commitment = billingCycle === 'monthly' ? 'cancel_anytime' : 'annual'

    const ladder = u.role === 'brand'
      ? ['partner_listing', 'partner_professional', 'partner_premium']
      : ['basis', 'medium', 'premium']
    const currentTier = (u.role === 'brand' ? u.brandTier : u.subscriptionTier) || ladder[0]
    const currentRank = ladder.indexOf(currentTier)
    const targetRank = ladder.indexOf(tier)
    const isActiveChange = u.subscriptionStatus === 'active' && currentTier !== tier
    const isDowngrade = isActiveChange && targetRank < currentRank

    if (isDowngrade) {
      const effectiveAt = u.subscriptionExpiresAt ? new Date(u.subscriptionExpiresAt) : nextChargeAt
      if (u.mollieCustomerId && u.mollieSubscriptionId) {
        await updateSubscription({ customerId: u.mollieCustomerId, subscriptionId: u.mollieSubscriptionId, tier, amount, billingCycle, userId: u.id })
      }
      await payload.update({
        collection: 'users',
        id: u.id,
        data: { pendingSubscriptionTier: tier, pendingSubscriptionBillingCycle: billingCycle, pendingSubscriptionEffectiveAt: effectiveAt.toISOString() } as never,
        overrideAccess: true,
      })
      await sendEmail({
        to: u.email,
        subject: `Je wijziging naar ${planLabel(tier)} is gepland`,
        html: emailHtml([
          `Je abonnement wordt op ${effectiveAt.toLocaleDateString('nl-BE')} gewijzigd naar ${planLabel(tier)}.`,
          'Tot die datum behoud je alle voordelen van je huidige abonnement.',
          'Als je dan meer actieve opleidingen hebt dan je nieuwe formule toestaat, worden de oudste opleidingen automatisch op concept gezet.',
        ]),
      })
      return NextResponse.json({ scheduled: true, effectiveAt: effectiveAt.toISOString() })
    }

    // An upgrade starts a new period immediately. Credit the unused value of
    // the current paid period against the new plan, exactly as described in the PDF.
    let proratedCredit = 0
    if (isActiveChange && targetRank > currentRank && u.subscriptionStartedAt && u.subscriptionExpiresAt) {
      const currentPlan = await resolvePlan(u.role, currentTier as PlanTier, u.subscriptionBillingCycle || 'yearly')
      const started = new Date(u.subscriptionStartedAt).getTime()
      const expires = new Date(u.subscriptionExpiresAt).getTime()
      const remaining = Math.max(0, expires - now.getTime())
      const duration = Math.max(1, expires - started)
      if (currentPlan.ok) proratedCredit = Number(currentPlan.amount) * Math.min(1, remaining / duration)
      amount = Math.max(0.01, Number(amount) - proratedCredit).toFixed(2)
    }

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
      trialEnabled: false,
      amount,
      method,
      description: `Blissify abonnement - ${planLabel(tier)}`,
      redirectUrl: `${SITE_URL}/dashboard/abonnement?betaling=verwerkt`,
      metadata: {
        userId: u.id,
        tier,
        role: u.role,
        billingCycle,
        amount,
        fullRenewalAmount: plan.amount,
        proratedCredit: proratedCredit.toFixed(2),
        action: isActiveChange ? 'upgrade' : 'activate',
        nextChargeAt: nextChargeAt.toISOString(),
        commitment,
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
          subscriptionCommitment: commitment,
          subscriptionTrialEndsAt: null,
          subscriptionMinimumEndsAt: null,
        } as never,
        overrideAccess: true,
      })
    }

    return NextResponse.json({ checkoutUrl, chargedAmount: amount, proratedCredit: proratedCredit.toFixed(2) })
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
