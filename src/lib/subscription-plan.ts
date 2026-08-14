import { getPricingCatalog } from '@/lib/data'
import { monthlyPrice } from '@/lib/pricing'
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
  const amount = (billingCycle === 'monthly' ? monthlyPrice(annualPrice, catalog.billing.monthlyMarkupPercent) : annualPrice).toFixed(2)
  return { ok: true, amount, catalog }
}

/**
 * How many published courses exceed what `tier` allows. Zero for an upgrade or
 * an unlimited tier. Used to stop a downgrade from quietly unpublishing work -
 * the user chooses what to keep instead.
 */
export async function publishedCoursesOverLimit(
  payload: { find: (args: never) => Promise<{ docs: { id: number | string }[] }>; count: (args: never) => Promise<{ totalDocs: number }> },
  userId: number,
  role: string,
  tier: PlanTier,
): Promise<number> {
  const limit = tierFeatures(role === 'brand' ? 'brand' : 'trainer', tier).courseLimit
  if (limit === Infinity) return 0

  const collection = role === 'brand' ? 'brands' : 'trainers'
  const profiles = await payload.find({ collection, where: { owner: { equals: userId } }, limit: 1, depth: 0, overrideAccess: true } as never)
  const profile = profiles.docs[0]
  if (!profile) return 0

  const relationship = role === 'brand' ? 'brand' : 'trainer'
  const published = await payload.count({
    collection: 'courses',
    where: { and: [{ status: { equals: 'published' } }, { [relationship]: { equals: profile.id } }] },
    overrideAccess: true,
  } as never)

  return Math.max(0, published.totalDocs - limit)
}

/** Mollie charges a small authorisation instead of the plan price during a trial. */
export function chargeAmount(amount: string, trialEnabled: boolean): string {
  return trialEnabled ? '0.02' : amount
}
