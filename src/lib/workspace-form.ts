import type { Payload } from 'payload'
import { slugify } from '@/lib/slug'
import {
  ACCESS_OPTIONS,
  AVAILABLE_FROM,
  DAYS,
  DEPOSIT_OPTIONS,
  FACILITY_UNITS,
  FEATURE_KEYS,
  PRICED_FACILITY_KEYS,
  RENT_FORMULAS,
  RENT_UNITS,
  SALON_TYPES,
  USAGE_OPTIONS,
  WORKPLACE_TYPES,
  WORKSPACE_ACTIVITIES,
} from '@/lib/workspace-options'

/** Landing pages under /werkruimtes own these slugs (copy 10/2026). */
export const WORKSPACE_RESERVED_SLUGS = new Set(['stoelhuur', 'behandelruimte'])

export type FacilityValue = { key: string; name?: string; mode: 'inbegrepen' | 'meerprijs'; price: string; unit: string }
export type ScheduleBlock = { day: string; from: string; to: string }

export type WorkspaceFormValues = {
  title: string
  status: 'draft' | 'published'
  companyName: string
  country: 'be' | 'nl'
  city: string
  address: string
  website: string
  salonTypes: string[]
  salonTypeOther: string
  workplaceTypes: string[]
  workplaceTypeOther: string
  usage: string
  access: string
  rentFormula: string
  rentAmount: string
  rentUnit: string
  rentPercentage: string
  deposit: string
  depositAmount: string
  features: string[]
  facilities: FacilityValue[]
  facilitiesNote: string
  activities: string[]
  activityOther: string
  availableFrom: string
  availableDate: string
  schedule: ScheduleBlock[]
  otherTimesNegotiable: boolean
  coverImage: { id: number | string; url: string } | null
  gallery: { id: number | string; url: string }[]
  description: string
  contactName: string
  contactEmail: string
  contactPhone: string
}

const str = (v: unknown, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const num = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : null
}
const pick = (v: unknown, allowed: Set<string> | { value: string }[]) => {
  const set = allowed instanceof Set ? allowed : new Set(allowed.map((o) => o.value))
  return Array.isArray(v) ? Array.from(new Set(v.filter((x): x is string => typeof x === 'string' && set.has(x)))) : []
}
const one = (v: unknown, list: { value: string }[]) => (typeof v === 'string' && list.some((o) => o.value === v) ? v : null)
const mediaId = (v: unknown) => (typeof v === 'number' || (typeof v === 'string' && v) ? v : null)
const TIME = /^([01]?\d|2[0-4]):[0-5]\d$/

/** Validates the form body; throws a Dutch message for the first problem. */
export function buildWorkspaceData(body: Record<string, unknown>): Record<string, unknown> {
  const rentFormula = one(body.rentFormula, RENT_FORMULAS) || 'in-overleg'
  const deposit = one(body.deposit, DEPOSIT_OPTIONS)

  // 6.2-6.7: one row per chosen facility; "inbegrepen" clears the price.
  const units = new Set(FACILITY_UNITS.map((u) => u.value))
  const facilities = (Array.isArray(body.facilities) ? body.facilities : [])
    .map((f: Record<string, unknown>) => {
      const custom = f.key === 'custom'
      if (!custom && !PRICED_FACILITY_KEYS.has(String(f.key))) return null
      const name = custom ? str(f.name, 80) : ''
      if (custom && !name) return null
      const mode = f.mode === 'meerprijs' ? 'meerprijs' : 'inbegrepen'
      const price = mode === 'meerprijs' ? num(f.price) : null
      const unit = mode === 'meerprijs' && typeof f.unit === 'string' && units.has(f.unit) ? f.unit : null
      return { key: custom ? 'custom' : String(f.key), name, mode, price, unit }
    })
    .filter(Boolean) as { key: string; mode: string; price: number | null; unit: string | null }[]
  if (facilities.some((f) => f.price != null && !f.unit)) throw new Error('Kies een prijseenheid bij elke voorziening met een meerprijs.')

  const dayValues = new Set(DAYS.map((d) => d.value))
  const schedule = (Array.isArray(body.schedule) ? body.schedule : [])
    .map((b: Record<string, unknown>) => ({ day: String(b.day || ''), from: str(b.from, 5), to: str(b.to, 5) }))
    .filter((b) => dayValues.has(b.day) && TIME.test(b.from) && TIME.test(b.to))
  if (schedule.some((b) => b.to <= b.from)) throw new Error('Een tijdsblok moet eindigen na het beginuur.')

  const data = {
    title: str(body.title, 140),
    status: body.status === 'published' ? 'published' : 'draft',
    companyName: str(body.companyName, 140),
    country: body.country === 'nl' ? 'nl' : 'be',
    city: str(body.city, 80),
    address: str(body.address, 200),
    website: str(body.website, 300),
    salonTypes: pick(body.salonTypes, SALON_TYPES),
    salonTypeOther: str(body.salonTypeOther, 140),
    workplaceTypes: pick(body.workplaceTypes, WORKPLACE_TYPES),
    workplaceTypeOther: str(body.workplaceTypeOther, 140),
    usage: one(body.usage, USAGE_OPTIONS),
    access: one(body.access, ACCESS_OPTIONS),
    rentFormula,
    rentAmount: rentFormula === 'vast' || rentFormula === 'vast-percentage' ? num(body.rentAmount) : null,
    rentUnit: rentFormula === 'vast' || rentFormula === 'vast-percentage' ? one(body.rentUnit, RENT_UNITS) : null,
    rentPercentage: rentFormula === 'percentage' || rentFormula === 'vast-percentage' ? num(body.rentPercentage) : null,
    deposit,
    depositAmount: deposit === 'bedrag' ? num(body.depositAmount) : null,
    features: pick(body.features, FEATURE_KEYS as Set<string>),
    facilities,
    facilitiesNote: str(body.facilitiesNote),
    activities: pick(body.activities, WORKSPACE_ACTIVITIES),
    activityOther: str(body.activityOther, 140),
    availableFrom: one(body.availableFrom, AVAILABLE_FROM) || 'onmiddellijk',
    availableDate: body.availableFrom === 'datum' && str(body.availableDate) ? str(body.availableDate) : null,
    schedule,
    otherTimesNegotiable: Boolean(body.otherTimesNegotiable),
    coverImage: mediaId(body.coverImage),
    gallery: (Array.isArray(body.gallery) ? body.gallery : []).map(mediaId).filter(Boolean).slice(0, 12).map((image) => ({ image })),
    description: str(body.description, 6000),
    contactName: str(body.contactName, 120),
    contactEmail: str(body.contactEmail, 200),
    contactPhone: str(body.contactPhone, 40),
  }
  if (data.rentAmount != null && !data.rentUnit) throw new Error('Kies per wanneer de huurprijs geldt (uur, dag, maand …).')
  const missing: [unknown, string][] = [
    [data.title, 'Vul een titel in.'],
    [data.companyName, 'Vul de salon- of bedrijfsnaam in.'],
    [data.city, 'Vul de stad of gemeente in.'],
    [data.workplaceTypes.length, 'Kies minstens één type werkplek.'],
    [data.contactName, 'Vul de contactpersoon in.'],
    [data.contactEmail, 'Vul een e-mailadres in.'],
  ]
  const first = missing.find(([v]) => !v)
  if (first) throw new Error(first[1])
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.contactEmail)) throw new Error('Vul een geldig e-mailadres in.')
  return data
}

