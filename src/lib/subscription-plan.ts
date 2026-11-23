import { getPricingCatalog } from '@/lib/data'
import { isBrandTier, isTrainerTier, type BillingCycle, type PlanTier } from '@/lib/mollie'
import { tierFeatures } from '@/lib/tier-features'

export type ResolvedPlan =
  | { ok: true; amount: string; catalog: Awaited<ReturnType<typeof getPricingCatalog>> }
  | { ok: false; error: string; status: number }

/**
 * Validates a tier against the role's ladder and resolves the charge amount from
 * the Pricing global. Shared by /api/subscription/start and /methods so both
 * always price a plan the same way.
 */
export async function resolvePlan(role: string, tier: PlanTier, billingCycle: BillingCycle): Promise<ResolvedPlan> {
  if ((!isTrainerTier(tier) && !isBrandTier(tier)) || (role === 'brand' ? !isBrandTier(tier) : !isTrainerTier(tier))) {
    return { ok: false, error: 'Ongeldige formule.', status: 400 }
  }
  const catalog = await getPricingCatalog()
  if (billingCycle === 'monthly' && !catalog.billing.monthlyEnabled) {
    return { ok: false, error: 'Maandelijkse betaling is niet beschikbaar.', status: 400 }
  }
  const audience = role === 'brand' ? catalog.brands : catalog.opleiders
  const selected = audience.tiers.find((item) => item.key === tier)
  if (!selected) return { ok: false, error: 'Ongeldige formule.', status: 400 }

  const annualPrice = selected.annualPrice || Number(selected.price.replace(/[^\d]/g, ''))
  const amount = (billingCycle === 'monthly' ? selected.monthlyPrice || annualPrice / 10 : annualPrice).toFixed(2)
  return { ok: true, amount, catalog }
}

/** Blissify 2.0 has no free trial, so the selected period is charged immediately. */
export function chargeAmount(amount: string, _trialEnabled = false): string {
  return amount
}

/**
 * What a plan choice means for a user who may already pay (item 14, Lonne's terms):
 * - upgrade: starts now; the unused part of the current paid period is credited pro rata;
 * - downgrade: starts at the end of the current period, nothing is charged now;
 * - new: no active subscription, or the same formule.
 * Shared by the price preview (/methods) and the checkout (/start) so both show the same numbers.
 */
export type PlanChange =
  | { kind: 'new'; credit: 0 }
  | { kind: 'upgrade'; credit: number; currentTier: string; periodEnd: string | null }
  | { kind: 'downgrade'; credit: 0; currentTier: string; effectiveAt: string }

type ChangeUser = {
  role?: string
  subscriptionStatus?: string
  subscriptionTier?: string
  brandTier?: string
  subscriptionBillingCycle?: BillingCycle
  subscriptionStartedAt?: string
  subscriptionExpiresAt?: string
}

export async function planChange(u: ChangeUser, tier: PlanTier, billingCycle: BillingCycle, now = new Date()): Promise<PlanChange> {
  const ladder = u.role === 'brand' ? ['partner_listing', 'partner_professional', 'partner_premium'] : ['basis', 'medium', 'premium']
  const currentTier = (u.role === 'brand' ? u.brandTier : u.subscriptionTier) || ladder[0]
  if (u.subscriptionStatus !== 'active' || currentTier === tier) return { kind: 'new', credit: 0 }
  if (ladder.indexOf(tier) < ladder.indexOf(currentTier)) {
    const next = new Date(now)
    if (billingCycle === 'monthly') next.setMonth(next.getMonth() + 1)
    else next.setFullYear(next.getFullYear() + 1)
    return { kind: 'downgrade', credit: 0, currentTier, effectiveAt: (u.subscriptionExpiresAt ? new Date(u.subscriptionExpiresAt) : next).toISOString() }
  }
  let credit = 0
  if (u.subscriptionStartedAt && u.subscriptionExpiresAt) {
    const current = await resolvePlan(u.role || '', currentTier as PlanTier, u.subscriptionBillingCycle || 'yearly')
    const started = new Date(u.subscriptionStartedAt).getTime()
    const expires = new Date(u.subscriptionExpiresAt).getTime()
    const remaining = Math.max(0, expires - now.getTime())
    const duration = Math.max(1, expires - started)
    if (current.ok) credit = Math.round(Number(current.amount) * Math.min(1, remaining / duration) * 100) / 100
  }
  return { kind: 'upgrade', credit, currentTier, periodEnd: u.subscriptionExpiresAt || null }
}
