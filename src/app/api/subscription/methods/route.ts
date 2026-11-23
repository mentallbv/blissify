import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { listFirstPaymentMethods, mollieConfigured, planLabel, type BillingCycle, type PlanTier } from '@/lib/mollie'
import { planChange, resolvePlan } from '@/lib/subscription-plan'
import { billingComplete, quote, type BillingUser } from '@/lib/vat'
import { applyDiscount, normalizeCode } from '@/lib/discounts'

/**
 * GET /api/subscription/methods?tier=&billingCycle= - payment methods the user
 * can pick for this plan. Only mandate-capable methods qualify; an empty list
 * means no such method is enabled on the Mollie account, which is a
 * configuration problem rather than a user error.
 */
export async function GET(req: Request) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: await getHeaders() })
    if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })

    const u = user as { id: number; role?: string; subscriptionStatus?: string; subscriptionTier?: string; brandTier?: string; subscriptionBillingCycle?: BillingCycle; subscriptionStartedAt?: string; subscriptionExpiresAt?: string } & BillingUser
    if (u.role !== 'trainer' && u.role !== 'brand') {
      return NextResponse.json({ error: 'Alleen opleiders en merken kunnen een abonnement starten.' }, { status: 400 })
    }

    const url = new URL(req.url)
    const tier = (url.searchParams.get('tier') || '') as PlanTier
    const billingCycle: BillingCycle = url.searchParams.get('billingCycle') === 'monthly' ? 'monthly' : 'yearly'

    const plan = await resolvePlan(u.role, tier, billingCycle)
    if (!plan.ok) return NextResponse.json({ error: plan.error }, { status: plan.status })

    // Item 13: ?code= previews a discount code. An invalid code returns its reason, with the normal price.
    const code = normalizeCode(url.searchParams.get('code'))
    let discount: { code: string; amount: string; full: string; summary: string } | null = null
    let discountError: string | null = null
    let net = plan.amount
    if (code) {
      const res = await applyDiscount(payload, { code, user: u, tier, billingCycle, base: Number(plan.amount) })
      if (res.ok) {
        net = res.applied.discounted.toFixed(2)
        discount = { code: res.applied.code.code, amount: res.applied.discount.toFixed(2), full: Number(plan.amount).toFixed(2), summary: res.applied.summary }
      } else discountError = res.error
    }
    // Item 14: switching plans. Upgrade = now, minus the unused part of the current period;
    // downgrade = at the end of the period, nothing to pay now. Same calculation as /start.
    const change = await planChange(u, tier, billingCycle)
    const renewal = quote(net, u)
    if (change.kind === 'upgrade' && change.credit > 0) net = Math.max(0.01, Number(net) - change.credit).toFixed(2)
    const changeInfo = change.kind === 'new' ? null : {
      kind: change.kind,
      fromLabel: planLabel(change.currentTier as PlanTier),
      toLabel: planLabel(tier),
      credit: change.credit.toFixed(2),
      effectiveAt: change.kind === 'downgrade' ? change.effectiveAt : null,
      periodEnd: change.kind === 'upgrade' ? change.periodEnd : null,
      renewal,
    }
    // The price summary (excl. btw, btw, total) is shown before the user pays.
    const price = quote(net, u)
    const methods = mollieConfigured() ? await listFirstPaymentMethods(price.gross) : []
    return NextResponse.json({
      price,
      discount,
      discountError,
      change: changeInfo,
      billingComplete: billingComplete(u),
      methods: methods.map((m) => ({ id: m.id, description: m.description, image: m.image?.svg || m.image?.size2x || null })),
    })
  } catch (err) {
    console.error('[mollie] listing payment methods failed', err)
    // A failed lookup must not block checkout - the caller falls back to
    // Mollie's own picker on the hosted checkout page.
    return NextResponse.json({ methods: [] })
  }
}
