import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { buildCourseData, resolveOwner, ownsCourse } from '@/lib/course-form'

/** PATCH /api/dashboard/courses/[id] - update a course the current user owns. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: await getHeaders() })
    if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })

    const owner = await resolveOwner(payload, user)
    if (!owner) return NextResponse.json({ error: 'Geen opleiderprofiel gevonden.' }, { status: 400 })

    const existing = await payload.findByID({ collection: 'courses', id, depth: 0, overrideAccess: true }).catch(() => null)
    if (!existing) return NextResponse.json({ error: 'Opleiding niet gevonden.' }, { status: 404 })
    if (!ownsCourse(existing as never, owner)) return NextResponse.json({ error: 'Geen toegang tot deze opleiding.' }, { status: 403 })

    const body = await req.json()
    const data = buildCourseData(body)
    const updated = await payload.update({ collection: 'courses', id, data: data as never, user, overrideAccess: false })
    return NextResponse.json({ ok: true, id: updated.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Opslaan mislukt.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
