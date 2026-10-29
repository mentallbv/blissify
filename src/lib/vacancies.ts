import { getPayload } from 'payload'
import config from '@/payload.config'
import { publicMediaUrl } from '@/lib/media'
import { tierForUser } from '@/lib/tier-features'
import type { MerkenFacets, MerkenGroup } from '@/lib/merken-filters'
import {
  VACANCY_FUNCTIONS,
  VACANCY_REGIMES,
  VACANCY_REGIME_FILTER,
  VACANCY_SECTORS,
  VACANCY_TYPES,
  VACANCY_TYPE_FILTER,
  labelOf,
} from '@/lib/vacancy-options'

/** Public side of Vacatures & samenwerkingen: cards, filters and the detail page. */

export type VacancyCardData = {
  id: number
  slug: string
  href: string
  title: string
  companyName: string
  city: string
  country: 'be' | 'nl'
  types: string[]
  sectors: string[]
  regimes: string[]
  intro: string
  logo: string | null
  publishedAt: string
  isUltimate: boolean
}

export type VacancyFilters = { land?: string; locatie?: string; type?: string[]; sector?: string[]; regime?: string[]; q?: string; functions?: string[] }

const client = async () => getPayload({ config: await config })
const rel = (v: unknown) => (v && typeof v === 'object' ? (v as Record<string, any>) : null)

/** Ultimate accounts get priority (plan perk), same rule as courses. */
function ownerFeatures(doc: Record<string, any>) {
  const profile = rel(doc.brand) || rel(doc.trainer)
  const owner = rel(profile?.owner)
  return owner ? tierForUser({ ...owner, role: doc.brand ? 'brand' : 'trainer' }).features : null
}

function toCard(doc: Record<string, any>): VacancyCardData {
  const text = [doc.whoWeSeek, doc.aboutCompany, doc.whatWeOffer].find((t) => typeof t === 'string' && t.trim()) || ''
  return {
    id: doc.id,
    slug: doc.slug,
    href: `/vacatures/${doc.slug}`,
    title: doc.title,
    companyName: doc.companyName,
    city: doc.city,
    country: doc.country === 'nl' ? 'nl' : 'be',
    types: doc.types || [],
    sectors: doc.sectors || [],
    regimes: doc.regimes || [],
    intro: text.length > 220 ? `${text.slice(0, 217).trim()}…` : text,
    logo: publicMediaUrl(doc.logo) || publicMediaUrl(rel(doc.brand)?.logo) || publicMediaUrl(rel(doc.trainer)?.photo),
    publishedAt: doc.createdAt,
    isUltimate: (ownerFeatures(doc)?.searchPriority || 0) >= 3,
  }
}

const expand = (picked: string[] | undefined, groups: { value: string }[], key: 'types' | 'regimes') =>
  (picked || []).flatMap((p) => ((groups as Record<string, any>[]).find((g) => g.value === p)?.[key] as string[]) || [])

export async function getVacancyCards(f: VacancyFilters = {}): Promise<VacancyCardData[]> {
  try {
    const payload = await client()
    const and: Record<string, unknown>[] = [{ status: { equals: 'published' } }]
    if (f.land === 'be' || f.land === 'nl') and.push({ country: { equals: f.land } })
    if (f.locatie) and.push({ city: { equals: f.locatie } })
    const types = expand(f.type, VACANCY_TYPE_FILTER, 'types')
    if (types.length) and.push({ types: { in: types } })
    if (f.sector?.length) and.push({ sectors: { in: f.sector } })
    const regimes = expand(f.regime, VACANCY_REGIME_FILTER, 'regimes')
    if (regimes.length) and.push({ regimes: { in: regimes } })
    if (f.functions?.length) and.push({ functions: { in: f.functions } })
    if (f.q) and.push({ or: [{ title: { like: f.q } }, { companyName: { like: f.q } }] })
    const res = await payload.find({ collection: 'vacancies', where: { and } as never, depth: 2, limit: 200, sort: '-createdAt' })
    const cards = (res.docs as Record<string, any>[]).map(toCard)
    // Ultimate first, newest first within each group.
    return cards.sort((a, b) => Number(b.isUltimate) - Number(a.isUltimate))
  } catch {
    return []
  }
}

