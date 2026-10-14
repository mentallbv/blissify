import { CERTIFICATION_VALUES, NO_CERTIFICATION } from '@/lib/certifications'
import type { Payload } from 'payload'
import { htmlToLexical } from '@/lib/richtext'
import { ensureProfile } from '@/lib/ensure-profile'

type AnyUser = { id: number | string; role?: string | null }

export function lexical(text: string) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: text ? [{ type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }] : [],
        },
      ],
    },
  }
}

export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 70) || 'opleiding'
  )
}

/** Resolves { trainer: id } or { brand: id } for the current user's owned profile. */
export async function resolveOwner(
  payload: Payload,
  user: AnyUser,
): Promise<{ trainer: number } | { brand: number } | null> {
  const role = user.role
  if (role !== 'trainer' && role !== 'brand') return null
  // Creates the profile when the account has none (see ensureProfile).
  const profile = await ensureProfile(payload, user)
  if (!profile) return null
  return role === 'brand' ? { brand: profile.doc.id as number } : { trainer: profile.doc.id as number }
}

export function ownerWhereFromOwner(owner: { trainer?: number } | { brand?: number }): Record<string, unknown> {
  const brand = (owner as { brand?: number }).brand
  if (brand != null) return { brand: { equals: brand } }
  return { trainer: { equals: (owner as { trainer?: number }).trainer } }
}

export function ownsCourse(course: { trainer?: unknown; brand?: unknown }, owner: { trainer?: number } | { brand?: number }): boolean {
  const val = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : v)
  if ('trainer' in owner) return val(course.trainer) === owner.trainer
  if ('brand' in owner) return val(course.brand) === owner.brand
  return false
}

/** Maps the form body to a Courses collection data object. */
/**
 * Certificaten, diploma's & erkenningen (client round 2, section 6). Only known
 * choices are kept, "Geen" stays exclusive, and the details of a choice that is
 * not ticked are cleared so the course page never shows stale data.
 */
function certificationData(body: Record<string, unknown>) {
  const raw = Array.isArray(body.certificationTypes) ? (body.certificationTypes as unknown[]).map(String) : []
  let types = Array.from(new Set(raw.filter((v) => CERTIFICATION_VALUES.has(v))))
  if (types.includes(NO_CERTIFICATION)) types = [NO_CERTIFICATION]
  const d = (body.certificationDetails || {}) as Partial<Record<'mboDiploma' | 'brancheDiploma' | 'accreditedTraining', Record<string, unknown>>>
  const t = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)
  const n = (v: unknown) => {
    const x = typeof v === 'string' && v.trim() === '' ? NaN : Number(v)
    return Number.isFinite(x) ? x : null
  }
  const mbo = types.includes('mbo-diploma') ? d.mboDiploma || {} : {}
  const branche = types.includes('branche-diploma') ? d.brancheDiploma || {} : {}
  const acc = types.includes('geaccrediteerde-bijscholing') ? d.accreditedTraining || {} : {}
  return {
    certificationTypes: types,
    // Kept in step for anything that still reads the old flag.
    certificate: types.some((v) => v !== NO_CERTIFICATION),
    mboDiploma: { name: t(mbo.name), crebo: t(mbo.crebo), institution: t(mbo.institution), url: t(mbo.url) },
    brancheDiploma: { name: t(branche.name), organisation: t(branche.organisation), url: t(branche.url) },
    accreditedTraining: {
      authority: t(acc.authority),
      register: t(acc.register),
      amount: n(acc.amount),
      amountUnit: acc.amountUnit === 'hours' ? 'hours' : 'points',
      number: t(acc.number),
      url: t(acc.url),
    },
  }
}

export async function buildCourseData(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  // An empty field means "not set": Number('') is 0, which would fail min: 1
  // validation (e.g. an empty "Maximum deelnemers" blocked saving).
  const num = (v: unknown) => {
    if (v === null || v === undefined || (typeof v === 'string' && v.trim() === '')) return undefined
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }
  const title = str(body.title)
  const data: Record<string, unknown> = {
    title,
    slug: str(body.slug) || slugify(title),
    status: ['draft', 'published', 'archived'].includes(str(body.status)) ? str(body.status) : 'draft',
    shortDescription: str(body.shortDescription),
    description: await htmlToLexical(str(body.description)),
    externalUrl: str(body.externalUrl),
    ...certificationData(body),
    productLaunchHighlighted: Boolean(body.productLaunchHighlighted),
    coBrandPartner: str(body.coBrandPartner) || null,
    // An empty choice is not a valid option value; store "no type" instead.
    courseType: str(body.courseType) || null,
    language: Array.isArray(body.language) ? body.language : ['nl'],
    targetAudience: Array.isArray(body.targetAudience) ? body.targetAudience : [],
    practical: Array.isArray(body.practical) ? body.practical : [],
    focus: Array.isArray(body.focus) ? body.focus : [],
    participants: {
      // null (not undefined) so clearing the field also clears a saved maximum.
      maximum: num(body.maximumParticipants) ?? null,
      privateOneToOne: Boolean(body.privateOneToOne),
    },
    modelRequired: str(body.modelRequired) || 'not_applicable',
    lunchProvided: str(body.lunchProvided) || 'not_applicable',
    contact: {
      email: str(body.contactEmail),
      website: str(body.contactWebsite),
      instagram: str(body.instagram),
      facebook: str(body.facebook),
      tiktok: str(body.tiktok),
    },
  }
  if (num(body.category) !== undefined) data.category = num(body.category)
  if (Array.isArray(body.format)) data.format = body.format
  if (str(body.city)) data.location = { city: str(body.city), country: str(body.country) === 'nl' ? 'nl' : 'be' }
  // null clears the image, undefined leaves it untouched on a partial update.
  if (body.coverImage === null) data.coverImage = null
  else if (num(body.coverImage) !== undefined) data.coverImage = num(body.coverImage)

  const amount = num(body.priceAmount)
  if (amount !== undefined || body.priceOnRequest) {
    data.price = {
      amount: amount,
      currency: 'EUR',
      isFree: Boolean(body.isFree),
      priceOnRequest: Boolean(body.priceOnRequest),
    }
  }
  const durValue = num(body.durationValue)
  if (durValue !== undefined && str(body.durationUnit)) {
    data.duration = { value: durValue, unit: str(body.durationUnit) }
  } else if ('durationValue' in body && durValue === undefined) {
    data.duration = { value: null, unit: null }
  }
  if (typeof body.tags === 'string' && body.tags.trim()) {
    data.tags = body.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
  }
  if (Array.isArray(body.startDates)) {
    data.startDates = body.startDates
      .map((item) => {
        const row = item as Record<string, unknown>
        return {
          date: str(row.date),
          endDate: str(row.endDate) || undefined,
          startTime: str(row.startTime),
          endTime: str(row.endTime),
          spotsAvailable: num(row.spotsAvailable),
        }
      })
      .filter((item) => item.date)
  }
  return data
}
