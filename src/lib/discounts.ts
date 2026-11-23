import type { Payload } from 'payload'
import type { BillingCycle, PlanTier } from '@/lib/mollie'

/**
 * Discount codes for subscriptions (meeting Nov 2026, item 13).
 * All amounts are excl. btw, like every price on Blissify. btw is added afterwards (lib/vat).
 */

export type DiscountCodeDoc = {
  id: number
  code: string
  active?: boolean | null
  discountType: 'percentage' | 'fixed'
  percentage?: number | null
  amount?: number | null
  duration: 'once' | 'repeating' | 'forever'
  durationPayments?: number | null
  validFrom?: string | null
  validUntil?: string | null
  maxRedemptions?: number | null
  maxPerUser?: number | null
  audience?: 'all' | 'trainer' | 'brand' | null
  newCustomersOnly?: boolean | null
  tiers?: string[] | null
  billingCycles?: string[] | null
  timesRedeemed?: number | null
  totalDiscountGiven?: number | null
}

export type AppliedDiscount = {
  code: DiscountCodeDoc
  /** Discount per discounted payment, excl. btw. */
  discount: number
  /** Price of the first payment after discount, excl. btw. */
  discounted: number
  /** Price of the renewals: discounted for "repeating"/"forever", full for "once". */
  renewal: number
  /** Renewals that still get the discount after the first payment (null = always). */
  renewalsWithDiscount: number | null
  /** Human summary, e.g. "20% korting op de eerste 3 betalingen". */
  summary: string
}

export type DiscountResult = { ok: true; applied: AppliedDiscount } | { ok: false; error: string }

/** Mollie needs a real first payment to set up the direct debit; a 100% code still charges this. */
export const MIN_CHARGE = 0.02
/** A pending checkout holds its place under the total limit for this long. */
const PENDING_HOLD_MS = 2 * 60 * 60 * 1000

