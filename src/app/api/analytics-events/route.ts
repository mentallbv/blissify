import { NextResponse } from 'next/server'
import { sbInsert, supabaseConfigured } from '@/lib/supabase'

const KIND_FIELD: Record<string, string> = {
  course: 'payload_course_id',
  trainer: 'payload_trainer_id',
  brand: 'payload_brand_id',
  vacancy: 'payload_course_id',
  workspace: 'payload_course_id',
}

// Click event types (view is the default). event_type is a free-form column,
// so no schema change is needed to add these.
const CLICK_TYPES = new Set(['website_click', 'social_click', 'register_click'])

/** POST /api/analytics-events - record a lightweight analytics event. Public. */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const kind = String(body.kind || '')
    const id = body.id != null ? String(body.id) : null
    const field = KIND_FIELD[kind]
    if (!field || !id) return NextResponse.json({ ok: false }, { status: 400 })

    // `type` selects a click event; otherwise it's a page view.
    const type = String(body.type || '')
    // Vacature views (phase 4): attributed to the owning profile, with the
    // vacancy id prefixed so per-publication stats can tell it from a course.
    if (kind === 'vacancy' || kind === 'workspace') {
      const ownerField = body.ownerKind === 'brand' ? 'payload_brand_id' : body.ownerKind === 'trainer' ? 'payload_trainer_id' : null
      if (!ownerField || body.ownerId == null) return NextResponse.json({ ok: false }, { status: 400 })
      if (!supabaseConfigured()) return NextResponse.json({ ok: true, stored: false })
      await sbInsert('analytics_events', { event_type: `${kind}_view`, payload_course_id: `${kind}:${id}`, [ownerField]: String(body.ownerId) })
      return NextResponse.json({ ok: true, stored: true })
    }
    const eventType = CLICK_TYPES.has(type) ? type : kind === 'course' ? 'course_view' : 'profile_view'
    if (!supabaseConfigured()) return NextResponse.json({ ok: true, stored: false })

    await sbInsert('analytics_events', { event_type: eventType, [field]: id })
    return NextResponse.json({ ok: true, stored: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
