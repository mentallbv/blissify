import { NextResponse } from 'next/server'
import { sbInsert, supabaseConfigured } from '@/lib/supabase'

/** POST /api/contact - general inquiry. Stored as a lead with a sentinel course id. */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim()
    const subject = body.subject ? String(body.subject).trim() : ''
    const message = String(body.message || '').trim()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Naam, e-mailadres en bericht zijn verplicht.' }, { status: 400 })
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Vul een geldig e-mailadres in.' }, { status: 400 })
    }

    if (!supabaseConfigured()) return NextResponse.json({ ok: true, stored: false })

    const composed = subject ? `[${subject}] ${message}` : message
    const row = await sbInsert('leads', { name, email, message: composed, payload_course_id: 'general-inquiry', read: false })
    if (!row) return NextResponse.json({ error: 'Verzenden mislukt. Probeer het later opnieuw.' }, { status: 502 })
    return NextResponse.json({ ok: true, stored: true })
  } catch {
    return NextResponse.json({ error: 'Er ging iets mis.' }, { status: 500 })
  }
}
