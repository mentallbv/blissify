import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-vercel-postgres'

/**
 * New prices (Lonne, Nov 2026). annualPrice is the yearly invoice; monthlyPrice
 * is the price when paying per month. The site shows both as a per-month amount.
 * Only prices and the "2 maanden gratis" wording change; other CMS texts stay.
 */
const PRICES: Record<string, { monthlyPrice: number; annualPrice: number }> = {
  basis: { monthlyPrice: 19, annualPrice: 180 },
  medium: { monthlyPrice: 45, annualPrice: 420 },
  premium: { monthlyPrice: 79, annualPrice: 708 },
  partner_listing: { monthlyPrice: 29, annualPrice: 276 },
  partner_professional: { monthlyPrice: 59, annualPrice: 540 },
  partner_premium: { monthlyPrice: 99, annualPrice: 948 },
}

const SUBTITLE_FIX = (s?: string) =>
  (s || '').replace(/,? ?met twee maanden gratis bij jaarlijkse betaling/i, '. Bij jaarlijkse betaling betaal je minder per maand').replace(/\.\./g, '.')

type Tier = { key?: string; monthlyPrice?: number; annualPrice?: number; price?: string }
type Audience = { intro?: { subtitle?: string }; tiers?: Tier[] }

const patch = (a?: Audience): Audience | undefined =>
  a && {
    ...a,
    intro: a.intro ? { ...a.intro, subtitle: SUBTITLE_FIX(a.intro.subtitle) } : a.intro,
    tiers: (a.tiers || []).map((t) => {
      const p = t.key ? PRICES[t.key] : undefined
      return p ? { ...t, ...p, price: `€ ${p.annualPrice.toLocaleString('nl-BE')}` } : t
    }),
  }

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const g = (await payload.findGlobal({ slug: 'pricing' as never, depth: 0 })) as unknown as { opleiders?: Audience; brands?: Audience }
  await payload.updateGlobal({ slug: 'pricing' as never, data: { opleiders: patch(g.opleiders), brands: patch(g.brands) } as never })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // Price change only; earlier values can be restored from a version in the admin.
}
