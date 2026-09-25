import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Course, Brand, Category, Media, Trainer } from '@/payload-types'
import { formatPrice, formatCardMeta, courseLocation } from './format'
import { publicMediaUrl } from './media'
import { CATEGORY_CONTENT } from './categories'
import { mergeLocations } from './cities'
import type { MerkenGroup, MerkenFacets } from './merken-filters'
import {
  BRAND_PRICING_FALLBACK,
  PRICING_CATALOG_FALLBACK,
  PRICING_FALLBACK,
  type BillingSettings,
  type PricingCatalog,
  type PricingData,
} from './pricing'
import { tierForUser, type TierFeatures } from './tier-features'
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
  providerType: 'trainer' | 'brand'
  premium: boolean
  featured: boolean
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
  accentColor?: string | null
  /** Detail-page fields. Absent on card listings, which do not query them. */
  bio?: unknown
  specializations?: string[]
  province?: string
  online?: boolean
  website?: string
  email?: string
  phone?: string
  social?: { instagram?: string; facebook?: string; tiktok?: string; linkedin?: string }
  /** Premium perk: badge on the public profile. */
  hasPremiumBadge?: boolean
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
  m && typeof m === 'object' ? publicMediaUrl(m) : null

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
    providerType: 'trainer',
    premium: false,
    featured: false,
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
  const trainer = c.trainer && typeof c.trainer === 'object' ? (c.trainer as Trainer) : null
  const categorySlug = cat?.slug || 'overig'
  const owner = (brand as { owner?: unknown } | null)?.owner || (trainer as { owner?: unknown } | null)?.owner
  const ownerUser = owner && typeof owner === 'object' ? owner as { role?: string; subscriptionTier?: string; brandTier?: string } : null
  const derivedPriority = ownerUser ? tierForUser(ownerUser).features.searchPriority : 0
  const priority = Number((c as Course & { tierPriority?: number }).tierPriority || derivedPriority)
  return {
    slug: c.slug,
    href: `/opleidingen/${categorySlug}/${c.slug}`,
    title: c.title,
    category: cat?.name || 'Opleiding',
    categorySlug,
    provider: brand?.name || trainer?.displayName || 'Blissify-opleider',
    providerSlug: brand?.slug || trainer?.slug || '',
    location: courseLocation(c),
    price: formatPrice(c.price),
    format: formatCardMeta(c),
    image: mediaUrl(c.coverImage),
    providerType: brand ? 'brand' : 'trainer',
    premium: priority >= 3,
    featured: Boolean(c.featured),
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
  certificate?: boolean // Certificaat wordt door de aanbieder uitgereikt
  certificationTypes?: string[]
  priceMin?: number
  priceMax?: number
  keyword?: string
  providerType?: 'trainer' | 'brand'
  targetAudiences?: string[]
  practical?: string[]
  focus?: string[]
  popular?: boolean
  free?: boolean
  newOnly?: boolean
  sort?: CourseSort
}

