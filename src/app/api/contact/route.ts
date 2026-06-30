import { NextResponse } from 'next/server'
import { sbInsert, supabaseConfigured } from '@/lib/supabase'
import { sendEmail, emailHtml, ADMIN_EMAIL } from '@/lib/email'

/** POST /api/contact - general inquiry. Stored as a lead, forwarded to admin, confirmed to sender. */
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

    // Persist as a general-inquiry lead (best-effort).
    if (supabaseConfigured()) {
      const composed = subject ? `[${subject}] ${message}` : message
      await sbInsert('leads', { name, email, message: composed, payload_course_id: 'general-inquiry', read: false })
    }

    // Forward to the admin.
    await sendEmail({
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: subject ? `Contact: ${subject}` : `Nieuw contactbericht van ${name}`,
      html: emailHtml([
        `Nieuw bericht via het contactformulier.`,
        '',
        `Naam: ${name}`,
        `E-mail: ${email}`,
        subject ? `Onderwerp: ${subject}` : '',
        `Bericht: ${message}`,
      ]),
    })

    // Confirm to the sender.
    await sendEmail({
      to: email,
      subject: 'We hebben je bericht ontvangen',
      html: emailHtml([`Bedankt ${name},`, `We hebben je bericht ontvangen en nemen zo snel mogelijk contact met je op.`]),
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Er ging iets mis.' }, { status: 500 })
  }
}
