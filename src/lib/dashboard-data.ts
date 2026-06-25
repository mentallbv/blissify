import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Course, Category } from '@/payload-types'
import type { Profile } from '@/lib/session'
import type { DashCourse } from '@/components/dashboard/CourseTable'
import { formatPrice } from '@/lib/format'

export type DashCourseRow = DashCourse & {
  id: number
  slug: string
  categorySlug: string
}

const statusForTable = (s: Course['status']): DashCourse['status'] =>
  s === 'published' ? 'active' : s === 'archived' ? 'archived' : 'draft'

/** Where-clause matching courses owned by the current profile (trainer or brand). */
export function ownerWhere(profile: Profile): Record<string, unknown> | null {
  if (!profile) return null
  return profile.kind === 'brand' ? { brand: { equals: profile.doc.id } } : { trainer: { equals: profile.doc.id } }
}

/** All courses for the current profile, any status. */
export async function getMyCourses(profile: Profile): Promise<DashCourseRow[]> {
  const where = ownerWhere(profile)
  if (!where) return []
  const payload = await getPayload({ config: await config })
  const res = await payload.find({
    collection: 'courses',
    where: where as never,
    depth: 1,
    limit: 100,
    sort: '-createdAt',
    overrideAccess: true,
  })
  return res.docs.map((c) => {
    const cat = typeof c.category === 'object' ? (c.category as Category) : null
    return {
      id: c.id,
      slug: c.slug,
      name: c.title,
      category: cat?.name || 'Opleiding',
      categorySlug: cat?.slug || 'overig',
      price: formatPrice(c.price),
      enquiries: 0,
      status: statusForTable(c.status),
    }
  })
}

export async function getMyCourseCounts(profile: Profile): Promise<{ total: number; active: number }> {
  const where = ownerWhere(profile)
  if (!where) return { total: 0, active: 0 }
  const payload = await getPayload({ config: await config })
  const [total, active] = await Promise.all([
    payload.count({ collection: 'courses', where: where as never, overrideAccess: true }),
    payload.count({
      collection: 'courses',
      where: { and: [where, { status: { equals: 'published' } }] } as never,
      overrideAccess: true,
    }),
  ])
  return { total: total.totalDocs, active: active.totalDocs }
}

export const TIER_LIMITS: Record<string, number> = { basis: 1, medium: 5, premium: Infinity }
