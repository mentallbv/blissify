import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { isEntitled } from '@/lib/entitlement'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

type SweepUser = { id: number; email: string; role?: string; subscriptionStatus?: string; subscriptionExpiresAt?: string }

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
      where: { subscriptionStatus: { not_equals: 'active' } } as never,
      limit: 1000,
      depth: 0,
      overrideAccess: true,
    })

    let unpublished = 0
    const affected: string[] = []

    for (const doc of candidates.docs as unknown as SweepUser[]) {
      if (doc.role !== 'trainer' && doc.role !== 'brand') continue
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