export async function getVacancyFilterOptions(land?: string): Promise<{ groups: MerkenGroup[]; facets: MerkenFacets }> {
  const facets: MerkenFacets = {}
  const inc = (g: string, v: string) => {
    facets[g] ||= {}
    facets[g][v] = (facets[g][v] || 0) + 1
  }
  const live: { be: string[]; nl: string[] } = { be: [], nl: [] }
  try {
    const payload = await client()
    const res = await payload.find({ collection: 'vacancies', where: { status: { equals: 'published' } } as never, depth: 0, limit: 1000 })
    for (const d of res.docs as Record<string, any>[]) {
      const country = d.country === 'nl' ? 'nl' : 'be'
      inc('land', country)
      if (d.city) {
        inc('locatie', d.city)
        live[country].push(d.city)
      }
      for (const g of VACANCY_TYPE_FILTER) if (g.types.some((t) => (d.types || []).includes(t))) inc('type', g.value)
      for (const s of d.sectors || []) inc('sector', s)
      for (const g of VACANCY_REGIME_FILTER) if (g.regimes.some((r) => (d.regimes || []).includes(r))) inc('regime', g.value)
    }
  } catch {
    /* empty facets */
  }
  // Only cities that actually have vacancies; per country when a land is chosen.
  const byCountry = { be: Array.from(new Set(live.be)).sort((a, b) => a.localeCompare(b, 'nl-BE')), nl: Array.from(new Set(live.nl)).sort((a, b) => a.localeCompare(b, 'nl-BE')) }
  const cityOptions =
    land === 'be' || land === 'nl'
      ? byCountry[land].map((c) => ({ value: c, label: c }))
      : [...byCountry.be.map((c) => ({ value: c, label: c, group: 'België' })), ...byCountry.nl.map((c) => ({ value: c, label: c, group: 'Nederland' }))]
  const groups: MerkenGroup[] = [
    { key: 'land', name: 'Land', ui: 'dropdown', multi: false, options: [{ value: 'be', label: 'België' }, { value: 'nl', label: 'Nederland' }], clears: ['locatie'] },
    { key: 'locatie', name: 'Stad / regio', ui: 'dropdown', multi: false, options: cityOptions },
    { key: 'type', name: 'Type samenwerking', ui: 'dropdown', multi: true, options: VACANCY_TYPE_FILTER.map(({ value, label }) => ({ value, label })) },
    { key: 'sector', name: 'Sector', ui: 'dropdown', multi: true, options: VACANCY_SECTORS },
    { key: 'regime', name: 'Werkregime', ui: 'dropdown', multi: true, options: VACANCY_REGIME_FILTER.map(({ value, label }) => ({ value, label })) },
  ]
  return { groups, facets }
}

export async function getVacancyBySlug(slug: string): Promise<Record<string, any> | null> {
  try {
    const payload = await client()
    const res = await payload.find({ collection: 'vacancies', where: { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] } as never, depth: 2, limit: 1 })
    return (res.docs[0] as Record<string, any>) || null
  } catch {
    return null
  }
}

/** Published vacancies of one profile, for the "Vacatures bij …" block. */
export async function getVacanciesForProfile(kind: 'trainer' | 'brand', id: number): Promise<VacancyCardData[]> {
  try {
    const payload = await client()
    const res = await payload.find({ collection: 'vacancies', where: { and: [{ status: { equals: 'published' } }, { [kind]: { equals: id } }] } as never, depth: 2, limit: 12, sort: '-createdAt' })
    return (res.docs as Record<string, any>[]).map(toCard)
  } catch {
    return []
  }
}

export const typeLabels = (values: string[]) => values.map((v) => labelOf(VACANCY_TYPES, v))
export const sectorLabels = (values: string[]) => values.map((v) => labelOf(VACANCY_SECTORS, v))
export const regimeLabels = (values: string[]) => values.map((v) => labelOf(VACANCY_REGIMES, v))
export const functionLabels = (values: string[]) => values.map((v) => labelOf(VACANCY_FUNCTIONS, v))

/**
 * Homepage "Vacatures in de kijker": Ultimate accounts only (plan perk
 * "Uitgelicht op de homepage via rotatie"), shuffled per visit, max two per
 * account, like the course rotation.
 */
export async function getHomepageVacancies(limit = 3): Promise<VacancyCardData[]> {
  const all = (await getVacancyCards()).filter((v) => v.isUltimate)
  const shuffled = [...all].sort(() => Math.random() - 0.5)
  const perCompany = new Map<string, number>()
  const picked: VacancyCardData[] = []
  for (const v of shuffled) {
    const n = perCompany.get(v.companyName) || 0
    if (n >= 2) continue
    perCompany.set(v.companyName, n + 1)
    picked.push(v)
    if (picked.length === limit) break
  }
  return picked
}
