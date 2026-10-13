import type { CourseFilters, CourseSort } from '@/lib/data'

type SearchParams = Record<string, string | string[] | undefined>

const one = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v || '')

const SORTS: CourseSort[] = ['relevant', 'price-asc', 'recent']
// Only values the DB enum knows; a stale link (e.g. the removed 'kleine-groepen')
// would otherwise make the query fail.
const LANGUAGE_VALUES = new Set(['nl', 'fr', 'en'])
const AUDIENCE_VALUES = new Set(['beginner-friendly', 'intermediate', 'expert-advanced'])
const PRACTICAL_VALUES = new Set(['online', 'praktijkopleiding', 'een-dag', 'meerdere-dagen', 'op-locatie'])
const many = (value: string | string[] | undefined): string[] =>
  one(value).split(',').map((item) => item.trim()).filter(Boolean)

/** Maps URL query params (Dutch keys) to a typed CourseFilters object. */
export function parseCourseFilters(sp: SearchParams): CourseFilters {
  const sortRaw = one(sp.sort) as CourseSort
  const prijsMax = Number(one(sp.prijsMax))
  const prijsMin = Number(one(sp.prijsMin))
  return {
    categorySlug: one(sp.categorie) || undefined,
    city: one(sp.locatie) || undefined,
    format: one(sp.format) || undefined,
    certificate: one(sp.erkend) === 'true' || undefined,
    certificationTypes: many(sp.certificering),
    keyword: one(sp.keyword) || undefined,
    providerType: one(sp.aanbieder) === 'brand' ? 'brand' : one(sp.aanbieder) === 'trainer' ? 'trainer' : undefined,
    targetAudiences: many(sp.doelgroep).filter((v) => AUDIENCE_VALUES.has(v)),
    practical: many(sp.praktisch).filter((v) => PRACTICAL_VALUES.has(v)),
    focus: many(sp.focus),
    languages: many(sp.taal).filter((v) => LANGUAGE_VALUES.has(v)),
    popular: one(sp.populair) === 'true' || undefined,
    free: one(sp.gratis) === 'true' || undefined,
    newOnly: one(sp.nieuw) === 'true' || undefined,
    priceMin: Number.isFinite(prijsMin) && prijsMin > 0 ? prijsMin : undefined,
    priceMax: Number.isFinite(prijsMax) && prijsMax > 0 ? prijsMax : undefined,
    sort: SORTS.includes(sortRaw) ? sortRaw : 'relevant',
  }
}
