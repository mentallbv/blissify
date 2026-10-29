import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { isEntitled } from '@/lib/entitlement'
import { tierForUser } from '@/lib/tier-features'
import { ownerProfile, unpublishOverLimit } from '@/lib/publications'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

type SweepUser = { id: number; email: string; role?: string; subscriptionStatus?: string; subscriptionExpiresAt?: string; subscriptionTier?: string; brandTier?: string; pendingSubscriptionTier?: string; pendingSubscriptionBillingCycle?: 'yearly' | 'monthly'; pendingSubscriptionEffectiveAt?: string }

/**
 * GET /api/cron/subscriptions - unpublishes publications (opleidingen, and
 * vacatures / werkruimtes once they exist) whose owner is no longer entitled. Cancelling keeps publishing rights until the paid period ends, so
 * enforcement has to happen on a schedule rather than at cancellation time.
 *
 * Publications go to `draft`, never deleted: an account that resubscribes can
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
        // Downgrade taking effect: the oldest publications over the new
        // plan's limits go to draft (hidden, not deleted; client decision).
        const newTier = { ...doc, subscriptionTier: doc.role === 'brand' ? doc.subscriptionTier : doc.pendingSubscriptionTier, brandTier: doc.role === 'brand' ? doc.pendingSubscriptionTier : doc.brandTier }
        unpublished += await unpublishOverLimit(payload as never, newTier)
        const profileRef = await ownerProfile(payload as never, doc.id, doc.role)
        const profile = profileRef ? await payload.findByID({ collection: doc.role === 'brand' ? 'brands' : 'trainers', id: profileRef.id, depth: 0, overrideAccess: true }) : null
        // Brands: trim product categories to the new tier's limit (keeping the
        // first ones), so a downgrade cannot leave a profile over its allowance.
        if (profile && doc.role === 'brand') {
          const catLimit = tierForUser({ role: 'brand', brandTier: doc.pendingSubscriptionTier }).features.categoryLimit
          const current = ((profile as { productType?: string[] }).productType || [])
          if (catLimit !== Infinity && current.length > catLimit) {
            await payload.update({ collection: 'brands', id: profile.id, data: { productType: current.slice(0, catLimit) } as never, overrideAccess: true })
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

      const taken = await unpublishOverLimit(payload as never, doc, { all: true })
      if (!taken) continue
      unpublished += taken
      affected.push(doc.email)
    }

    return NextResponse.json({ ok: true, unpublished, accounts: affected.length })
  } catch (err) {
    console.error('[cron] subscription sweep failed', err)
    return NextResponse.json({ error: 'Sweep failed' }, { status: 500 })
  }
}
