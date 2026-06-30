import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Course, Brand, Category, Media } from '@/payload-types'
import { formatPrice, formatCardMeta, courseLocation } from './format'
import { CATEGORY_CONTENT } from './categories'
import { PRICING_FALLBACK, type PricingData } from './pricing'
import {
  FALLBACK_COURSES,
  FALLBACK_PROVIDERS,
  FALLBACK_BRANDS,
  CATEGORY_TILES,
  type FallbackCourse,
  type FallbackProvider,
} from './fallback'

export type CourseCardData = {
  slug: string
  href: string
  title: string
  category: string
  categorySlug: string
  provider: string
  providerSlug: string
  location: string
  price: string
  format: string
  image: string | null
}

export type ProviderCardData = {
  id?: number | string
  slug: string
  href: string
  name: string
  initial: string
  location: string
  speciality: string
  courseCount: number
  logo: string | null
}

const rel = <T extends { slug?: string; name?: string }>(v: number | T | null | undefined): T | null =>
  v && typeof v === 'object' ? (v as T) : null

const SPEC_LABELS: Record<string, string> = {
  massage: 'Massage',
  nagelstyliste: 'Nagelstyliste',
  schoonheid: 'Schoonheid',
  yoga: 'Yoga',
  voeding: 'Voeding',
  aromatherapie: 'Aromatherapie',
  reiki: 'Reiki',
  mindfulness: 'Mindfulness',
  'holistische-therapie': 'Holistische therapie',
  'persoonlijke-ontwikkeling': 'Persoonlijke ontwikkeling',
}
const specLabel = (v?: string | null): string => (v ? SPEC_LABELS[v] || v : 'Wellnessopleiding')

const mediaUrl = (m: number | Media | null | undefined): string | null =>
  m && typeof m === 'object' && m.url ? m.url : null

async function client() {
  return getPayload({ config: await config })
}

function fallbackCard(c: FallbackCourse): CourseCardData {
  return {
    slug: c.slug,
    href: `/opleidingen/${c.categorySlug}/${c.slug}`,
    title: c.title,
    category: c.category,
    categorySlug: c.categorySlug,
    provider: c.provider,
    providerSlug: c.providerSlug,
    location: c.location,
    price: c.price,
    format: c.format,
    image: null,
  }
}

function fallbackProvider(p: FallbackProvider): ProviderCardData {
  return {
    slug: p.slug,
    href: `/opleiders/${p.slug}`,
    name: p.name,
    initial: p.initial,
    location: p.location,
    speciality: p.speciality,
    courseCount: p.courseCount,
    logo: null,
  }
}

function toCard(c: Course): CourseCardData {
  const cat = rel<Category>(c.category)
  const brand = rel<Brand>(c.brand)
  const categorySlug = cat?.slug || 'overig'
  return {
    slug: c.slug,
    href: `/opleidingen/${categorySlug}/${c.slug}`,
    title: c.title,
    category: cat?.name || 'Opleiding',
    categorySlug,
    provider: brand?.name || 'Blissify-opleider',
    providerSlug: brand?.slug || '',
    location: courseLocation(c),
    price: formatPrice(c.price),
    format: formatCardMeta(c),
    image: mediaUrl(c.coverImage),
  }
}

/** Published course cards, optionally limited / filtered by category slug and city. */
export type CourseSort = 'relevant' | 'price-asc' | 'recent'

export type CourseFilters = {
  limit?: number
  page?: number
  categorySlug?: string
  city?: string
  format?: string // online | fysiek | hybride
  certificate?: boolean // "Erkend" -> certificate uitgereikt
  priceMin?: number
  priceMax?: number
  keyword?: string
  sort?: CourseSort
}

// "Meest relevant" approximates subscription-tier priority via featured flags,
// since courses carry no denormalised tier field (see note in getCoursePageData).
const SORT_MAP: Record<CourseSort, string | string[]> = {
  relevant: ['-featured', '-createdAt'],
  'price-asc': 'price.amount',
  recent: '-createdAt',
}

