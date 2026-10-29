import { getPayload } from 'payload'
import config from '@/payload.config'
import { publicMediaUrl } from '@/lib/media'
import { tierForUser } from '@/lib/tier-features'
import type { MerkenFacets, MerkenGroup } from '@/lib/merken-filters'
import { DAYPARTS, DAYS, RENT_UNITS, USAGE_OPTIONS, WORKPLACE_TYPES, WORKSPACE_SECTORS, labelOf } from '@/lib/workspace-options'

/** Public side of Werkruimtes: cards, filters and the detail page. */

export type WorkspaceCardData = {
  id: number
  slug: string
  href: string
  title: string
  companyName: string
  city: string
  workplaceTypes: string[]
  sectors: string[]
  price: string
  availableNow: boolean
  image: string | null
  highlights: string[]
  publishedAt: string
  isUltimate: boolean
}

export type WorkspaceFilters = {
  land?: string
  locatie?: string
  sector?: string[]
  werkplek?: string[]
  gebruik?: string
  dag?: string[]
  moment?: string[]
  prijsMin?: number
  prijsMax?: number
  per?: string
  q?: string
}

const client = async () => getPayload({ config: await config })
const rel = (v: unknown) => (v && typeof v === 'object' ? (v as Record<string, any>) : null)
const euro = (n: number) => `€${new Intl.NumberFormat('nl-BE', { maximumFractionDigits: 2 }).format(n)}`

/** "€160 / dag", "40% van de omzet", "In overleg". */
export function rentLabel(doc: Record<string, any>): string {
  const unit = doc.rentUnit ? ` / ${labelOf(RENT_UNITS, doc.rentUnit).toLowerCase()}` : ''
  const fixed = doc.rentAmount != null ? `${euro(doc.rentAmount)}${unit}` : ''
  const pct = doc.rentPercentage != null ? `${doc.rentPercentage}% van de omzet` : ''
  if (doc.rentFormula === 'vast' && fixed) return fixed
  if (doc.rentFormula === 'percentage' && pct) return pct
  if (doc.rentFormula === 'vast-percentage' && (fixed || pct)) return [fixed, pct].filter(Boolean).join(' + ')
  return 'In overleg'
}

function isUltimate(doc: Record<string, any>) {
  const profile = rel(doc.brand) || rel(doc.trainer)
  const owner = rel(profile?.owner)
  return owner ? tierForUser({ ...owner, role: doc.brand ? 'brand' : 'trainer' }).features.searchPriority >= 3 : false
}

const FACILITY_HIGHLIGHT: Record<string, string> = { wifi: 'Wifi', 'gratis-parking-beschikbaar': 'Parking', 'wasbak-wateraansluiting': 'Wasbak', 'koffie-thee': 'Koffie/thee', 'behandelbank-massagetafel': 'Behandelbank' }

function toCard(doc: Record<string, any>): WorkspaceCardData {
  const keys = new Set<string>([...(doc.features || []), ...(doc.facilities || []).map((f: { key: string }) => f.key)])
  return {
    id: doc.id,
    slug: doc.slug,
    href: `/werkruimtes/${doc.slug}`,
    title: doc.title,
    companyName: doc.companyName,
    city: doc.city,
    workplaceTypes: doc.workplaceTypes || [],
    sectors: doc.sectors || [],
    price: rentLabel(doc),
    availableNow: doc.availableFrom === 'onmiddellijk' || (doc.availableFrom === 'datum' && doc.availableDate && new Date(doc.availableDate) <= new Date()),
    image: publicMediaUrl(doc.coverImage) || publicMediaUrl(doc.gallery?.[0]?.image),
    highlights: Object.entries(FACILITY_HIGHLIGHT).filter(([k]) => keys.has(k)).map(([, l]) => l).slice(0, 3),
    publishedAt: doc.createdAt,
    isUltimate: isUltimate(doc),
  }
}

export async function getWorkspaceCards(f: WorkspaceFilters = {}): Promise<WorkspaceCardData[]> {
  try {
    const payload = await client()
    const and: Record<string, unknown>[] = [{ status: { equals: 'published' } }]
    if (f.land === 'be' || f.land === 'nl') and.push({ country: { equals: f.land } })
    if (f.locatie) and.push({ city: { equals: f.locatie } })
    if (f.sector?.length) and.push({ sectors: { in: f.sector } })
    if (f.werkplek?.length) and.push({ workplaceTypes: { in: f.werkplek } })
    // "Beide mogelijkheden" matches either choice.
    if (f.gebruik === 'exclusief' || f.gebruik === 'gedeeld') and.push({ usage: { in: [f.gebruik, 'beide'] } })
    if (f.gebruik === 'beide') and.push({ usage: { equals: 'beide' } })
    if (f.dag?.length) and.push({ availableDays: { in: f.dag } })
    if (f.moment?.length) and.push({ dayparts: { in: f.moment } })
    if (f.prijsMin != null || f.prijsMax != null || f.per) {
      if (f.per) and.push({ rentUnit: { equals: f.per } })
      if (f.prijsMin != null) and.push({ rentAmount: { greater_than_equal: f.prijsMin } })
      if (f.prijsMax != null) and.push({ rentAmount: { less_than_equal: f.prijsMax } })
    }
    if (f.q) and.push({ or: [{ title: { like: f.q } }, { companyName: { like: f.q } }] })
    const res = await payload.find({ collection: 'workspaces', where: { and } as never, depth: 2, limit: 200, sort: '-createdAt' })
    return (res.docs as Record<string, any>[]).map(toCard).sort((a, b) => Number(b.isUltimate) - Number(a.isUltimate))
  } catch {
    return []
  }
}