// "Meest relevant" approximates subscription-tier priority via featured flags,
// since courses carry no denormalised tier field (see note in getCoursePageData).
const SORT_MAP: Record<CourseSort, string | string[]> = {
  relevant: ['-tierPriority', '-featured', '-createdAt'],
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
      if (id) {
        const children = await payload.find({
          collection: 'categories',
          where: { parent: { equals: id } },
          limit: 200,
          depth: 0,
        })
        const ids = [id, ...children.docs.map((child) => child.id)]
        and.push({ category: { in: ids } })
      }
      else and.push({ category: { equals: -1 } }) // unknown category -> no matches
    }
    if (opts.city) and.push({ 'location.city': { equals: opts.city } })
    if (opts.format) and.push({ format: { contains: opts.format } })
    if (opts.certificate) and.push({ certificate: { equals: true } })
    if (opts.certificationTypes?.length) and.push({ certificationTypes: { in: opts.certificationTypes } })
    if (typeof opts.priceMin === 'number') and.push({ 'price.amount': { greater_than_equal: opts.priceMin } })
    if (typeof opts.priceMax === 'number') and.push({ 'price.amount': { less_than_equal: opts.priceMax } })
    if (opts.keyword) {
      and.push({
        or: [{ title: { like: opts.keyword } }, { shortDescription: { like: opts.keyword } }],
      })
    }
    if (opts.providerType === 'brand') and.push({ brand: { exists: true } })
    if (opts.providerType === 'trainer') and.push({ trainer: { exists: true } })
    if (opts.targetAudiences?.length) and.push({ targetAudience: { in: opts.targetAudiences } })
    if (opts.practical?.length) and.push({ practical: { in: opts.practical } })
    if (opts.focus?.length) and.push({ focus: { in: opts.focus } })
    if (opts.popular) and.push({ popular: { equals: true } })
    if (opts.free) and.push({ 'price.isFree': { equals: true } })
    if (opts.newOnly) {
      const since = new Date(Date.now() - 30 * 86400000).toISOString()
      and.push({ createdAt: { greater_than_equal: since } })
    }

    const res = await payload.find({
      collection: 'courses',
      where: { and } as never,
      limit: opts.limit || 24,
      page: opts.page || 1,
      depth: 2,
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
  categories: { slug: string; name: string; parentSlug: string | null }[]
  /** Published-course counts per category slug (a main rolls up its subs). */
  categoryCounts: Record<string, number>
  cities: string[]
  priceMin: number
  priceMax: number
}

/** Live select options for the course filters: categories, distinct cities, price bounds. */
export async function getCourseFilterOptions(): Promise<CourseFilterOptions> {
  try {
    const payload = await client()
    const [cats, courses] = await Promise.all([
      // depth 1 so `parent` resolves to the full category (with its slug); at
      // depth 0 parent is only an id and parentSlug collapses to null, which
      // flattens the hierarchical (hoofd -> sub) course filter into one long
      // alphabetical list.
      payload.find({ collection: 'categories', limit: 200, depth: 1, sort: 'name' }),
      payload.find({ collection: 'courses', where: { status: { equals: 'published' } } as never, limit: 500, depth: 0 }),
    ])
    // Maps for rolling course counts up to the main category.
    const idToSlug = new Map<number, string>()
    const idToMainSlug = new Map<number, string>()
    for (const c of cats.docs) idToSlug.set(c.id as number, c.slug)
    for (const c of cats.docs) {
      const parent = (c as { parent?: { slug?: string } | number }).parent
      idToMainSlug.set(c.id as number, !parent ? c.slug : typeof parent === 'object' ? parent.slug || c.slug : idToSlug.get(parent) || c.slug)
    }
    const categoryCounts: Record<string, number> = {}
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
      const catRel = (c as { category?: number | { id: number } }).category
      const catId = typeof catRel === 'object' ? catRel?.id : catRel
      if (catId) {
        const exact = idToSlug.get(catId as number)
        const main = idToMainSlug.get(catId as number)
        if (exact) categoryCounts[exact] = (categoryCounts[exact] || 0) + 1
        if (main && main !== exact) categoryCounts[main] = (categoryCounts[main] || 0) + 1
      }
    })
    return {
      categories: cats.docs.map((c) => ({
        slug: c.slug,
        name: c.name,
        parentSlug: c.parent && typeof c.parent === 'object' ? c.parent.slug : null,
      })),
      categoryCounts,
      cities: mergeLocations(Array.from(cities)),
      priceMin: Number.isFinite(min) ? Math.floor(min) : 0,
      priceMax: max > 0 ? Math.ceil(max) : 2000,
    }
  } catch {
    return {
      categories: CATEGORY_TILES.map((c) => ({ slug: c.slug, name: c.name, parentSlug: null })),
      categoryCounts: {},
      cities: mergeLocations(),
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

/**
 * Index that ties opleiders (trainers) to the course category taxonomy so the
 * /opleiders "Specialisatie" filter can use the SAME category list as the
 * courses (client feedback #3). A trainer "specialises" in a main category when
 * they have at least one published course in that category or one of its
 * subcategories.
 *
 * Returns the 13 main categories (for the filter options), a map of
 * trainerId -> set of main-category slugs, and the reverse counts per main
 * category (for the facet numbers in the filter bar).
 */
type TrainerCategoryIndex = {
  mainCategories: { value: string; label: string }[]
  /** Full taxonomy (mains + subs) as picker options; subs carry their main as `group`. */
  allCategories: { value: string; label: string; group?: string }[]
  /** trainerId -> every category slug it covers (the exact course category AND its main). */
  trainerSlugs: Map<number, Set<string>>
  /** unique-trainer counts per slug (main and sub). */
  counts: Record<string, number>
}

async function getTrainerCategoryIndex(): Promise<TrainerCategoryIndex> {
  const payload = await client()
  const [cats, courses] = await Promise.all([
    payload.find({ collection: 'categories', limit: 300, depth: 1 }),
    payload.find({ collection: 'courses', where: { status: { equals: 'published' } } as never, limit: 1000, depth: 0 }),
  ])

  // id -> slug, and id -> MAIN (root) slug. A root maps to itself; a subcategory
  // maps to its parent's slug.
  const idToSlug = new Map<number, string>()
  const idToMainSlug = new Map<number, string>()
  const mainLabelBySlug = new Map<string, string>()
  const mainCategories: { value: string; label: string }[] = []
  for (const c of cats.docs) {
    idToSlug.set(c.id as number, c.slug)
    const parent = (c as { parent?: unknown }).parent
    if (!parent) {
      idToMainSlug.set(c.id as number, c.slug)
      mainLabelBySlug.set(c.slug, c.name)
      mainCategories.push({ value: c.slug, label: c.name })
    }
  }
  const allCategories: { value: string; label: string; group?: string }[] = []
  for (const c of cats.docs) {
    const parent = (c as { parent?: { id?: number; slug?: string; name?: string } | number }).parent
    if (parent) {
      const parentSlug = typeof parent === 'object' ? parent.slug : idToMainSlug.get(parent)
      if (parentSlug) idToMainSlug.set(c.id as number, parentSlug)
      allCategories.push({ value: c.slug, label: c.name, group: parentSlug ? mainLabelBySlug.get(parentSlug) : undefined })
    } else {
      allCategories.push({ value: c.slug, label: c.name })
    }
  }
  mainCategories.sort((a, b) => a.label.localeCompare(b.label, 'nl-BE'))
  allCategories.sort((a, b) => a.label.localeCompare(b.label, 'nl-BE'))

  const trainerSlugs = new Map<number, Set<string>>()
  const counted = new Map<string, Set<number>>() // slug -> unique trainerIds
  const addCount = (slug: string, tid: number) => {
    if (!counted.has(slug)) counted.set(slug, new Set())
    counted.get(slug)!.add(tid)
  }
  for (const course of courses.docs as unknown as { trainer?: number | { id: number } | null; category?: number | { id: number } | null }[]) {
    const trainerId = typeof course.trainer === 'object' ? course.trainer?.id : course.trainer
    const categoryId = typeof course.category === 'object' ? course.category?.id : course.category
    if (!trainerId || !categoryId) continue
    const exactSlug = idToSlug.get(categoryId as number)
    const mainSlug = idToMainSlug.get(categoryId as number)
    if (!trainerSlugs.has(trainerId as number)) trainerSlugs.set(trainerId as number, new Set())
    const set = trainerSlugs.get(trainerId as number)!
    if (exactSlug) { set.add(exactSlug); addCount(exactSlug, trainerId as number) }
    if (mainSlug && mainSlug !== exactSlug) { set.add(mainSlug); addCount(mainSlug, trainerId as number) }
  }

  const counts: Record<string, number> = {}
  for (const [slug, ids] of counted) counts[slug] = ids.size

  return { mainCategories, allCategories, trainerSlugs, counts }
}

/** Opleiders = trainers. Maps a trainer doc to the shared provider-card shape. */
export async function getProviderCards(
  opts: { limit?: number; specialisatie?: string; specialisaties?: string[]; city?: string } | number = {},
): Promise<{ cards: ProviderCardData[]; isFallback: boolean }> {
  // Back-compat: a number used to mean `limit`.
  const o = typeof opts === 'number' ? { limit: opts } : opts
  const limit = o.limit
  // Specialisatie now maps to the course category taxonomy (client #3): accept a
  // multi list, falling back to the legacy single param.
  const specSlugs = (o.specialisaties && o.specialisaties.length ? o.specialisaties : o.specialisatie ? [o.specialisatie] : []).filter(Boolean)
  try {
    const payload = await client()
    const and: Record<string, unknown>[] = []
    if (o.city) and.push({ 'location.city': { equals: o.city } })
    const [res, index] = await Promise.all([
      payload.find({
        collection: 'trainers',
        where: (and.length ? { and } : undefined) as never,
        limit: limit || 24,
        depth: 1,
      }),
      getTrainerCategoryIndex(),
    ])
    // Filter by specialisatie in memory: a trainer matches when any selected
    // main category is among the categories it teaches (derived from courses).
    const filtered = specSlugs.length
      ? res.docs.filter((t) => {
          const slugs = index.trainerSlugs.get(t.id as number)
          return slugs ? specSlugs.some((s) => slugs.has(s)) : false
        })
      : res.docs
    if (filtered.length === 0 && and.length === 0 && specSlugs.length === 0) throw new Error('empty')
    const mainLabel = new Map(index.mainCategories.map((m) => [m.value, m.label]))
    const cards = await Promise.all(
      filtered.map(async (t) => {
        const courses = await payload.count({
          collection: 'courses',
          where: { trainer: { equals: t.id }, status: { equals: 'published' } } as never,
        })
        const slugs = index.trainerSlugs.get(t.id as number)
        const firstMain = slugs ? [...slugs].map((s) => mainLabel.get(s)).find(Boolean) : undefined
        return {
          slug: t.slug,
          href: `/opleiders/${t.slug}`,
          name: t.displayName,
          initial: t.displayName[0],
          location: t.location?.city || 'België',
          speciality: firstMain || specLabel(t.specializations?.[0]),
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

    const ownerRel = (t as { owner?: unknown }).owner
    const ownerId = ownerRel && typeof ownerRel === 'object' ? (ownerRel as { id?: number | string }).id : ownerRel
    const owner = ownerId
      ? await payload.findByID({ collection: 'users', id: ownerId as never, depth: 0, overrideAccess: true }).catch(() => null)
      : null
    const ownerFeatures = tierForUser((owner || { role: 'trainer' }) as never).features
    const rawAccent = (t as { profileAccentColor?: string | null }).profileAccentColor || ''
    const accentColor = /^#[0-9a-f]{6}$/i.test(rawAccent) ? rawAccent : null

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
        // Both are paid perks (Medium: branding, Premium: badge), so they are
        // resolved from the owning account's tier rather than the profile alone.
        accentColor: ownerFeatures.hasProfileBranding ? accentColor : null,
        hasPremiumBadge: ownerFeatures.hasPremiumBadge,
        bio: t.bio,
        specializations: (t.specializations || []).map((spec) => specLabel(spec)),
        province: t.location?.province || '',
        online: Boolean(t.location?.online),
        website: t.website || '',
        email: t.email || '',
        phone: t.phone || '',
        social: {
          instagram: t.social?.instagram || '',
          facebook: t.social?.facebook || '',
          tiktok: (t.social as { tiktok?: string } | undefined)?.tiktok || '',
          linkedin: t.social?.linkedin || '',
        },
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

// ── Homepage exposure sections (B3/B4/B5) ───────────────────────────────────
// Tier-gated: only courses owned by accounts with a "homepage exposure" perk.
//   - Opleider Premium (subscriptionTier premium)
//   - Brand Partner Professional / Premium (brandTier), Premium weighted first
const relId = (v: unknown): string => (v && typeof v === 'object' ? String((v as { id?: unknown }).id) : String(v))

export type HomepageCategorySection = { slug: string; name: string; courses: CourseCardData[] }

const DEFAULT_OPLEIDER_TIERS = ['premium']
const DEFAULT_BRAND_TIERS = ['partner_premium']

export async function getHomepageSections(): Promise<{
  brandCourses: CourseCardData[]
  opleiderCourses: CourseCardData[]
}> {
  const empty = { brandCourses: [], opleiderCourses: [] }
  try {
    const payload = await client()

    // Eligibility is admin-configurable via the Subscription Settings global.
    let opleiderTiers = DEFAULT_OPLEIDER_TIERS
    let brandTiers = DEFAULT_BRAND_TIERS
    try {
      const settings = (await payload.findGlobal({ slug: 'subscription-settings' as never })) as {
        homepageOpleiderTiers?: string[]
        homepageBrandTiers?: string[]
      }
      if (settings?.homepageOpleiderTiers?.length) opleiderTiers = settings.homepageOpleiderTiers
      if (settings?.homepageBrandTiers?.length) brandTiers = settings.homepageBrandTiers
    } catch {
      /* global not created yet -> defaults */
    }

    const [trainersRes, brandsRes] = await Promise.all([
      payload.find({ collection: 'trainers', depth: 1, limit: 500 }),
      payload.find({ collection: 'brands', depth: 1, limit: 500 }),
    ])
    const ownerTier = (o: unknown, key: 'subscriptionTier' | 'brandTier'): string | undefined =>
      o && typeof o === 'object' ? (o as Record<string, string | undefined>)[key] : undefined

    const eligibleTrainerIds = (trainersRes.docs as { id: number; owner?: unknown }[])
      .filter((t) => opleiderTiers.includes(ownerTier(t.owner, 'subscriptionTier') || ''))
      .map((t) => t.id)
    const eligibleBrandIds = (brandsRes.docs as { id: number; owner?: unknown }[])
      .filter((b) => brandTiers.includes(ownerTier(b.owner, 'brandTier') || ''))
      .map((b) => b.id)
    // Highest-tier accounts are weighted first in the featured / brand lists.
    const topBrandIds = new Set(
      (brandsRes.docs as { id: number; owner?: unknown }[])
        .filter((b) => ownerTier(b.owner, 'brandTier') === 'partner_premium')
        .map((b) => String(b.id)),
    )
    const topTrainerIds = new Set(
      (trainersRes.docs as { id: number; owner?: unknown }[])
        .filter((t) => ownerTier(t.owner, 'subscriptionTier') === 'premium')
        .map((t) => String(t.id)),
    )
    const isTop = (c: Course) => topBrandIds.has(relId(c.brand)) || topTrainerIds.has(relId(c.trainer))

    // Section 2 - Merken & Leveranciers only (premium weighted first)
    let brandCourses: CourseCardData[] = []
    if (eligibleBrandIds.length) {
      const res = await payload.find({
        collection: 'courses',
        where: { and: [{ status: { equals: 'published' } }, { featured: { equals: true } }, { brand: { in: eligibleBrandIds } }] } as never,
        depth: 2,
        limit: 24,
      })
      const docs = [...(res.docs as Course[])].sort((a, b) => (isTop(b) ? 1 : 0) - (isTop(a) ? 1 : 0))
      brandCourses = docs.slice(0, 6).map(toCard)
    }

    // Section 3 - individual Opleiders only (premium weighted first)
    let opleiderCourses: CourseCardData[] = []
    if (eligibleTrainerIds.length) {
      const res = await payload.find({
        collection: 'courses',
        where: { and: [{ status: { equals: 'published' } }, { featured: { equals: true } }, { trainer: { in: eligibleTrainerIds } }] } as never,
        depth: 2,
        limit: 24,
      })
      const docs = [...(res.docs as Course[])].sort((a, b) => (isTop(b) ? 1 : 0) - (isTop(a) ? 1 : 0))
      opleiderCourses = docs.slice(0, 6).map(toCard)
    }

    return { brandCourses, opleiderCourses }
  } catch {
    return empty
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
  cover?: string | null
  about?: string
  /** Raw Lexical for the detail page; `about` is the flattened card version. */
  description?: unknown
  /** Paid perks, resolved from the owning account's tier. */
  accentColor?: string | null
  hasPremiumBadge?: boolean
  website?: string | null
  email?: string | null
  partnerType?: string | null
  origin?: string | null
  social?: { instagram?: string | null; facebook?: string | null; tiktok?: string | null }
  gallery?: { image: string; caption?: string | null }[]
  localPartners?: { name: string; country: string; website?: string | null }[]
}

function richTextToPlainText(value: unknown): string {
  const root = (value as { root?: { children?: unknown[] } } | null)?.root
  if (!root?.children) return ''
  const parts: string[] = []
  const walk = (nodes: unknown[]) => {
    for (const raw of nodes) {
      const node = raw as { text?: string; children?: unknown[] }
      if (node.text) parts.push(node.text)
      if (node.children) walk(node.children)
    }
  }
  walk(root.children)
  return parts.join(' ').trim()
}

export type MerkenFilters = {
  q?: string
  producttype?: string[]
  typePartner?: string
  herkomst?: string
  positionering?: string
  filosofie?: string[]
  extra?: string[]
}

export async function getBrandCards(opts: MerkenFilters = {}): Promise<{ cards: BrandCardData[]; isFallback: boolean }> {
  try {
    const payload = await client()
    const and: Record<string, unknown>[] = []
    if (opts.q) and.push({ name: { like: opts.q } })
    if (opts.producttype?.length) and.push({ productType: { in: opts.producttype } })
    if (opts.typePartner) and.push({ typePartner: { equals: opts.typePartner } })
    if (opts.herkomst) and.push({ herkomst: { equals: opts.herkomst } })
    if (opts.positionering) and.push({ positionering: { equals: opts.positionering } })
    if (opts.filosofie?.length) and.push({ tags: { in: opts.filosofie } })
    if (opts.extra?.includes('top-beoordeeld')) and.push({ topRated: { equals: true } })
    const hasFilters = and.length > 0 || Boolean(opts.extra?.length)
    const newest = opts.extra?.includes('nieuw')

    const res = await payload.find({
      collection: 'brands',
      where: (and.length ? { and } : undefined) as never,
      sort: newest ? '-createdAt' : undefined,
      limit: 48,
      depth: 1,
    })
    if (res.docs.length === 0 && !hasFilters) throw new Error('empty')
    let cards = await Promise.all(
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
    // "Alleen met opleidingen" is a post-filter (depends on live course counts).
    if (opts.extra?.includes('met-opleidingen')) cards = cards.filter((c) => c.courseCount > 0)
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

/** Live per-option counts for the Merken filter (e.g. "Vegan (32)"). */
export async function getMerkenFacets(): Promise<import('./merken-filters').MerkenFacets> {
  const facets: import('./merken-filters').MerkenFacets = {}
  try {
    const payload = await client()
    const res = await payload.find({ collection: 'brands', depth: 0, limit: 500 })
    const brands = res.docs as {
      id: number
      productType?: string[] | null
      typePartner?: string | null
      herkomst?: string | null
      positionering?: string | null
      tags?: string[] | null
      createdAt?: string
      topRated?: boolean | null
    }[]

    const inc = (group: string, value: string) => {
      facets[group] ||= {}
      facets[group][value] = (facets[group][value] || 0) + 1
    }
    const thirtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000

    // brands that have >=1 published course (for "Alleen met opleidingen")
    const coursesRes = await payload.find({
      collection: 'courses',
      where: { and: [{ status: { equals: 'published' } }, { brand: { exists: true } }] } as never,
      depth: 0,
      limit: 1000,
    })
    const brandsWithCourses = new Set(
      (coursesRes.docs as { brand?: unknown }[]).map((c) => (c.brand && typeof c.brand === 'object' ? (c.brand as { id: number }).id : c.brand)).filter(Boolean).map(String),
    )

    for (const b of brands) {
      ;(b.productType || []).forEach((v) => inc('producttype', v))
      if (b.typePartner) inc('typePartner', b.typePartner)
      if (b.herkomst) inc('herkomst', b.herkomst)
      if (b.positionering) inc('positionering', b.positionering)
      ;(b.tags || []).forEach((v) => inc('filosofie', v))
      if (brandsWithCourses.has(String(b.id))) inc('extra', 'met-opleidingen')
      if (b.createdAt && new Date(b.createdAt).getTime() >= thirtyDaysAgo) inc('extra', 'nieuw')
      if (b.topRated) inc('extra', 'top-beoordeeld')
    }
  } catch {
    // graceful: empty facets -> filter shows options without counts
  }
  return facets
}

export async function getBrandBySlug(
  slug: string,
): Promise<{ brand: BrandCardData | null; providers: ProviderCardData[]; courses: CourseCardData[]; isFallback: boolean }> {
  try {
    const payload = await client()
    const res = await payload.find({ collection: 'brands', where: { slug: { equals: slug } }, limit: 1, depth: 1 })
    if (res.docs.length === 0) throw new Error('empty')
    const b = res.docs[0]
    const details = b as typeof b & {
      gallery?: { image?: number | Media | null; caption?: string | null }[]
      social?: { instagram?: string | null; facebook?: string | null; tiktok?: string | null }
      localPartners?: { name: string; country: string; website?: string | null }[]
    }
    const courses = await payload.find({
      collection: 'courses',
      where: { brand: { equals: b.id }, status: { equals: 'published' } } as never,
      depth: 1,
      limit: 12,
    })
    const trainers = await payload.find({ collection: 'trainers', where: { brand: { equals: b.id } } as never, depth: 1, limit: 12 })

    // Branding and the Premium badge are paid perks, resolved from the owning
    // account's tier rather than from the brand document alone.
    const brandOwnerRel = (b as { owner?: unknown }).owner
    const brandOwnerId = brandOwnerRel && typeof brandOwnerRel === 'object' ? (brandOwnerRel as { id?: number | string }).id : brandOwnerRel
    const brandOwner = brandOwnerId
      ? await payload.findByID({ collection: 'users', id: brandOwnerId as never, depth: 0, overrideAccess: true }).catch(() => null)
      : null
    const brandFeatures = tierForUser((brandOwner || { role: 'brand' }) as never).features
    const brandAccent = (b as { profileAccentColor?: string | null }).profileAccentColor || ''

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
        cover: mediaUrl((b as { coverImage?: number | Media | null }).coverImage),
        about: richTextToPlainText(b.description),
        // Raw Lexical, so the detail page can render the brand's own formatting.
        description: b.description,
        accentColor: brandFeatures.hasProfileBranding && /^#[0-9a-f]{6}$/i.test(brandAccent) ? brandAccent : null,
        hasPremiumBadge: brandFeatures.hasPremiumBadge,
        website: b.website,
        email: b.email,
        partnerType: b.typePartner,
        origin: b.herkomst,
        social: details.social || {},
        gallery: (details.gallery || []).flatMap((item) => {
          const image = mediaUrl(item.image)
          return image ? [{ image, caption: item.caption }] : []
        }),
        localPartners: details.localPartners || [],
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

function mapPricingAudience(raw: Record<string, any> | undefined, fallback: PricingData): PricingData {
  const cleanTrustCopy = (value: string) =>
    value
      .replace(/geverifieerde opleiders/gi, 'professionele opleiders')
      .replace(/geverifieerde aanbieders/gi, 'professionele aanbieders')
  const source = raw || {}
  // Ignore the retired pre-2.0 ladder if stale CMS data still exists. Current
  // plans remain editable in the CMS, but legacy names must never override the
  // Blissify 2.0 pricing required by the client.
  const sourceTiers = Array.isArray(source.tiers) ? source.tiers : []
  const hasLegacyTierNames = sourceTiers.some((tier: Record<string, unknown>) =>
    ['basis', 'medium', 'premium'].includes(String(tier.name || '').trim().toLowerCase()),
  )
  const withDefined = <T extends Record<string, unknown>>(base: T, values?: Record<string, unknown>): T =>
    ({ ...base, ...Object.fromEntries(Object.entries(values || {}).filter(([, value]) => value != null && value !== '')) }) as T
  const tiers = sourceTiers.length && !hasLegacyTierNames
    ? sourceTiers.map((t: Record<string, any>) => {
        const annualPrice = Number(t.annualPrice || String(t.price || '').replace(/[^\d]/g, ''))
        return {
          key: String(t.key || t.name || ''),
          name: t.name,
          tagline: t.tagline || '',
          annualPrice,
          monthlyPrice: t.monthlyPrice ? Number(t.monthlyPrice) : fallback.tiers.find((item) => item.key === t.key)?.monthlyPrice,
          price: `€ ${annualPrice.toLocaleString('nl-BE')}`,
          period: '/jaar',
          desc: t.desc || '',
          recommended: Boolean(t.recommended),
          features: Array.isArray(t.features)
            ? t.features.map((f: { feature?: string }) => f.feature).filter((f: unknown): f is string => Boolean(f))
            : [],
        }
      })
    : fallback.tiers
  const cmp = source.comparison || {}
  return {
    audience: fallback.audience,
    intro: withDefined(fallback.intro, source.intro),
    tiers,
    comparison: Array.isArray(cmp.rows) && cmp.rows.length
      ? { col1: cmp.col1 || fallback.comparison.col1, col2: cmp.col2 || fallback.comparison.col2, col3: cmp.col3 || fallback.comparison.col3, rows: cmp.rows }
      : fallback.comparison,
    bottomCta: withDefined(fallback.bottomCta, {
      ...source.bottomCta,
      body: cleanTrustCopy(source.bottomCta?.body || fallback.bottomCta.body),
    }),
  }
}

/** Both pricing ladders plus the shared billing rules. */
export async function getPricingCatalog(): Promise<PricingCatalog> {
  try {
    const payload = await client()
    const g = (await payload.findGlobal({ slug: 'pricing' as never })) as Record<string, any>
    const billingRaw = g?.billing || {}
    const billing: BillingSettings = {
      // Blissify 2.0 explicitly has no trial. Legacy CMS fields remain only
      // for schema compatibility and cannot re-enable it.
      trialEnabled: false,
      trialDays: 0,
      monthlyEnabled: billingRaw.monthlyEnabled ?? PRICING_CATALOG_FALLBACK.billing.monthlyEnabled,
      monthlyMarkupPercent: Number(billingRaw.monthlyMarkupPercent ?? PRICING_CATALOG_FALLBACK.billing.monthlyMarkupPercent),
      monthlyCommitment: 'cancel_anytime',
    }
    const legacyOpleiders = g?.opleiders?.tiers?.length
      ? g.opleiders
      : { intro: g?.intro, tiers: g?.tiers, comparison: g?.comparison, bottomCta: g?.bottomCta }
    return {
      billing,
      opleiders: mapPricingAudience(legacyOpleiders, PRICING_FALLBACK),
      brands: mapPricingAudience(g?.brands, BRAND_PRICING_FALLBACK),
    }
  } catch {
    return PRICING_CATALOG_FALLBACK
  }
}

/** Backward-compatible trainer pricing accessor. */
export async function getPricing(): Promise<PricingData> {
  return (await getPricingCatalog()).opleiders
}

export type PublicReview = {
  id: string
  reviewerName: string
  rating: number
  body: string
  createdAt: string
}

export async function getApprovedCourseReviews(courseId: string | number): Promise<PublicReview[]> {
  try {
    const payload = await client()
    const result = await payload.find({
      collection: 'reviews' as never,
      where: { and: [{ course: { equals: courseId } }, { status: { equals: 'approved' } }] } as never,
      sort: '-createdAt',
      limit: 50,
      depth: 0,
      overrideAccess: true,
    })
    return result.docs.map((review: any) => ({
      id: String(review.id),
      reviewerName: review.reviewerName,
      rating: Number(review.rating),
      body: review.body,
      createdAt: review.createdAt,
    }))
  } catch {
    return []
  }
}

export type CourseTierContext = {
  role: 'trainer' | 'brand'
  tier: string
  features: TierFeatures
  accentColor: string | null
}

export async function getCourseTierContext(course: Course): Promise<CourseTierContext> {
  const role = course.brand ? 'brand' : 'trainer'
  const fallback = tierForUser({ role })
  try {
    const payload = await client()
    const relation = role === 'brand' ? course.brand : course.trainer
    const profileId = relation && typeof relation === 'object' ? relation.id : relation
    if (!profileId) return { ...fallback, accentColor: null }
    const profile = await payload.findByID({
      collection: role === 'brand' ? 'brands' : 'trainers',
      id: profileId as never,
      depth: 0,
      overrideAccess: true,
    })
    const owner = (profile as { owner?: unknown }).owner
    const ownerId = owner && typeof owner === 'object' ? (owner as { id?: number | string }).id : owner
    if (!ownerId) return { ...fallback, accentColor: null }
    const user = await payload.findByID({ collection: 'users', id: ownerId as never, depth: 0, overrideAccess: true })
    const resolved = tierForUser(user)
    // Both ladders now store their own colour; brands previously got a
    // hardcoded gold that came from no field and no client request.
    const rawAccent = (profile as { profileAccentColor?: string | null }).profileAccentColor
    const accentColor =
      resolved.features.hasProfileBranding && rawAccent && /^#[0-9a-f]{6}$/i.test(rawAccent) ? rawAccent : null
    return { ...resolved, accentColor }
  } catch {
    return { ...fallback, accentColor: null }
  }
}

/**
 * Filter config for /opleiders, built in the same shape the MerkenFilterBar
 * uses (client #3: same filter style as merken). "Specialisatie" is the course
 * category taxonomy (main categories) as a multi-select mega menu; "Locatie" is
 * a single-select dropdown of the merged Belgian city list. Facets carry the
 * per-option counts shown in the bar.
 */
export async function getTrainerFilterOptions(): Promise<{ groups: MerkenGroup[]; facets: MerkenFacets }> {
  try {
    const payload = await client()
    const [res, index] = await Promise.all([
      payload.find({ collection: 'trainers', limit: 300, depth: 0 }),
      getTrainerCategoryIndex(),
    ])
    const cityCounts: Record<string, number> = {}
    res.docs.forEach((t) => {
      const city = t.location?.city
      if (city) cityCounts[city] = (cityCounts[city] || 0) + 1
    })
    const cities = mergeLocations(Object.keys(cityCounts))
    const groups: MerkenGroup[] = [
      {
        key: 'specialisatie',
        name: 'Specialisatie',
        ui: 'mega',
        multi: true,
        // Full category taxonomy (mains + subs), so Specialisatie corresponds
        // with the complete list used for courses (client #3). The picker's
        // search + A-Z index keep it usable at this size.
        options: index.allCategories,
      },
      {
        key: 'locatie',
        name: 'Locatie',
        ui: 'dropdown',
        multi: false,
        options: cities.map((c) => ({ value: c, label: c })),
      },
    ]
    return { groups, facets: { specialisatie: index.counts, locatie: cityCounts } }
  } catch {
    return {
      groups: [
        { key: 'specialisatie', name: 'Specialisatie', ui: 'mega', multi: true, options: Object.entries(SPEC_LABELS).map(([value, label]) => ({ value, label })) },
        { key: 'locatie', name: 'Locatie', ui: 'dropdown', multi: false, options: mergeLocations().map((c) => ({ value: c, label: c })) },
      ],
      facets: {},
    }
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