export async function getCourseCards(opts: CourseFilters = {}): Promise<{
  cards: CourseCardData[]
  total: number
  isFallback: boolean
}> {
  try {
    const payload = await client()
    const and: Record<string, unknown>[] = [{ status: { equals: 'published' } }]

    if (opts.categorySlug) {
      const cat = await payload.find({ collection: 'categories', where: { slug: { equals: opts.categorySlug } }, limit: 1 })
      const id = cat.docs[0]?.id
      if (id) and.push({ category: { equals: id } })
      else and.push({ category: { equals: -1 } }) // unknown category -> no matches
    }
    if (opts.city) and.push({ 'location.city': { equals: opts.city } })
    if (opts.format) and.push({ format: { contains: opts.format } })
    if (opts.certificate) and.push({ certificate: { equals: true } })
    if (typeof opts.priceMin === 'number') and.push({ 'price.amount': { greater_than_equal: opts.priceMin } })
    if (typeof opts.priceMax === 'number') and.push({ 'price.amount': { less_than_equal: opts.priceMax } })
    if (opts.keyword) {
      and.push({
        or: [{ title: { like: opts.keyword } }, { shortDescription: { like: opts.keyword } }],
      })
    }

    const res = await payload.find({
      collection: 'courses',
      where: { and } as never,
      limit: opts.limit || 24,
      page: opts.page || 1,
      depth: 1,
      sort: SORT_MAP[opts.sort || 'relevant'] as never,
    })
    return { cards: res.docs.map(toCard), total: res.totalDocs, isFallback: false }
  } catch {
    // Fallback (DB unreachable): filter the illustrative dataset best-effort.
    let list = FALLBACK_COURSES
    if (opts.categorySlug) list = list.filter((c) => c.categorySlug === opts.categorySlug)
    if (opts.city) {
      const cityLc = opts.city.toLowerCase()
      list = list.filter((c) => c.location.toLowerCase() === cityLc)
    }
    if (opts.keyword) {
      const k = opts.keyword.toLowerCase()
      list = list.filter((c) => c.title.toLowerCase().includes(k))
    }
    const cards = list.map(fallbackCard)
    return { cards: opts.limit ? cards.slice(0, opts.limit) : cards, total: cards.length, isFallback: true }
  }
}

export type CourseFilterOptions = {
  categories: { slug: string; name: string }[]
  cities: string[]
  priceMin: number
  priceMax: number
}

/** Live select options for the course filters: categories, distinct cities, price bounds. */
export async function getCourseFilterOptions(): Promise<CourseFilterOptions> {
  try {
    const payload = await client()
    const [cats, courses] = await Promise.all([
      payload.find({ collection: 'categories', limit: 200, depth: 0, sort: 'name' }),
      payload.find({ collection: 'courses', where: { status: { equals: 'published' } } as never, limit: 500, depth: 0 }),
    ])
    const cities = new Set<string>()
    let min = Infinity
    let max = 0
    courses.docs.forEach((c) => {
      const city = (c as Course).location?.city
      if (city) cities.add(city)
      const amt = (c as Course).price?.amount
      if (typeof amt === 'number' && amt > 0) {
        if (amt < min) min = amt
        if (amt > max) max = amt
      }
    })
    return {
      categories: cats.docs.map((c) => ({ slug: c.slug, name: c.name })),
      cities: Array.from(cities).sort((a, b) => a.localeCompare(b, 'nl-BE')),
      priceMin: Number.isFinite(min) ? Math.floor(min) : 0,
      priceMax: max > 0 ? Math.ceil(max) : 2000,
    }
  } catch {
    return {
      categories: CATEGORY_TILES.map((c) => ({ slug: c.slug, name: c.name })),
      cities: ['Antwerpen', 'Gent', 'Brussel', 'Brugge', 'Leuven', 'Online'],
      priceMin: 0,
      priceMax: 2000,
    }
  }
}

export async function getCourseBySlug(slug: string): Promise<{ course: Course | null; isFallback: boolean }> {
  try {
    const payload = await client()
    const res = await payload.find({
      collection: 'courses',
      where: { slug: { equals: slug }, status: { equals: 'published' } } as never,
      limit: 1,
      depth: 2,
    })
    if (res.docs.length === 0) return { course: null, isFallback: true }
    return { course: res.docs[0], isFallback: false }
  } catch {
    return { course: null, isFallback: true }
  }
}