export async function getWorkspaceFilterOptions(land?: string): Promise<{ groups: MerkenGroup[]; facets: MerkenFacets }> {
  const facets: MerkenFacets = {}
  const inc = (g: string, v: string) => {
    facets[g] ||= {}
    facets[g][v] = (facets[g][v] || 0) + 1
  }
  const live: { be: string[]; nl: string[] } = { be: [], nl: [] }
  try {
    const payload = await client()
    const res = await payload.find({ collection: 'workspaces', where: { status: { equals: 'published' } } as never, depth: 0, limit: 1000 })
    for (const d of res.docs as Record<string, any>[]) {
      const country = d.country === 'nl' ? 'nl' : 'be'
      inc('land', country)
      if (d.city) {
        inc('locatie', d.city)
        live[country].push(d.city)
      }
      for (const s of d.sectors || []) inc('sector', s)
      for (const w of d.workplaceTypes || []) inc('werkplek', w)
      if (d.usage) inc('gebruik', d.usage)
      for (const day of d.availableDays || []) inc('dag', day)
      for (const m of d.dayparts || []) inc('moment', m)
      if (d.rentUnit) inc('per', d.rentUnit)
    }
  } catch {
    /* empty facets */
  }
  const sorted = (a: string[]) => Array.from(new Set(a)).sort((x, y) => x.localeCompare(y, 'nl-BE'))
  const be = sorted(live.be)
  const nl = sorted(live.nl)
  const cityOptions =
    land === 'be' ? be.map((c) => ({ value: c, label: c })) : land === 'nl' ? nl.map((c) => ({ value: c, label: c })) : [...be.map((c) => ({ value: c, label: c, group: 'België' })), ...nl.map((c) => ({ value: c, label: c, group: 'Nederland' }))]
  const groups: MerkenGroup[] = [
    { key: 'land', name: 'Land', ui: 'dropdown', multi: false, options: [{ value: 'be', label: 'België' }, { value: 'nl', label: 'Nederland' }], clears: ['locatie'] },
    { key: 'locatie', name: 'Stad / regio', ui: 'dropdown', multi: false, options: cityOptions },
    { key: 'sector', name: 'Type salon / sector', ui: 'dropdown', multi: true, options: WORKSPACE_SECTORS },
    { key: 'werkplek', name: 'Type werkplek', ui: 'dropdown', multi: true, options: WORKPLACE_TYPES },
    { key: 'gebruik', name: 'Gebruik', ui: 'dropdown', multi: false, options: [{ value: 'exclusief', label: 'Exclusief gebruik' }, { value: 'gedeeld', label: 'Gedeeld gebruik' }, { value: 'beide', label: 'Beide mogelijkheden' }] },
    { key: 'dag', name: 'Beschikbare dagen', ui: 'dropdown', multi: true, options: DAYS },
    { key: 'moment', name: 'Tijdstip', ui: 'dropdown', multi: true, options: DAYPARTS },
    { key: 'per', name: 'Huurprijs per', ui: 'dropdown', multi: false, options: RENT_UNITS },
  ]
  return { groups, facets }
}

export async function getWorkspaceBySlug(slug: string): Promise<Record<string, any> | null> {
  try {
    const payload = await client()
    const res = await payload.find({ collection: 'workspaces', where: { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] } as never, depth: 2, limit: 1 })
    return (res.docs[0] as Record<string, any>) || null
  } catch {
    return null
  }
}

export async function getWorkspacesForProfile(kind: 'trainer' | 'brand', id: number): Promise<WorkspaceCardData[]> {
  try {
    const payload = await client()
    const res = await payload.find({ collection: 'workspaces', where: { and: [{ status: { equals: 'published' } }, { [kind]: { equals: id } }] } as never, depth: 2, limit: 12, sort: '-createdAt' })
    return (res.docs as Record<string, any>[]).map(toCard)
  } catch {
    return []
  }
}

/** Homepage "Werkruimtes in de kijker": Ultimate only, shuffled, max two per company. */
export async function getHomepageWorkspaces(limit = 3): Promise<WorkspaceCardData[]> {
  const all = (await getWorkspaceCards()).filter((w) => w.isUltimate).sort(() => Math.random() - 0.5)
  const per = new Map<string, number>()
  const out: WorkspaceCardData[] = []
  for (const w of all) {
    const n = per.get(w.companyName) || 0
    if (n >= 2) continue
    per.set(w.companyName, n + 1)
    out.push(w)
    if (out.length === limit) break
  }
  return out
}

export const workplaceLabels = (v: string[]) => v.map((x) => labelOf(WORKPLACE_TYPES, x))
export const usageLabel = (v?: string | null) => labelOf(USAGE_OPTIONS, v)
