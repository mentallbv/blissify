import type { CourseFilters, CourseSort } from '@/lib/data'

type SearchParams = Record<string, string | string[] | undefined>

const one = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v || '')

const SORTS: CourseSort[] = ['relevant', 'price-asc', 'recent']
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
    keyword: one(sp.keyword) || undefined,
    providerType: one(sp.aanbieder) === 'brand' ? 'brand' : one(sp.aanbieder) === 'trainer' ? 'trainer' : undefined,
    targetAudiences: many(sp.doelgroep),
    practical: many(sp.praktisch),
    focus: many(sp.focus),
    popular: one(sp.populair) === 'true' || undefined,
    free: one(sp.gratis) === 'true' || undefined,
    newOnly: one(sp.nieuw) === 'true' || undefined,
    priceMin: Number.isFinite(prijsMin) && prijsMin > 0 ? prijsMin : undefined,
    priceMax: Number.isFinite(prijsMax) && prijsMax > 0 ? prijsMax : undefined,
    sort: SORTS.includes(sortRaw) ? sortRaw : 'relevant',
  }
}
