import type { Payload } from 'payload'

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
  const collection = role === 'brand' ? 'brands' : 'trainers'
  const res = await payload.find({
    collection,
    where: { owner: { equals: user.id } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const doc = res.docs[0]
  if (!doc) return null
  return role === 'brand' ? { brand: doc.id as number } : { trainer: doc.id as number }
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
export function buildCourseData(body: Record<string, unknown>): Record<string, unknown> {
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  const num = (v: unknown) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }
  const title = str(body.title)
  const data: Record<string, unknown> = {
    title,
    slug: str(body.slug) || slugify(title),
    status: ['draft', 'published', 'archived'].includes(str(body.status)) ? str(body.status) : 'draft',
    shortDescription: str(body.shortDescription),
    description: lexical(str(body.description)),
    externalUrl: str(body.externalUrl),
    certificate: Boolean(body.certificate),
  }
  if (num(body.category) !== undefined) data.category = num(body.category)
  if (Array.isArray(body.format)) data.format = body.format
  if (str(body.level)) data.level = str(body.level)
  if (str(body.accreditation)) data.accreditation = str(body.accreditation)
  if (str(body.city)) data.location = { city: str(body.city) }

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
  }
  if (typeof body.tags === 'string' && body.tags.trim()) {
    data.tags = body.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
  }
  return data
}