export async function uniqueWorkspaceSlug(payload: Payload, title: string, city: string, ignoreId?: number | string): Promise<string> {
  // Add the city unless the title already names it ("… in Antwerpen").
  const withCity = title.toLowerCase().includes(city.trim().toLowerCase()) ? title : `${title} ${city}`
  const base = slugify(withCity) || 'werkruimte'
  for (let i = 0; i < 50; i++) {
    const slug = i ? `${base}-${i + 1}` : base
    if (WORKSPACE_RESERVED_SLUGS.has(slug)) continue
    const res = await payload.find({ collection: 'workspaces', where: { slug: { equals: slug } }, limit: 1, depth: 0, overrideAccess: true })
    if (!res.docs.length || res.docs[0].id === ignoreId) return slug
  }
  return `${base}-${Date.now()}`
}

const media = (m: unknown) => (m && typeof m === 'object' && 'id' in m ? { id: (m as { id: number }).id, url: String((m as { url?: string }).url || '') } : null)

export function workspaceToForm(doc: Record<string, any>): WorkspaceFormValues {
  const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]) : [])
  const s = (v: unknown) => (v == null ? '' : String(v))
  return {
    title: s(doc.title), status: doc.status === 'published' ? 'published' : 'draft',
    companyName: s(doc.companyName), country: doc.country === 'nl' ? 'nl' : 'be', city: s(doc.city), address: s(doc.address), website: s(doc.website),
    salonTypes: arr(doc.salonTypes), salonTypeOther: s(doc.salonTypeOther), workplaceTypes: arr(doc.workplaceTypes), workplaceTypeOther: s(doc.workplaceTypeOther),
    usage: s(doc.usage), access: s(doc.access),
    rentFormula: s(doc.rentFormula) || 'in-overleg', rentAmount: s(doc.rentAmount), rentUnit: s(doc.rentUnit), rentPercentage: s(doc.rentPercentage),
    deposit: s(doc.deposit), depositAmount: s(doc.depositAmount),
    features: arr(doc.features),
    facilities: (doc.facilities || []).map((f: Record<string, unknown>) => ({ key: s(f.key), name: s(f.name), mode: f.mode === 'meerprijs' ? 'meerprijs' : 'inbegrepen', price: s(f.price), unit: s(f.unit) })),
    facilitiesNote: s(doc.facilitiesNote),
    activities: arr(doc.activities), activityOther: s(doc.activityOther),
    availableFrom: s(doc.availableFrom) || 'onmiddellijk', availableDate: doc.availableDate ? String(doc.availableDate).slice(0, 10) : '',
    schedule: (doc.schedule || []).map((b: Record<string, unknown>) => ({ day: s(b.day), from: s(b.from), to: s(b.to) })),
    otherTimesNegotiable: Boolean(doc.otherTimesNegotiable),
    coverImage: media(doc.coverImage),
    gallery: (doc.gallery || []).map((g: { image?: unknown }) => media(g.image)).filter(Boolean),
    description: s(doc.description),
    contactName: s(doc.contactName), contactEmail: s(doc.contactEmail), contactPhone: s(doc.contactPhone),
  }
}
