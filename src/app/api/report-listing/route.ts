import { NextResponse } from 'next/server'
import { sendEmail, emailHtml, ADMIN_EMAIL, SITE_URL } from '@/lib/email'
import { REPORT_REASONS } from '@/lib/report-reasons'

const PATHS: Record<string, string> = { workspace: 'werkruimtes', vacancy: 'vacatures' }

/** POST /api/report-listing - "Meld deze advertentie": goes to the Blissify admin. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>
    if (typeof body.website === 'string' && body.website.trim()) return NextResponse.json({ success: true }) // honeypot
    const kind = String(body.kind || '')
    const slug = String(body.slug || '').slice(0, 120)
    const reason = REPORT_REASONS.includes(String(body.reason)) ? String(body.reason) : ''
    const details = String(body.details || '').trim().slice(0, 2000)
    const email = String(body.email || '').trim().slice(0, 200)
    if (!PATHS[kind] || !slug || !reason) return NextResponse.json({ error: 'Kies een reden.' }, { status: 400 })
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: 'Vul een geldig e-mailadres in.' }, { status: 400 })
    await sendEmail({
      to: ADMIN_EMAIL,
      ...(email ? { replyTo: email } : {}),
      subject: `Melding: ${reason}`,
      html: emailHtml([`Een advertentie werd gemeld via Blissify.`, '', `Reden: ${reason}`, details ? `Toelichting: ${details}` : '', email ? `Gemeld door: ${email}` : 'Gemeld door: (anoniem)', `Advertentie: ${SITE_URL}/${PATHS[kind]}/${slug}`]),
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Er ging iets mis.' }, { status: 500 })
  }
}
