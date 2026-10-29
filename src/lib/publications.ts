import { tierForUser, type TierFeatures } from '@/lib/tier-features'

/**
 * Shared rules for everything a provider publishes: opleidingen, vacatures and
 * werkruimtes (copy 10/2026). Each type has a per-plan limit on how many are
 * published at the same time. Publications never expire; over the limit after
 * a downgrade, the oldest go back to draft (hidden, never deleted) and the
 * owner republishes once back within the limit.
 *
 * A publication belongs to a trainer or brand profile through a `trainer` or
 * `brand` relationship and has `status: 'draft' | 'published'`, like courses.
 */
export type PublicationKind = 'courses' | 'vacancies' | 'workspaces'

type KindInfo = { limit: (f: TierFeatures) => number; singular: string; plural: string }

export const PUBLICATION_KINDS: Record<PublicationKind, KindInfo> = {
  courses: { limit: (f) => f.courseLimit, singular: 'actieve opleiding', plural: 'actieve opleidingen' },
  vacancies: { limit: (f) => f.vacancyLimit, singular: 'actieve vacature', plural: 'actieve vacatures' },
  workspaces: { limit: (f) => f.workspaceLimit, singular: 'actieve werkruimte', plural: 'actieve werkruimtes' },
}

/**
 * Collections that exist today. Vacancies and workspaces join this list when
 * their collections are added (phases 4 and 5); the sweep and limit checks
 * then cover them automatically.
 */
export const LIVE_PUBLICATION_KINDS: PublicationKind[] = ['courses', 'vacancies', 'workspaces']

type UserLike = { role?: string | null; subscriptionTier?: string | null; brandTier?: string | null }

export function publicationLimit(user: UserLike, kind: PublicationKind): number {
  return PUBLICATION_KINDS[kind].limit(tierForUser(user).features)
}

type PayloadLike = {
  find: (args: never) => Promise<{ docs: { id: number | string }[]; totalDocs: number }>
  update: (args: never) => Promise<unknown>
}

/** The profile (trainer or brand) owned by a user, with the relationship field name. */
export async function ownerProfile(payload: PayloadLike, userId: number | string, role?: string | null) {
  const collection = role === 'brand' ? 'brands' : 'trainers'
  const res = await payload.find({ collection, where: { owner: { equals: userId } }, limit: 1, depth: 0, overrideAccess: true } as never)
  const profile = res.docs[0]
  return profile ? { id: profile.id, relationship: role === 'brand' ? 'brand' : 'trainer' } : null
}

/** Published items of one kind for a profile, oldest first. */
async function publishedFor(payload: PayloadLike, kind: PublicationKind, relationship: string, profileId: number | string) {
  return payload.find({
    collection: kind,
    where: { and: [{ status: { equals: 'published' } }, { [relationship]: { equals: profileId } }] },
    sort: 'createdAt',
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  } as never)
}

/**
 * Throws the Dutch error shown in the dashboard when publishing one more item
 * of `kind` would exceed the plan. Call it only for a transition to published.
 */
export async function assertCanPublish(payload: PayloadLike, user: UserLike & { id: number | string }, kind: PublicationKind): Promise<void> {
  const limit = publicationLimit(user, kind)
  const { singular, plural } = PUBLICATION_KINDS[kind]
  if (limit === 0) {
    throw new Error(`Je huidige abonnement laat geen ${plural.replace('actieve ', '')} toe. Upgrade je abonnement om ze te publiceren.`)
  }
  if (limit === Infinity) return
  const profile = await ownerProfile(payload, user.id, user.role)
  if (!profile) return
  const { totalDocs } = await publishedFor(payload, kind, profile.relationship, profile.id)
  if (totalDocs >= limit) {
    throw new Error(`Je abonnement laat maximaal ${limit} ${limit === 1 ? singular : plural} toe. Zet een andere offline of upgrade je abonnement.`)
  }
}

/** How many published items of each live kind exceed what `user` (with a new tier) allows. */
export async function publicationsOverLimit(payload: PayloadLike, user: UserLike & { id: number | string }): Promise<Partial<Record<PublicationKind, number>>> {
  const profile = await ownerProfile(payload, user.id, user.role)
  const out: Partial<Record<PublicationKind, number>> = {}
  if (!profile) return out
  for (const kind of LIVE_PUBLICATION_KINDS) {
    const limit = publicationLimit(user, kind)
    if (limit === Infinity) continue
    const { totalDocs } = await publishedFor(payload, kind, profile.relationship, profile.id)
    if (totalDocs > limit) out[kind] = totalDocs - limit
  }
  return out
}

/**
 * Bring a user's publications within their plan: the oldest over the limit go
 * to draft. With `all`, everything goes offline (subscription no longer
 * entitled). Returns how many were taken offline.
 */
export async function unpublishOverLimit(payload: PayloadLike, user: UserLike & { id: number | string }, opts: { all?: boolean } = {}): Promise<number> {
  const profile = await ownerProfile(payload, user.id, user.role)
  if (!profile) return 0
  let count = 0
  for (const kind of LIVE_PUBLICATION_KINDS) {
    const limit = opts.all ? 0 : publicationLimit(user, kind)
    if (limit === Infinity) continue
    const live = await publishedFor(payload, kind, profile.relationship, profile.id)
    const excess = live.docs.slice(0, Math.max(0, live.docs.length - limit))
    for (const doc of excess) {
      await payload.update({ collection: kind, id: doc.id, data: { status: 'draft' }, overrideAccess: true } as never)
      count++
    }
  }
  return count
}
