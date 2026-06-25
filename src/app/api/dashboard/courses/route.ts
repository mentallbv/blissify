import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { buildCourseData, resolveOwner } from '@/lib/course-form'

/** POST /api/dashboard/courses - create a course owned by the current user. */
export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: await getHeaders() })
    if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })

    const owner = await resolveOwner(payload, user)
    if (!owner) return NextResponse.json({ error: 'Geen opleiderprofiel gevonden.' }, { status: 400 })

    const body = await req.json()
    const data = { ...buildCourseData(body), ...owner }

    // Run as the user so access control + the tier-limit hook apply.
    const created = await payload.create({ collection: 'courses', data: data as never, user, overrideAccess: false })
    return NextResponse.json({ ok: true, id: created.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Aanmaken mislukt.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
