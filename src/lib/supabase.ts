/**
 * Lightweight Supabase access via the PostgREST endpoint using `fetch`.
 * Implemented without `@supabase/supabase-js` to avoid an extra dependency;
 * the REST interface is stable and works in both server and edge runtimes.
 *
 * Env:
 *   SUPABASE_URL                 (server) e.g. https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY    (server, never exposed to the browser)
 *   NEXT_PUBLIC_SUPABASE_URL     (browser)
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY(browser)
 *
 * All helpers degrade gracefully (return [] / {ok:false}) when env is missing,
 * so the app runs before Supabase is provisioned.
 */

export type Lead = {
  id: string
  name: string
  email: string
  message: string | null
  payload_course_id: string
  read: boolean
  created_at: string
}

export type AnalyticsEvent = {
  id: string
  event_type: string
  payload_course_id: string | null
  payload_trainer_id: string | null
  payload_brand_id: string | null
  created_at: string
}

const SERVER_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export function supabaseConfigured(): boolean {
  return Boolean(SERVER_URL && SERVICE_KEY)
}

function serverHeaders(): Record<string, string> {
  return {
    apikey: SERVICE_KEY as string,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  }
}

/** GET rows from a table with a raw PostgREST query string (server-side, service role). */
export async function sbSelect<T>(table: string, query: string): Promise<T[]> {
  if (!supabaseConfigured()) return []
  try {
    const res = await fetch(`${SERVER_URL}/rest/v1/${table}?${query}`, {
      headers: serverHeaders(),
      cache: 'no-store',
    })
    if (!res.ok) return []
    return (await res.json()) as T[]
  } catch {
    return []
  }
}

/** INSERT a row (server-side, service role). */
export async function sbInsert<T>(table: string, row: Record<string, unknown>): Promise<T | null> {
  if (!supabaseConfigured()) return null
  try {
    const res = await fetch(`${SERVER_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: { ...serverHeaders(), Prefer: 'return=representation' },
      body: JSON.stringify(row),
    })
    if (!res.ok) return null
    const data = (await res.json()) as T[]
    return data[0] ?? null
  } catch {
    return null
  }
}

/** PATCH rows matching a query (server-side, service role). */
export async function sbUpdate(table: string, query: string, patch: Record<string, unknown>): Promise<boolean> {
  if (!supabaseConfigured()) return false
  try {
    const res = await fetch(`${SERVER_URL}/rest/v1/${table}?${query}`, {
      method: 'PATCH',
      headers: { ...serverHeaders(), Prefer: 'return=minimal' },
      body: JSON.stringify(patch),
    })
    return res.ok
  } catch {
    return false
  }
}

/** Builds a PostgREST `in.(a,b,c)` filter value. */
export function inList(values: (string | number)[]): string {
  return `in.(${values.map((v) => `"${v}"`).join(',')})`
}

// ── Domain helpers ────────────────────────────────────────────────────────

export async function getLeadsForCourses(courseIds: (string | number)[]): Promise<Lead[]> {
  if (courseIds.length === 0) return []
  const q = `select=*&payload_course_id=${inList(courseIds)}&order=created_at.desc`
  return sbSelect<Lead>('leads', q)
}

export async function getProfileViewEvents(opts: { trainerId?: number; brandId?: number }): Promise<AnalyticsEvent[]> {
  const filter = opts.brandId
    ? `payload_brand_id=eq.${opts.brandId}`
    : opts.trainerId
      ? `payload_trainer_id=eq.${opts.trainerId}`
      : null
  if (!filter) return []
  return sbSelect<AnalyticsEvent>('analytics_events', `select=*&event_type=eq.profile_view&${filter}&order=created_at.asc`)
}
