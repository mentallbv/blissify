import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Course, Brand, Category, Media } from '@/payload-types'
import { formatPrice, formatCardMeta, courseLocation } from './format'
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
export async function getCourseCards(
  opts: { limit?: number; categorySlug?: string; city?: string } = {},
): Promise<{
  cards: CourseCardData[]
  total: number
  isFallback: boolean
}> {
  try {
    const payload = await client()
    const and: Record<string, unknown>[] = [{ status: { equals: 'published' } }]
    if (opts.categorySlug) {
      const cat = await payload.find({
        collection: 'categories',
        where: { slug: { equals: opts.categorySlug } },
        limit: 1,
      })
      const id = cat.docs[0]?.id
      if (id) and.push({ category: { equals: id } })
    }
    if (opts.city) and.push({ 'location.city': { like: opts.city } })
    const res = await payload.find({
      collection: 'courses',
      where: { and } as never,
      limit: opts.limit || 24,
      depth: 1,
      sort: '-createdAt',
    })
    if (res.docs.length === 0) throw new Error('empty')
    return { cards: res.docs.map(toCard), total: res.totalDocs, isFallback: false }
  } catch {
    let list = FALLBACK_COURSES
    if (opts.categorySlug) list = list.filter((c) => c.categorySlug === opts.categorySlug)
    if (opts.city) {
      const cityLc = opts.city.toLowerCase()
      const byCity = list.filter((c) => c.location.toLowerCase() === cityLc)
      list = byCity.length ? byCity : list
    }
    if (list.length === 0) list = FALLBACK_COURSES
    const cards = list.map(fallbackCard)
    return {
      cards: opts.limit ? cards.slice(0, opts.limit) : cards,
      total: cards.length,
      isFallback: true,
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

export async function getProviderCards(limit?: number): Promise<{ cards: ProviderCardData[]; isFallback: boolean }> {
  try {
    const payload = await client()
    const res = await payload.find({ collection: 'brands', limit: limit || 24, depth: 1 })
    if (res.docs.length === 0) throw new Error('empty')
    const cards = await Promise.all(
      res.docs.map(async (b) => {
        const courses = await payload.count({
          collection: 'courses',
          where: { brand: { equals: b.id }, status: { equals: 'published' } } as never,
        })
        return {
          slug: b.slug,
          href: `/opleiders/${b.slug}`,
          name: b.name,
          initial: b.name[0],
          location: 'België',
          speciality: (b.tags && b.tags[0]) || 'Wellnessopleiding',
          courseCount: courses.totalDocs,
          logo: mediaUrl(b.logo),
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
    const res = await payload.find({ collection: 'brands', where: { slug: { equals: slug } }, limit: 1, depth: 1 })
    if (res.docs.length === 0) throw new Error('empty')
    const b = res.docs[0]
    const courses = await payload.find({
      collection: 'courses',
      where: { brand: { equals: b.id }, status: { equals: 'published' } } as never,
      depth: 1,
      limit: 12,
    })
    return {
      provider: {
        slug: b.slug,
        href: `/opleiders/${b.slug}`,
        name: b.name,
        initial: b.name[0],
        location: 'België',
        speciality: (b.tags && b.tags[0]) || 'Wellnessopleiding',
        courseCount: courses.totalDocs,
        logo: mediaUrl(b.logo),
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

export async function getBrandCards(): Promise<{ cards: BrandCardData[]; isFallback: boolean }> {
  try {
    const payload = await client()
    const res = await payload.find({ collection: 'brands', limit: 48, depth: 1 })
    if (res.docs.length === 0) throw new Error('empty')
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

export const categoryTiles = CATEGORY_TILES
