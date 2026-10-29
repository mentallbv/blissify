import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sbInsert, supabaseConfigured } from '@/lib/supabase'
import { sendEmail, emailHtml, SITE_URL } from '@/lib/email'
import { APPLICANT_STATUS, DAYS, labelOf } from '@/lib/workspace-options'

const str = (v: unknown, max = 1000) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/**
 * POST /api/workspace-applications - a "kandidatuur" for a werkruimte (like
 * flexsalon.be). The landlord's address comes from the listing on the server,
 * never from the request, so this cannot be used to mail arbitrary people.
 * Stored as a lead ("workspace:<id>") so it shows under Aanvragen.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>
    // Honeypot: real people never fill the hidden "website" field.
    if (str(body.website)) return NextResponse.json({ success: true })

    const workspaceId = str(body.workspaceId, 20)
    const name = str(body.name, 120)
    const email = str(body.email, 200)
    const message = str(body.message, 3000)
    if (!workspaceId || !name || !email || !message) {
      return NextResponse.json({ error: 'Vul je naam, e-mailadres en een kort bericht in.' }, { status: 400 })
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: 'Vul een geldig e-mailadres in.' }, { status: 400 })
    if (body.consent !== true) return NextResponse.json({ error: 'Geef toestemming om je aanvraag door te sturen naar de verhuurder.' }, { status: 400 })

    const payload = await getPayload({ config: await config })
    const ws = await payload.findByID({ collection: 'workspaces', id: workspaceId, depth: 0 }).catch(() => null)
    if (!ws || ws.status !== 'published') return NextResponse.json({ error: 'Deze werkruimte is niet meer beschikbaar.' }, { status: 404 })

    const days = (Array.isArray(body.desiredDays) ? body.desiredDays : []).filter((d): d is string => typeof d === 'string' && DAYS.some((x) => x.value === d))
    const details = [
      ['Behandeling', str(body.service, 200)],
      ['Gewenste dagen', days.map((d) => labelOf(DAYS, d)).join(', ')],
      ['Telefoon', str(body.phone, 40)],
      ['Stad', str(body.city, 80)],
      ['Statuut', labelOf(APPLICANT_STATUS, str(body.status, 20)) || ''],
      ['Budget', str(body.budget, 80)],
      ['Instagram / portfolio', str(body.portfolio, 300)],
    ].filter(([, v]) => v) as [string, string][]

    if (supabaseConfigured()) {
      const composed = [message, ...details.map(([k, v]) => `${k}: ${v}`)].join('\n')
      await sbInsert('leads', { name, email, message: composed, payload_course_id: `workspace:${ws.id}`, read: false })
    }

    const link = `${SITE_URL}/werkruimtes/${ws.slug}`
    await sendEmail({
      to: ws.contactEmail,
      replyTo: email,
      subject: `Nieuwe aanvraag voor ${ws.title}`,
      html: emailHtml([
        `Je ontving een nieuwe aanvraag via Blissify voor je werkruimte.`,
        '',
        `Naam: ${name}`,
        `E-mail: ${email}`,
        ...details.map(([k, v]) => `${k}: ${v}`),
        `Bericht: ${message}`,
        '',
        `Antwoord rechtstreeks op deze e-mail om contact op te nemen.`,
        `Werkruimte: ${link}`,
      ]),
    })
    await sendEmail({
      to: email,
      subject: 'Je aanvraag is verstuurd',
      html: emailHtml([`Bedankt ${name},`, `Je aanvraag voor "${ws.title}" is doorgestuurd naar de verhuurder. Die neemt rechtstreeks contact met je op.`]),
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Er ging iets mis. Probeer het later opnieuw.' }, { status: 500 })
  }
}