/** Opleiders = trainers. Maps a trainer doc to the shared provider-card shape. */
export async function getProviderCards(
  opts: { limit?: number; specialisatie?: string; city?: string } | number = {},
): Promise<{ cards: ProviderCardData[]; isFallback: boolean }> {
  // Back-compat: a number used to mean `limit`.
  const o = typeof opts === 'number' ? { limit: opts } : opts
  const limit = o.limit
  try {
    const payload = await client()
    const and: Record<string, unknown>[] = []
    if (o.specialisatie) and.push({ specializations: { contains: o.specialisatie } })
    if (o.city) and.push({ 'location.city': { equals: o.city } })
    const res = await payload.find({
      collection: 'trainers',
      where: (and.length ? { and } : undefined) as never,
      limit: limit || 24,
      depth: 1,
    })
    if (res.docs.length === 0 && and.length === 0) throw new Error('empty')
    const cards = await Promise.all(
      res.docs.map(async (t) => {
        const courses = await payload.count({
          collection: 'courses',
          where: { trainer: { equals: t.id }, status: { equals: 'published' } } as never,
        })
        return {
          slug: t.slug,
          href: `/opleiders/${t.slug}`,
          name: t.displayName,
          initial: t.displayName[0],
          location: t.location?.city || 'België',
          speciality: specLabel(t.specializations?.[0]),
          courseCount: courses.totalDocs,
          logo: mediaUrl(t.photo),
        }
      }),
    )
    return { cards, isFallback: false }
  } catch {
    const cards = FALLBACK_PROVIDERS.map(fallbackProvider)
    return { cards: limit ? cards.slice(0, limit) : cards, isFallback: true }
  }
}

export async function getProviderBySlug(
  slug: string,
): Promise<{ provider: ProviderCardData | null; courses: CourseCardData[]; isFallback: boolean }> {
  try {
    const payload = await client()
    const res = await payload.find({ collection: 'trainers', where: { slug: { equals: slug } }, limit: 1, depth: 1 })
    if (res.docs.length === 0) throw new Error('empty')
    const t = res.docs[0]
    const courses = await payload.find({
      collection: 'courses',
      where: { trainer: { equals: t.id }, status: { equals: 'published' } } as never,
      depth: 1,
      limit: 12,
    })
    return {
      provider: {
        id: t.id,
        slug: t.slug,
        href: `/opleiders/${t.slug}`,
        name: t.displayName,
        initial: t.displayName[0],
        location: t.location?.city || 'België',
        speciality: specLabel(t.specializations?.[0]),
        courseCount: courses.totalDocs,
        logo: mediaUrl(t.photo),
      },
      courses: courses.docs.map(toCard),
      isFallback: false,
    }
  } catch {
    const fp = FALLBACK_PROVIDERS.find((p) => p.slug === slug)
    if (!fp) return { provider: null, courses: [], isFallback: true }
    const courses = FALLBACK_COURSES.filter((c) => c.providerSlug === slug).map(fallbackCard)
    return { provider: fallbackProvider(fp), courses, isFallback: true }
  }
}

export type BrandCardData = {
  id?: number | string
  slug: string
  href: string
  name: string
  initial: string
  sector: string
  providerCount: number
  courseCount: number
  logo: string | null
  about?: string
  website?: string | null
}

export async function getBrandCards(opts: { tag?: string } = {}): Promise<{ cards: BrandCardData[]; isFallback: boolean }> {
  try {
    const payload = await client()
    const res = await payload.find({
      collection: 'brands',
      where: (opts.tag ? { tags: { contains: opts.tag } } : undefined) as never,
      limit: 48,
      depth: 1,
    })
    if (res.docs.length === 0 && !opts.tag) throw new Error('empty')
    const cards = await Promise.all(
      res.docs.map(async (b) => {
        const courses = await payload.count({
          collection: 'courses',
          where: { brand: { equals: b.id }, status: { equals: 'published' } } as never,
        })
        const trainers = await payload.count({
          collection: 'trainers',
          where: { brand: { equals: b.id } } as never,
        })
        return {
          slug: b.slug,
          href: `/merken/${b.slug}`,
          name: b.name,
          initial: b.name[0],
          sector: (b.tags && b.tags[0]) || 'Wellnessmerk',
          providerCount: trainers.totalDocs,
          courseCount: courses.totalDocs,
          logo: mediaUrl(b.logo),
          website: b.website,
        }
      }),
    )
    return { cards, isFallback: false }
  } catch {
    return {
      cards: FALLBACK_BRANDS.map((b) => ({
        slug: b.slug,
        href: `/merken/${b.slug}`,
        name: b.name,
        initial: b.initial,
        sector: b.sector,
        providerCount: b.providerCount,
        courseCount: b.courseCount,
        logo: null,
        about: b.about,
        website: b.website || null,
      })),
      isFallback: true,
    }
  }
}

