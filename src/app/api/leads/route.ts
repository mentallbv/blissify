import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sbInsert, supabaseConfigured } from '@/lib/supabase'
import { sendEmail, emailHtml, SITE_URL } from '@/lib/email'

const str = (v: unknown, max = 1000) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

type Rel = { email?: string | null; name?: string | null; displayName?: string | null; slug?: string | null; owner?: unknown } | null

const asObj = (v: unknown): Rel => (v && typeof v === 'object' ? (v as Rel) : null)
const ownerEmail = (p: Rel) => str(asObj(p?.owner)?.email, 200)

/**
 * POST /api/leads - capture a course enquiry ("Vraag informatie aan").
 * The provider's address comes from the course on the server, never from the
 * request, so this cannot be used to mail arbitrary people.
 * Saves to Supabase, notifies the provider, and confirms to the cursist.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>
    // Honeypot: real people never fill the hidden "website" field.
    if (str(body.website)) return NextResponse.json({ success: true })

    const name = str(body.name, 120)
    const email = str(body.email, 200)
    const message = str(body.message, 3000)
    // Accept both the new contract (courseId) and the legacy payload_course_id.
    const courseId = str(body.courseId, 20) || str(body.payload_course_id, 20)

    if (!name || !email || !courseId) {
      return NextResponse.json({ error: 'Naam, e-mailadres en opleiding zijn verplicht.' }, { status: 400 })
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Vul een geldig e-mailadres in.' }, { status: 400 })
    }

    const payload = await getPayload({ config: await config })
    const course = await payload.findByID({ collection: 'courses', id: courseId, depth: 2 }).catch(() => null)
    if (!course || course.status !== 'published') {
      return NextResponse.json({ error: 'Deze opleiding is niet meer beschikbaar.' }, { status: 404 })
    }

    const brand = asObj(course.brand)
    const trainer = asObj(course.trainer)
    const contactEmail = str((course as { contact?: { email?: string | null } }).contact?.email, 200)
    const providerEmail = contactEmail || str(brand?.email, 200) || str(trainer?.email, 200) || ownerEmail(brand) || ownerEmail(trainer)
    const providerName = str(brand?.name, 200) || str(trainer?.displayName, 200) || 'de opleider'
    const categorySlug = str(asObj(course.category)?.slug, 200)
    const courseLink = categorySlug && course.slug ? `${SITE_URL}/opleidingen/${categorySlug}/${course.slug}` : SITE_URL

    // 1. Persist to Supabase (best-effort, graceful when not configured).
    if (supabaseConfigured()) {
      await sbInsert('leads', { name, email, message: message || null, payload_course_id: String(course.id), read: false })
    }

    // 2. Notify the provider.
    if (providerEmail) {
      await sendEmail({
        to: providerEmail,
        replyTo: email,
        subject: `Nieuwe aanvraag voor ${course.title}`,
        html: emailHtml([
          `Je ontving een nieuwe aanvraag via Blissify.`,
          '',
          `Naam: ${name}`,
          `E-mail: ${email}`,
          message ? `Bericht: ${message}` : 'Bericht: (geen bericht)',
          `Opleiding: ${course.title}`,
          `Link: ${courseLink}`,
        ]),
      })
    }

    // 3. Confirm to the cursist.
    await sendEmail({
      to: email,
      subject: 'Jouw aanvraag is ontvangen',
      html: emailHtml([
        `Bedankt ${name},`,
        `We hebben jouw aanvraag doorgestuurd naar ${providerName}. Je hoort snel van hen.`,
      ]),
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Er ging iets mis. Probeer het later opnieuw.' }, { status: 500 })
  }
}
