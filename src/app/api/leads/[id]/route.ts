import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { resolveOwner, ownerWhereFromOwner } from '@/lib/course-form'
import { sbSelect, sbUpdate, type Lead } from '@/lib/supabase'

/** PATCH /api/leads/[id] - mark a lead read. Only the owner of the lead's course may do so. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: await getHeaders() })
    if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })

    const owner = await resolveOwner(payload, user as never)
    if (!owner) return NextResponse.json({ error: 'Geen profiel.' }, { status: 400 })

    // Course ids owned by this user
    const courses = await payload.find({
      collection: 'courses',
      where: ownerWhereFromOwner(owner) as never,
      limit: 200,
      depth: 0,
      overrideAccess: true,
    })
    const ids = new Set(courses.docs.map((c) => String(c.id)))

    const found = await sbSelect<Lead>('leads', `select=payload_course_id&id=eq.${id}`)
    const lead = found[0]
    if (!lead || !ids.has(lead.payload_course_id)) {
      return NextResponse.json({ error: 'Geen toegang.' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const ok = await sbUpdate('leads', `id=eq.${id}`, { read: body.read !== false })
    return NextResponse.json({ ok })
  } catch {
    return NextResponse.json({ error: 'Er ging iets mis.' }, { status: 500 })
  }
}