export async function getBrandBySlug(
  slug: string,
): Promise<{ brand: BrandCardData | null; providers: ProviderCardData[]; courses: CourseCardData[]; isFallback: boolean }> {
  try {
    const payload = await client()
    const res = await payload.find({ collection: 'brands', where: { slug: { equals: slug } }, limit: 1, depth: 1 })
    if (res.docs.length === 0) throw new Error('empty')
    const b = res.docs[0]
    const courses = await payload.find({
      collection: 'courses',
      where: { brand: { equals: b.id }, status: { equals: 'published' } } as never,
      depth: 1,
      limit: 12,
    })
    const trainers = await payload.find({ collection: 'trainers', where: { brand: { equals: b.id } } as never, depth: 1, limit: 12 })
    return {
      brand: {
        id: b.id,
        slug: b.slug,
        href: `/merken/${b.slug}`,
        name: b.name,
        initial: b.name[0],
        sector: (b.tags && b.tags[0]) || 'Wellnessmerk',
        providerCount: trainers.totalDocs,
        courseCount: courses.totalDocs,
        logo: mediaUrl(b.logo),
        website: b.website,
      },
      providers: trainers.docs.map((t) => ({
        slug: t.slug,
        href: `/opleiders/${t.slug}`,
        name: t.displayName,
        initial: t.displayName[0],
        location: t.location?.city || 'België',
        speciality: (t.specializations && t.specializations[0]) || 'Wellnessopleiding',
        courseCount: 0,
        logo: mediaUrl(t.photo),
      })),
      courses: courses.docs.map(toCard),
      isFallback: false,
    }
  } catch {
    const fb = FALLBACK_BRANDS.find((b) => b.slug === slug)
    if (!fb) return { brand: null, providers: [], courses: [], isFallback: true }
    return {
      brand: {
        slug: fb.slug,
        href: `/merken/${fb.slug}`,
        name: fb.name,
        initial: fb.initial,
        sector: fb.sector,
        providerCount: fb.providerCount,
        courseCount: fb.courseCount,
        logo: null,
        about: fb.about,
        website: fb.website || null,
      },
      providers: FALLBACK_PROVIDERS.slice(0, 3).map(fallbackProvider),
      courses: FALLBACK_COURSES.slice(0, 3).map(fallbackCard),
      isFallback: true,
    }
  }
}

export type CategoryLanding = {
  name: string
  metaTitle?: string
  metaDescription?: string
  h1: string
  heroIntro: string
  seoIntro: string
  section?: { title: string; body: string }
  faqs?: { q: string; a: string }[]
}

