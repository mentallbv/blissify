import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { isEntitled } from '@/lib/entitlement'
import { tierForUser } from '@/lib/tier-features'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

type SweepUser = { id: number; email: string; role?: string; subscriptionStatus?: string; subscriptionExpiresAt?: string; subscriptionTier?: string; brandTier?: string; pendingSubscriptionTier?: string; pendingSubscriptionBillingCycle?: 'yearly' | 'monthly'; pendingSubscriptionEffectiveAt?: string }

/**
 * GET /api/cron/subscriptions - unpublishes courses whose owner is no longer
 * entitled. Cancelling keeps publishing rights until the paid period ends, so
 * enforcement has to happen on a schedule rather than at cancellation time.
 *
 * Courses go to `draft`, never deleted: an account that resubscribes can
 * republish without losing its content.
 *
 * Runs daily via vercel.json. Protected by CRON_SECRET - Vercel sends it as
 * `Authorization: Bearer <secret>`.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config: await config })

    // Anyone not plainly active is a candidate; isEntitled() decides per user,
    // since a canceled account may still be inside its paid period.
    const candidates = await payload.find({
      collection: 'users',
      limit: 1000,
      depth: 0,
      overrideAccess: true,
    })

    let unpublished = 0
    const affected: string[] = []

    for (const doc of candidates.docs as unknown as SweepUser[]) {
      if (doc.role !== 'trainer' && doc.role !== 'brand') continue

      if (doc.pendingSubscriptionTier && doc.pendingSubscriptionEffectiveAt && new Date(doc.pendingSubscriptionEffectiveAt).getTime() <= Date.now()) {
        const collection = doc.role === 'brand' ? 'brands' : 'trainers'
        const relationship = doc.role === 'brand' ? 'brand' : 'trainer'
        const profiles = await payload.find({ collection, where: { owner: { equals: doc.id } }, limit: 1, depth: 0, overrideAccess: true })
        const profile = profiles.docs[0]
        const limit = tierForUser({ role: doc.role, subscriptionTier: doc.pendingSubscriptionTier, brandTier: doc.pendingSubscriptionTier }).features.courseLimit
        if (profile && limit !== Infinity) {
          const live = await payload.find({
            collection: 'courses',
            where: { and: [{ status: { equals: 'published' } }, { [relationship]: { equals: profile.id } }] } as never,
            sort: 'createdAt',
            limit: 500,
            depth: 0,
            overrideAccess: true,
          })
          const excess = Math.max(0, live.docs.length - limit)
          for (const course of live.docs.slice(0, excess)) {
            await payload.update({ collection: 'courses', id: course.id, data: { status: 'draft' } as never, overrideAccess: true })
            unpublished++
          }
        }
        await payload.update({
          collection: 'users', id: doc.id, overrideAccess: true,
          data: {
            ...(doc.role === 'brand' ? { brandTier: doc.pendingSubscriptionTier } : { subscriptionTier: doc.pendingSubscriptionTier }),
            subscriptionBillingCycle: doc.pendingSubscriptionBillingCycle || 'yearly',
            pendingSubscriptionTier: null,
            pendingSubscriptionBillingCycle: null,
            pendingSubscriptionEffectiveAt: null,
          } as never,
        })
      }

      if (isEntitled(doc)) continue

      const collection = doc.role === 'brand' ? 'brands' : 'trainers'
      const profiles = await payload.find({
        collection,
        where: { owner: { equals: doc.id } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      const profile = profiles.docs[0]
      if (!profile) continue

      const relationship = doc.role === 'brand' ? 'brand' : 'trainer'
      const live = await payload.find({
        collection: 'courses',
        where: { and: [{ status: { equals: 'published' } }, { [relationship]: { equals: profile.id } }] } as never,
        limit: 500,
        depth: 0,
        overrideAccess: true,
      })
      if (!live.docs.length) continue

      for (const course of live.docs) {
        await payload.update({
          collection: 'courses',
          id: course.id,
          data: { status: 'draft' } as never,
          overrideAccess: true,
        })
        unpublished++
      }
      affected.push(doc.email)
    }

    return NextResponse.json({ ok: true, unpublished, accounts: affected.length })
  } catch (err) {
    console.error('[cron] subscription sweep failed', err)
    return NextResponse.json({ error: 'Sweep failed' }, { status: 500 })
  }
}
