import { NextResponse } from 'next/server'
import { sbInsert, supabaseConfigured } from '@/lib/supabase'
import { sendEmail, emailHtml, ADMIN_EMAIL } from '@/lib/email'
import { COMPLAINT_TOPICS } from '@/lib/complaint-topics'

/** POST /api/klachten - public complaint form. Stored as a lead, forwarded to the admin, confirmed to the sender. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>
    const name = String(body.name || '').trim().slice(0, 200)
    const email = String(body.email || '').trim().slice(0, 200)
    const topic = COMPLAINT_TOPICS.includes(String(body.topic || '').trim()) ? String(body.topic).trim() : ''
    const page = String(body.page || '').trim().slice(0, 500)
    const message = String(body.message || '').trim().slice(0, 4000)

    if (!name || !email || !topic || message.length < 5) {
      return NextResponse.json({ error: 'Naam, e-mailadres, onderwerp en je klacht zijn verplicht.' }, { status: 400 })
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Vul een geldig e-mailadres in.' }, { status: 400 })
    }
    if (body.privacy !== true) {
      return NextResponse.json({ error: 'Ga akkoord met de privacyverklaring om je klacht te versturen.' }, { status: 400 })
    }

    if (supabaseConfigured()) {
      const composed = `[Klacht: ${topic}]${page ? ` (${page})` : ''} ${message}`
      await sbInsert('leads', { name, email, message: composed, payload_course_id: 'complaint', read: false })
    }

    const ok = await sendEmail({
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `Klacht: ${topic}`,
      html: emailHtml([
        'Nieuwe klacht via het klachtenformulier op de website.',
        '',
        `Naam: ${name}`,
        `E-mail: ${email}`,
        `Onderwerp: ${topic}`,
        page ? `Pagina of aanbieder: ${page}` : '',
        '',
        message,
      ]),
    })
    if (!ok) return NextResponse.json({ error: 'Versturen lukte niet. Probeer het later opnieuw of mail ons.' }, { status: 502 })

    await sendEmail({
      to: email,
      subject: 'We hebben je klacht ontvangen',
      html: emailHtml([`Bedankt ${name},`, 'We hebben je klacht goed ontvangen. We bekijken ze zorgvuldig en laten je zo snel mogelijk iets weten.']),
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Er ging iets mis.' }, { status: 500 })
  }
}