/** Category landing copy: DB `landing` fields first, falling back to the curated CATEGORY_CONTENT. */
export async function getCategoryLanding(slug: string): Promise<CategoryLanding | null> {
  const fb = (CATEGORY_CONTENT as Record<string, any>)[slug]
  let doc: { name?: string; landing?: Record<string, any> } | null = null
  try {
    const payload = await client()
    const res = await payload.find({ collection: 'categories', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
    doc = (res.docs[0] as unknown as { name?: string; landing?: Record<string, any> }) || null
  } catch {
    doc = null
  }
  if (!doc && !fb) return null

  const l = doc?.landing || {}
  const name = doc?.name || fb?.name || slug
  const section =
    l.sectionTitle && l.sectionBody
      ? { title: l.sectionTitle, body: l.sectionBody }
      : fb?.section || undefined
  const faqs =
    Array.isArray(l.faqs) && l.faqs.length
      ? l.faqs.map((f: { question: string; answer: string }) => ({ q: f.question, a: f.answer }))
      : fb?.faqs || undefined

  return {
    name,
    metaTitle: l.metaTitle || fb?.metaTitle,
    metaDescription: l.metaDescription || fb?.metaDescription,
    h1: l.h1 || fb?.h1 || `Opleiding ${name.toLowerCase()} in België`,
    heroIntro: l.heroIntro || fb?.heroIntro || '',
    seoIntro: l.seoIntro || fb?.seoIntro || '',
    section,
    faqs,
  }
}

/** Single source of truth for pricing: the Pricing global, with fallback. */
export async function getPricing(): Promise<PricingData> {
  try {
    const payload = await client()
    const g = (await payload.findGlobal({ slug: 'pricing' as never })) as Record<string, any>
    const tiers = Array.isArray(g?.tiers) && g.tiers.length
      ? g.tiers.map((t: Record<string, any>) => ({
          key: String(t.key || t.name || ''),
          name: t.name,
          tagline: t.tagline || '',
          price: t.price,
          period: t.period || '/jaar',
          desc: t.desc || '',
          recommended: Boolean(t.recommended),
          features: Array.isArray(t.features)
            ? t.features.map((f: { feature?: string }) => f.feature).filter((f: unknown): f is string => Boolean(f))
            : [],
        }))
      : PRICING_FALLBACK.tiers
    const cmp = g?.comparison || {}
    const comparison = Array.isArray(cmp.rows) && cmp.rows.length
      ? { col1: cmp.col1 || 'Basis', col2: cmp.col2 || 'Medium', col3: cmp.col3 || 'Premium', rows: cmp.rows }
      : PRICING_FALLBACK.comparison
    return {
      intro: { ...PRICING_FALLBACK.intro, ...(g?.intro || {}) },
      tiers,
      comparison,
      bottomCta: { ...PRICING_FALLBACK.bottomCta, ...(g?.bottomCta || {}) },
    }
  } catch {
    return PRICING_FALLBACK
  }
}

/** Distinct specialisaties + cities across trainers, for the /opleiders filters. */
export async function getTrainerFilterOptions(): Promise<{ specialisaties: { value: string; label: string }[]; cities: string[] }> {
  try {
    const payload = await client()
    const res = await payload.find({ collection: 'trainers', limit: 200, depth: 0 })
    const specs = new Set<string>()
    const cities = new Set<string>()
    res.docs.forEach((t) => {
      ;(t.specializations || []).forEach((s) => s && specs.add(s))
      if (t.location?.city) cities.add(t.location.city)
    })
    return {
      specialisaties: Array.from(specs).map((v) => ({ value: v, label: specLabel(v) })),
      cities: Array.from(cities).sort((a, b) => a.localeCompare(b, 'nl-BE')),
    }
  } catch {
    return { specialisaties: Object.entries(SPEC_LABELS).map(([value, label]) => ({ value, label })), cities: [] }
  }
}

const BRAND_TAG_LABELS: Record<string, string> = {
  belgisch: 'Belgisch',
  vegan: 'Vegan',
  natuurlijk: 'Natuurlijk',
  professioneel: 'Professioneel',
  biologisch: 'Biologisch',
  duurzaam: 'Duurzaam',
  luxe: 'Luxe',
}

/** Distinct tags present across brands, for the /merken filters. */
export async function getBrandFilterOptions(): Promise<{ value: string; label: string }[]> {
  try {
    const payload = await client()
    const res = await payload.find({ collection: 'brands', limit: 200, depth: 0 })
    const tags = new Set<string>()
    res.docs.forEach((b) => (b.tags || []).forEach((t) => t && tags.add(t)))
    const present = Array.from(tags)
    const source = present.length ? present : Object.keys(BRAND_TAG_LABELS)
    return source.map((v) => ({ value: v, label: BRAND_TAG_LABELS[v] || v }))
  } catch {
    return Object.entries(BRAND_TAG_LABELS).map(([value, label]) => ({ value, label }))
  }
}

export const categoryTiles = CATEGORY_TILES
