import type { Payload } from 'payload'
import { tierForUser } from '@/lib/tier-features'
import { isEntitled } from '@/lib/entitlement'
import { publicMediaUrl } from '@/lib/media'

/**
 * Samenwerkingen opleider ↔ merk (client round 2, section 5).
 *
 * The single visibility rule: a collaboration counts (on profiles, on course
 * pages and in the course form) only when it is approved AND the brand still
 * has an active Partner Ultimate plan. A brand that downgrades keeps its
 * collaborations in the database; they reappear when it upgrades again.
 */

type OwnerUser = { role?: string | null; brandTier?: string | null; subscriptionTier?: string | null; subscriptionStatus?: string | null; subscriptionExpiresAt?: string | null }

export type CollaborationStatus = 'pending' | 'approved' | 'declined' | 'removed'

/** Whether a brand owner may start and show collaborations: Partner Ultimate, currently paid up. */
export function brandOwnerCanCollaborate(owner: OwnerUser | null | undefined): boolean {
  if (!owner) return false
  return tierForUser({ ...owner, role: 'brand' }).features.hasCoBrandedCourses && isEntitled(owner)
}

const idOf = (rel: unknown): number | null => {
  if (rel && typeof rel === 'object') return Number((rel as { id?: unknown }).id) || null
  return rel == null ? null : Number(rel) || null
}

/** Brand ids (of the given ones) whose owner may currently collaborate. */
async function activeBrandIds(payload: Payload, brandIds: number[]): Promise<Set<number>> {
  const ids = Array.from(new Set(brandIds.filter(Boolean)))
  if (!ids.length) return new Set()
  const brands = await payload.find({ collection: 'brands', where: { id: { in: ids } } as never, depth: 1, limit: ids.length, overrideAccess: true })
  const ok = new Set<number>()
  for (const b of brands.docs) {
    const owner = (b as { owner?: unknown }).owner
    if (owner && typeof owner === 'object' && brandOwnerCanCollaborate(owner as OwnerUser)) ok.add(Number(b.id))
  }
  return ok
}

export type CollaborationPartner = { id: number; slug: string; name: string; logo: string | null }

/** Merken an opleider visibly works with ("Werkt samen met"). */
export async function visibleBrandsForTrainer(payload: Payload, trainerId: number | string): Promise<CollaborationPartner[]> {
  const res = await payload.find({
    collection: 'collaborations',
    where: { and: [{ trainer: { equals: trainerId } }, { status: { equals: 'approved' } }] } as never,
    depth: 2,
    limit: 100,
    overrideAccess: true,
  })
  const active = await activeBrandIds(payload, res.docs.map((d) => idOf(d.brand)).filter((x): x is number => x != null))
  return res.docs
    .map((d) => d.brand)
    .filter((b): b is NonNullable<typeof b> & object => Boolean(b) && typeof b === 'object' && active.has(Number((b as { id: unknown }).id)))
    .map((b) => {
      const brand = b as { id: number; slug: string; name: string; logo?: unknown }
      return { id: Number(brand.id), slug: brand.slug, name: brand.name, logo: brand.logo && typeof brand.logo === 'object' ? publicMediaUrl(brand.logo as never) : null }
    })
}

/** Opleiders a merk visibly works with ("Samenwerkende opleiders"); empty when the brand is not (or no longer) Ultimate. */
export async function visibleTrainersForBrand(payload: Payload, brandId: number | string): Promise<CollaborationPartner[]> {
  const active = await activeBrandIds(payload, [Number(brandId)])
  if (!active.size) return []
  const res = await payload.find({
    collection: 'collaborations',
    where: { and: [{ brand: { equals: brandId } }, { status: { equals: 'approved' } }] } as never,
    depth: 2,
    limit: 100,
    overrideAccess: true,
  })
  return res.docs
    .map((d) => d.trainer)
    .filter((t): t is NonNullable<typeof t> & object => Boolean(t) && typeof t === 'object')
    .map((t) => {
      const trainer = t as { id: number; slug: string; displayName: string; photo?: unknown }
      return { id: Number(trainer.id), slug: trainer.slug, name: trainer.displayName, logo: trainer.photo && typeof trainer.photo === 'object' ? publicMediaUrl(trainer.photo as never) : null }
    })
}

/** True when this brand/trainer pair has a collaboration that currently counts. */
export async function hasVisibleCollaboration(payload: Payload, brandId: number | string, trainerId: number | string): Promise<boolean> {
  const res = await payload.find({
    collection: 'collaborations',
    where: { and: [{ brand: { equals: brandId } }, { trainer: { equals: trainerId } }, { status: { equals: 'approved' } }] } as never,
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  if (!res.docs.length) return false
  return (await activeBrandIds(payload, [Number(brandId)])).size > 0
}

export type CollaborationRow = {
  id: number
  status: string
  endedBy: string | null
  updatedAt: string
  partner: { id: number; slug: string; name: string; image: string | null; href: string }
}

/** All collaborations of the current brand or opleider, for the dashboard (any status). */
export async function listCollaborationsFor(payload: Payload, owner: { brand: number } | { trainer: number }): Promise<CollaborationRow[]> {
  const isBrand = 'brand' in owner
  const res = await payload.find({
    collection: 'collaborations',
    where: (isBrand ? { brand: { equals: owner.brand } } : { trainer: { equals: (owner as { trainer: number }).trainer } }) as never,
    depth: 1,
    limit: 200,
    sort: '-updatedAt',
    overrideAccess: true,
  })
  return res.docs
    .map((d) => {
      const other = (isBrand ? d.trainer : d.brand) as unknown
      if (!other || typeof other !== 'object') return null
      const o = other as { id: number; slug: string; name?: string; displayName?: string; logo?: unknown; photo?: unknown }
      const img = isBrand ? o.photo : o.logo
      return {
        id: Number(d.id),
        status: String(d.status),
        endedBy: (d as { endedBy?: string | null }).endedBy || null,
        updatedAt: String(d.updatedAt),
        partner: {
          id: Number(o.id),
          slug: o.slug,
          name: (isBrand ? o.displayName : o.name) || '',
          image: img && typeof img === 'object' ? publicMediaUrl(img as never) : null,
          href: isBrand ? `/opleiders/${o.slug}` : `/merken/${o.slug}`,
        },
      }
    })
    .filter((r): r is CollaborationRow => Boolean(r))
}

/** Partners a course can be linked to: approved and currently visible collaborations. */
export async function collaborationPartnerOptions(
  payload: Payload,
  profile: { kind: 'brand' | 'trainer'; id: number | string },
): Promise<{ value: number; label: string }[]> {
  const list = profile.kind === 'trainer' ? await visibleBrandsForTrainer(payload, profile.id) : await visibleTrainersForBrand(payload, profile.id)
  return list.map((p) => ({ value: p.id, label: p.name })).sort((a, b) => a.label.localeCompare(b.label, 'nl-BE'))
}
