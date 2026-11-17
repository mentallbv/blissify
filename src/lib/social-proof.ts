import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sbSelect, supabaseConfigured } from '@/lib/supabase'

/**
 * Social proof on opleider / merk pages (meeting Nov 2026, item 6).
 * Counts unique people (by email) who sent an information request or registered
 * for one of the profile's opleidingen via Blissify. Hidden below SOCIAL_PROOF_MIN.
 */
export const SOCIAL_PROOF_MIN = 10

async function count(kind: 'trainer' | 'brand', id: number): Promise<number> {
  if (!supabaseConfigured()) return 0
  const payload = await getPayload({ config: await config })
  const res = await payload.find({
    collection: 'courses',
    where: { [kind]: { equals: id } } as never,
    depth: 0,
    limit: 500,
    pagination: false,
    overrideAccess: true,
  })
  const ids = res.docs.map((c) => String((c as { id: number | string }).id))
  if (!ids.length) return 0
  const list = `in.(${ids.map((x) => encodeURIComponent(x)).join(',')})`
  const [leads, regs] = await Promise.all([
    sbSelect<{ email: string }>('leads', `select=email&payload_course_id=${list}`),
    sbSelect<{ email: string }>('registrations', `select=email&payload_course_id=${list}`),
  ])
  return new Set([...leads, ...regs].map((r) => String(r.email || '').trim().toLowerCase()).filter(Boolean)).size
}

/** Cached for an hour: the number only needs to be roughly current. Returns null below the minimum. */
export const getSocialProof = unstable_cache(
  async (kind: 'trainer' | 'brand', id: number): Promise<number | null> => {
    try {
      const n = await count(kind, id)
      return n >= SOCIAL_PROOF_MIN ? n : null
    } catch {
      return null
    }
  },
  ['social-proof'],
  { revalidate: 3600 },
)