const round2 = (n: number) => Math.round(n * 100) / 100
const euro = (n: number) => `€ ${n.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function normalizeCode(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim().toUpperCase().replace(/\s+/g, '') : ''
}

export function discountFor(code: DiscountCodeDoc, base: number): number {
  const d = code.discountType === 'percentage' ? (base * Number(code.percentage || 0)) / 100 : Number(code.amount || 0)
  return round2(Math.min(base, Math.max(0, d)))
}

export function describe(code: DiscountCodeDoc): string {
  const what = code.discountType === 'percentage' ? `${Number(code.percentage)}% korting` : `${euro(Number(code.amount || 0))} korting`
  if (code.duration === 'forever') return `${what} op elke betaling`
  if (code.duration === 'repeating') return `${what} op de eerste ${Number(code.durationPayments || 2)} betalingen`
  return `${what} op de eerste betaling`
}

/**
 * Checks every rule of a code for this user and plan and works out the price.
 * `base` is the plan price excl. btw before any discount or upgrade credit.
 */
export async function applyDiscount(
  payload: Payload,
  opts: { code: string; user: { id: number; role?: string }; tier: PlanTier; billingCycle: BillingCycle; base: number },
): Promise<DiscountResult> {
  const code = normalizeCode(opts.code)
  if (!code) return { ok: false, error: 'Vul een kortingscode in.' }
  const found = await payload.find({ collection: 'discount-codes' as never, where: { code: { equals: code } } as never, limit: 1, depth: 0, overrideAccess: true })
  const doc = found.docs[0] as unknown as DiscountCodeDoc | undefined
  const invalid = { ok: false as const, error: 'Deze kortingscode bestaat niet of is niet meer geldig.' }
  if (!doc || !doc.active) return invalid

  const now = Date.now()
  if (doc.validFrom && new Date(doc.validFrom).getTime() > now) return { ok: false, error: 'Deze kortingscode is nog niet geldig.' }
  if (doc.validUntil && new Date(doc.validUntil).getTime() < now) return { ok: false, error: 'Deze kortingscode is verlopen.' }

  if (doc.audience === 'trainer' && opts.user.role !== 'trainer') return { ok: false, error: 'Deze kortingscode geldt alleen voor salons en academies.' }
  if (doc.audience === 'brand' && opts.user.role !== 'brand') return { ok: false, error: 'Deze kortingscode geldt alleen voor merken en leveranciers.' }
  if (doc.tiers?.length && !doc.tiers.includes(opts.tier)) return { ok: false, error: 'Deze kortingscode geldt niet voor deze formule.' }
  if (doc.billingCycles?.length && !doc.billingCycles.includes(opts.billingCycle)) {
    return { ok: false, error: `Deze kortingscode geldt alleen bij ${doc.billingCycles.includes('yearly') ? 'jaarlijkse' : 'maandelijkse'} facturatie.` }
  }

  const redemptions = 'discount-redemptions' as never
  if (doc.maxRedemptions) {
    const used = await payload.count({
      collection: redemptions,
      where: {
        and: [
          { discountCode: { equals: doc.id } },
          { user: { not_equals: opts.user.id } },
          { or: [{ status: { equals: 'redeemed' } }, { and: [{ status: { equals: 'pending' } }, { createdAt: { greater_than: new Date(now - PENDING_HOLD_MS).toISOString() } }] }] },
        ],
      } as never,
      overrideAccess: true,
    })
    const mine = await payload.count({ collection: redemptions, where: { and: [{ discountCode: { equals: doc.id } }, { user: { equals: opts.user.id } }, { status: { equals: 'redeemed' } }] } as never, overrideAccess: true })
    if (used.totalDocs + mine.totalDocs >= doc.maxRedemptions) return { ok: false, error: 'Deze kortingscode is al het maximale aantal keer gebruikt.' }
  }
  if (doc.maxPerUser) {
    const mine = await payload.count({ collection: redemptions, where: { and: [{ discountCode: { equals: doc.id } }, { user: { equals: opts.user.id } }, { status: { equals: 'redeemed' } }] } as never, overrideAccess: true })
    if (mine.totalDocs >= doc.maxPerUser) return { ok: false, error: 'Je hebt deze kortingscode al gebruikt.' }
  }
  if (doc.newCustomersOnly) {
    const paid = await payload.count({ collection: 'invoices', where: { user: { equals: opts.user.id } } as never, overrideAccess: true })
    if (paid.totalDocs > 0) return { ok: false, error: 'Deze kortingscode geldt alleen voor nieuwe klanten.' }
  }

  const base = round2(opts.base)
  const discount = discountFor(doc, base)
  const discounted = round2(Math.max(MIN_CHARGE, base - discount))
  const recurring = doc.duration === 'forever' || doc.duration === 'repeating'
  return {
    ok: true,
    applied: {
      code: doc,
      discount,
      discounted,
      renewal: recurring ? discounted : base,
      renewalsWithDiscount: doc.duration === 'repeating' ? Math.max(0, Number(doc.durationPayments || 2) - 1) : doc.duration === 'forever' ? null : 0,
      summary: describe(doc),
    },
  }
}

/** Reuses the user's open checkout for the same code, so retrying does not stack up rows. */
export async function recordPendingRedemption(
  payload: Payload,
  opts: { applied: AppliedDiscount; userId: number; paymentId: string; tier: PlanTier; billingCycle: BillingCycle; base: number },
): Promise<number | null> {
  const redemptions = 'discount-redemptions' as never
  const data = {
    discountCode: opts.applied.code.id,
    codeText: opts.applied.code.code,
    user: opts.userId,
    status: 'pending',
    molliePaymentId: opts.paymentId,
    tier: opts.tier,
    billingCycle: opts.billingCycle,
    fullAmount: round2(opts.base),
    discountAmount: opts.applied.discount,
    paymentsLeft: opts.applied.renewalsWithDiscount,
  }
  try {
    const open = await payload.find({ collection: redemptions, where: { and: [{ discountCode: { equals: opts.applied.code.id } }, { user: { equals: opts.userId } }, { status: { equals: 'pending' } }] } as never, limit: 1, depth: 0, overrideAccess: true })
    const existing = open.docs[0] as { id: number } | undefined
    const doc = existing
      ? await payload.update({ collection: redemptions, id: existing.id, data: data as never, overrideAccess: true })
      : await payload.create({ collection: redemptions, data: data as never, overrideAccess: true })
    return (doc as { id: number }).id
  } catch (err) {
    console.error('[discounts] could not record redemption', err)
    return null
  }
}

export type RedemptionDoc = {
  id: number
  discountCode?: number | { id: number } | null
  codeText?: string | null
  status: 'pending' | 'redeemed' | 'failed'
  tier?: string | null
  billingCycle?: string | null
  fullAmount?: number | null
  discountAmount?: number | null
  paymentsLeft?: number | null
  mollieSubscriptionId?: string | null
}

/** Adds one discounted payment to the code's statistics. */
export async function countUse(payload: Payload, r: RedemptionDoc, firstUse: boolean): Promise<void> {
  const codeId = typeof r.discountCode === 'object' && r.discountCode ? r.discountCode.id : r.discountCode
  if (!codeId) return
  const code = (await payload.findByID({ collection: 'discount-codes' as never, id: codeId, depth: 0, overrideAccess: true }).catch(() => null)) as DiscountCodeDoc | null
  if (!code) return
  await payload.update({
    collection: 'discount-codes' as never,
    id: codeId,
    data: {
      ...(firstUse ? { timesRedeemed: Number(code.timesRedeemed || 0) + 1 } : {}),
      totalDiscountGiven: round2(Number(code.totalDiscountGiven || 0) + Number(r.discountAmount || 0)),
    } as never,
    overrideAccess: true,
  })
}

export function discountMemo(codeText: string | null | undefined, discount: number | null | undefined): string {
  return codeText && discount ? `Korting (${codeText}): ${euro(Number(discount))} excl. btw.` : ''
}
