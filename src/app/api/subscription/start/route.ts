import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { createCustomer, createFirstPayment, mollieConfigured, planLabel, updateSubscription, type BillingCycle, type PlanTier } from '@/lib/mollie'
import { SITE_URL } from '@/lib/email'
import { planChange, resolvePlan } from '@/lib/subscription-plan'
import { sendEmail, emailHtml } from '@/lib/email'
import { applyDiscount, normalizeCode, recordPendingRedemption, type AppliedDiscount } from '@/lib/discounts'
import { billingComplete, checkVies, invoiceCountry, quote, type BillingUser } from '@/lib/vat'

/** POST /api/subscription/start { tier, billingCycle, method } - create/reuse Mollie customer + first payment. */
export async function POST(req: Request) {
  try {
    if (!mollieConfigured()) {
      return NextResponse.json({ error: 'Betalingen zijn nog niet geconfigureerd (MOLLIE_API_KEY ontbreekt).' }, { status: 503 })
    }
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: await getHeaders() })
    if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })

    const u = user as { id: number; email: string; name?: string; role?: string; mollieCustomerId?: string; mollieSubscriptionId?: string; subscriptionStatus?: string; subscriptionTier?: string; brandTier?: string; subscriptionBillingCycle?: BillingCycle; subscriptionStartedAt?: string; subscriptionExpiresAt?: string; vatNumber?: string; chamberOfCommerceNumber?: string; professionalBuyerConfirmed?: boolean } & BillingUser
    if (u.role !== 'trainer' && u.role !== 'brand') {
      return NextResponse.json({ error: 'Alleen opleiders kunnen een abonnement starten.' }, { status: 400 })
    }
    if ((!u.vatNumber && !u.chamberOfCommerceNumber) || !u.professionalBuyerConfirmed) {
      return NextResponse.json({ error: 'Vul eerst je btw-nummer en/of ondernemingsnummer in en bevestig dat je beroepsmatig handelt.' }, { status: 409 })
    }
    // Every payment gets an invoice, so the invoice details must be complete first.
    if (!billingComplete(u)) {
      return NextResponse.json({ error: 'Vul eerst je facturatiegegevens in (bedrijfsnaam, adres, btw-nummer).', code: 'billing_incomplete' }, { status: 409 })
    }
    // Reverse charge needs a VIES-verified number; retry when VIES was down at save time.
    if (invoiceCountry(u) !== 'BE' && u.vatNumber && !u.vatVerifiedAt) {
      const vies = await checkVies(u.vatNumber)
      if (vies?.valid) {
        u.vatVerifiedAt = new Date().toISOString()
        await payload.update({ collection: 'users', id: u.id, data: { vatVerifiedAt: u.vatVerifiedAt } as never, overrideAccess: true })
      }
    }

    const body = await req.json()
    const tier = body.tier as PlanTier
    const billingCycle: BillingCycle = body.billingCycle === 'monthly' ? 'monthly' : 'yearly'
    const method = typeof body.method === 'string' && body.method ? body.method : undefined

    const plan = await resolvePlan(u.role, tier, billingCycle)
    if (!plan.ok) return NextResponse.json({ error: plan.error }, { status: plan.status })
    let { amount } = plan
    // Item 13: optional discount code. Checked again here, whatever the price preview said.
    const discountCode = normalizeCode(body.discountCode)
    let discount: AppliedDiscount | null = null
    if (discountCode) {
      const res = await applyDiscount(payload, { code: discountCode, user: u, tier, billingCycle, base: Number(plan.amount) })
      if (!res.ok) return NextResponse.json({ error: res.error, code: 'discount_invalid' }, { status: 400 })
      discount = res.applied
      amount = discount.discounted.toFixed(2)
    }
    const now = new Date()
    const nextChargeAt = new Date(now)
    if (billingCycle === 'monthly') nextChargeAt.setMonth(nextChargeAt.getMonth() + 1)
    else nextChargeAt.setFullYear(nextChargeAt.getFullYear() + 1)
    const commitment = billingCycle === 'monthly' ? 'cancel_anytime' : 'annual'

    const change = await planChange(u, tier, billingCycle, now)
    const isActiveChange = change.kind !== 'new'
    const isDowngrade = change.kind === 'downgrade'

    if (isDowngrade && discount) {
      return NextResponse.json({ error: 'Een kortingscode kan niet bij een overstap naar een kleinere formule. Laat het veld leeg.', code: 'discount_invalid' }, { status: 400 })
    }
    if (isDowngrade) {
      const effectiveAt = new Date(change.effectiveAt)
      if (u.mollieCustomerId && u.mollieSubscriptionId) {
        await updateSubscription({ customerId: u.mollieCustomerId, subscriptionId: u.mollieSubscriptionId, tier, amount: quote(amount, u).gross, billingCycle, userId: u.id })
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

    // An upgrade starts a new period immediately; the unused value of the current paid
    // period is credited (lib/subscription-plan planChange, same numbers as the preview).
    const proratedCredit = change.kind === 'upgrade' ? change.credit : 0
    if (proratedCredit > 0) amount = Math.max(0.01, Number(amount) - proratedCredit).toFixed(2)

    // Prices are excl. btw; Mollie charges the total incl. btw (lib/vat).
    const charge = quote(amount, u)
    const renewal = quote(discount ? discount.renewal.toFixed(2) : plan.amount, u)

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
      amount: charge.gross,
      method,
      description: `Blissify abonnement - ${planLabel(tier)}`,
      redirectUrl: `${SITE_URL}/dashboard/abonnement?betaling=verwerkt`,
      metadata: {
        userId: u.id,
        tier,
        role: u.role,
        billingCycle,
        amount: charge.gross,
        netAmount: charge.net,
        vatRate: charge.rate,
        fullRenewalAmount: renewal.gross,
        proratedCredit: proratedCredit.toFixed(2),
        action: isActiveChange ? 'upgrade' : 'activate',
        nextChargeAt: nextChargeAt.toISOString(),
        commitment,
        ...(discount ? { discountCode: discount.code.code, discountAmount: discount.discount.toFixed(2) } : {}),
      },
    })

    const checkoutUrl = payment._links?.checkout?.href
    if (!checkoutUrl) return NextResponse.json({ error: 'Kon de betaling niet starten.' }, { status: 502 })
    // The webhook finds this row by payment id and marks it used once Mollie confirms the payment.
    if (discount) await recordPendingRedemption(payload, { applied: discount, userId: u.id, paymentId: payment.id, tier, billingCycle, base: Number(plan.amount) })

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

    return NextResponse.json({ checkoutUrl, chargedAmount: charge.gross, netAmount: charge.net, vatAmount: charge.vat, vatRate: charge.rate, proratedCredit: proratedCredit.toFixed(2), ...(discount ? { discount: discount.discount.toFixed(2), discountSummary: discount.summary } : {}) })
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
