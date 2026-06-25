import { NextResponse } from 'next/server'
import { sbInsert, supabaseConfigured } from '@/lib/supabase'

/** POST /api/leads - capture a lead/enquiry. Public. */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim()
    const message = body.message ? String(body.message).trim() : null
    const payload_course_id = String(body.payload_course_id || '').trim()

    if (!name || !email || !payload_course_id) {
      return NextResponse.json({ error: 'Naam, e-mailadres en opleiding zijn verplicht.' }, { status: 400 })
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Vul een geldig e-mailadres in.' }, { status: 400 })
    }

    if (!supabaseConfigured()) {
      // Accept gracefully so the UX works before Supabase is provisioned.
      return NextResponse.json({ ok: true, stored: false })
    }

    const lead = await sbInsert('leads', { name, email, message, payload_course_id, read: false })
    if (!lead) return NextResponse.json({ error: 'Opslaan mislukt. Probeer het later opnieuw.' }, { status: 502 })
    return NextResponse.json({ ok: true, stored: true })
  } catch {
    return NextResponse.json({ error: 'Er ging iets mis.' }, { status: 500 })
  }
}
