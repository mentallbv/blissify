import type { Payload } from 'payload'
import { slugify } from '@/lib/slug'
import { VACANCY_LANDING_KEYS } from '@/lib/vacancy-landings'
import {
  COMPENSATION_TYPES,
  EXPERIENCE_LEVELS,
  START_OPTIONS,
  VACANCY_FUNCTIONS,
  VACANCY_OFFERS,
  VACANCY_REGIMES,
  VACANCY_TYPES,
  WEEKDAYS,
} from '@/lib/vacancy-options'

/** What the dashboard form sends and edits (mirrors the Vacancies collection). */
export type VacancyFormValues = {
  title: string
  status: 'draft' | 'published'
  companyName: string
  country: 'be' | 'nl'
  city: string
  address: string
  website: string
  types: string[]
  typeOther: string
  functions: string[]
  functionOther: string
  regimes: string[]
  workdays: string[]
  regimeNote: string
  start: string
  startDate: string
  startNote: string
  compensationTypes: string[]
  compensationAmount: string
  compensationNote: string
  experience: string
  diplomaNote: string
  requirementsNote: string
  offers: string[]
  offerOther: string
  aboutCompany: string
  whoWeSeek: string
  whatWeOffer: string
  logo: { id: number | string; url: string } | null
  coverImage: { id: number | string; url: string } | null
  applyMethod: 'email' | 'link'
  applyUrl: string
  contactName: string
  contactEmail: string
  contactPhone: string
}

const str = (v: unknown, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const pick = (v: unknown, list: { value: string }[]) => {
  const allowed = new Set(list.map((o) => o.value))
  return Array.isArray(v) ? Array.from(new Set(v.filter((x): x is string => typeof x === 'string' && allowed.has(x)))) : []
}
const one = (v: unknown, list: { value: string }[]) => (typeof v === 'string' && list.some((o) => o.value === v) ? v : null)
const mediaId = (v: unknown) => (typeof v === 'number' || (typeof v === 'string' && v) ? v : null)

/** Validates the form body; throws a Dutch message for the first missing required field. */
export function buildVacancyData(body: Record<string, unknown>): Record<string, unknown> {
  const data = {
    title: str(body.title, 140),
    status: body.status === 'published' ? 'published' : 'draft',
    companyName: str(body.companyName, 140),
    country: body.country === 'nl' ? 'nl' : 'be',
    city: str(body.city, 80),
    address: str(body.address, 200),
    website: str(body.website, 300),
    types: pick(body.types, VACANCY_TYPES),
    typeOther: str(body.typeOther, 140),
    functions: pick(body.functions, VACANCY_FUNCTIONS),
    functionOther: str(body.functionOther, 140),
    regimes: pick(body.regimes, VACANCY_REGIMES),
    workdays: pick(body.workdays, WEEKDAYS),
    regimeNote: str(body.regimeNote),
    start: one(body.start, START_OPTIONS) || 'in-overleg',
    startDate: body.start === 'datum' && str(body.startDate) ? str(body.startDate) : null,
    startNote: str(body.startNote),
    compensationTypes: pick(body.compensationTypes, COMPENSATION_TYPES),
    compensationAmount: str(body.compensationAmount, 80),
    compensationNote: str(body.compensationNote),
    experience: one(body.experience, EXPERIENCE_LEVELS),
    diplomaNote: str(body.diplomaNote),
    requirementsNote: str(body.requirementsNote),
    offers: pick(body.offers, VACANCY_OFFERS),
    offerOther: str(body.offerOther, 140),
    aboutCompany: str(body.aboutCompany, 5000),
    whoWeSeek: str(body.whoWeSeek, 5000),
    whatWeOffer: str(body.whatWeOffer, 5000),
    logo: mediaId(body.logo),
    coverImage: mediaId(body.coverImage),
    applyMethod: body.applyMethod === 'link' ? 'link' : 'email',
    applyUrl: body.applyMethod === 'link' ? str(body.applyUrl, 500) : '',
    contactName: str(body.contactName, 120),
    contactEmail: str(body.contactEmail, 200),
    contactPhone: str(body.contactPhone, 40),
  }
  const missing: [unknown, string][] = [
    [data.title, 'Vul een titel in.'],
    [data.companyName, 'Vul de bedrijfs- of salonnaam in.'],
    [data.city, 'Vul de stad of gemeente in.'],
    [data.types.length, 'Kies minstens één type samenwerking.'],
    [data.functions.length, 'Kies minstens één functie.'],
    [data.contactName, 'Vul de contactpersoon in.'],
    [data.contactEmail, 'Vul een e-mailadres in.'],
  ]
  const first = missing.find(([v]) => !v)
  if (first) throw new Error(first[1])
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.contactEmail)) throw new Error('Vul een geldig e-mailadres in.')
  if (data.applyMethod === 'link' && !/^https?:\/\/\S+\.\S+/.test(data.applyUrl)) throw new Error('Vul een geldige link in om te solliciteren (begint met https://).')
  return data
}

/** A slug that is not used by another vacancy yet. */
export async function uniqueVacancySlug(payload: Payload, title: string, city: string, ignoreId?: number | string): Promise<string> {
  const base = slugify(`${title} ${city}`) || 'vacature'
  for (let i = 0; i < 50; i++) {
    const slug = i ? `${base}-${i + 1}` : base
    // Landing pages (/vacatures/schoonheidsspecialiste …) own these slugs.
    if (VACANCY_LANDING_KEYS.has(slug)) continue
    const res = await payload.find({ collection: 'vacancies', where: { slug: { equals: slug } }, limit: 1, depth: 0, overrideAccess: true })
    if (!res.docs.length || res.docs[0].id === ignoreId) return slug
  }
  return `${base}-${Date.now()}`
}

const media = (m: unknown) => (m && typeof m === 'object' && 'id' in m ? { id: (m as { id: number }).id, url: String((m as { url?: string }).url || '') } : null)

/** A stored vacancy as form values. */
export function vacancyToForm(doc: Record<string, any>): VacancyFormValues {
  const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]) : [])
  return {
    title: doc.title || '', status: doc.status === 'published' ? 'published' : 'draft',
    companyName: doc.companyName || '', country: doc.country === 'nl' ? 'nl' : 'be', city: doc.city || '', address: doc.address || '', website: doc.website || '',
    types: arr(doc.types), typeOther: doc.typeOther || '', functions: arr(doc.functions), functionOther: doc.functionOther || '',
    regimes: arr(doc.regimes), workdays: arr(doc.workdays), regimeNote: doc.regimeNote || '',
    start: doc.start || 'in-overleg', startDate: doc.startDate ? String(doc.startDate).slice(0, 10) : '', startNote: doc.startNote || '',
    compensationTypes: arr(doc.compensationTypes), compensationAmount: doc.compensationAmount || '', compensationNote: doc.compensationNote || '',
    experience: doc.experience || '', diplomaNote: doc.diplomaNote || '', requirementsNote: doc.requirementsNote || '',
    offers: arr(doc.offers), offerOther: doc.offerOther || '',
    aboutCompany: doc.aboutCompany || '', whoWeSeek: doc.whoWeSeek || '', whatWeOffer: doc.whatWeOffer || '',
    logo: media(doc.logo), coverImage: media(doc.coverImage),
    applyMethod: doc.applyMethod === 'link' ? 'link' : 'email', applyUrl: doc.applyUrl || '',
    contactName: doc.contactName || '', contactEmail: doc.contactEmail || '', contactPhone: doc.contactPhone || '',
  }
}
