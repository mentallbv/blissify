import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sbInsert, supabaseConfigured } from '@/lib/supabase'
import { sendEmail, emailHtml, SITE_URL } from '@/lib/email'

/**
 * POST /api/registrations - in-platform course registration (Brand accounts on
 * Legacy endpoint retained for existing records. Blissify 2.0 directs visitors
 * to the provider's external enrolment link instead.
 *
 * The registration mode is authoritative on the server: we load the course and
 * require course.isBookable === true (set from the owning brand tier). A client
 * cannot enable registration by tampering with the request.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim()
    const phone = String(body.phone || '').trim()
    const participantCount = Number.parseInt(String(body.participantCount ?? ''), 10)
    const consent = body.consent === true
    const courseId = String(body.courseId || '').trim()

    if (!name || !email || !phone || !courseId) {
      return NextResponse.json({ error: 'Vul je naam, e-mailadres, telefoonnummer en de opleiding in.' }, { status: 400 })
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Vul een geldig e-mailadres in.' }, { status: 400 })
    }
    if (!Number.isFinite(participantCount) || participantCount < 1) {
      return NextResponse.json({ error: 'Vul een geldig aantal deelnemers in.' }, { status: 400 })
    }
    if (!consent) {
      return NextResponse.json({ error: 'Bevestig dat je akkoord gaat met de privacyverklaring.' }, { status: 400 })
    }

    // Server-side authority: the course must actually be in registration mode.
    type CourseLite = { title?: string; slug?: string; isBookable?: boolean; category?: unknown; notificationRecipients?: { email?: string }[] }
    const payload = await getPayload({ config: await config })
    let course: CourseLite | null = null
    try {
      course = (await payload.findByID({ collection: 'courses', id: courseId as unknown as number, depth: 1, overrideAccess: true })) as unknown as CourseLite
    } catch {
      course = null
    }
    if (!course) return NextResponse.json({ error: 'Opleiding niet gevonden.' }, { status: 404 })
    if (!course.isBookable) {
      return NextResponse.json({ error: 'Voor deze opleiding is in-platform inschrijving niet beschikbaar.' }, { status: 400 })
    }

    // Persist to Supabase (matches leads/analytics_events pattern).
    if (supabaseConfigured()) {
      await sbInsert('registrations', {
        payload_course_id: courseId,
        name,
        email,
        phone,
        participant_count: participantCount,
      })
    }

    const courseTitle = course.title || 'de opleiding'
    const catSlug = typeof course.category === 'object' ? (course.category as { slug?: string })?.slug : undefined
    const courseLink = course.slug && catSlug ? `${SITE_URL}/opleidingen/${catSlug}/${course.slug}` : SITE_URL

    // Notify every configured recipient with the full entry.
    const recipients = (course.notificationRecipients || []).map((r) => r?.email).filter(Boolean) as string[]
    for (const to of recipients) {
      await sendEmail({
        to,
        replyTo: email,
        subject: `Nieuwe inschrijving voor ${courseTitle}`,
        html: emailHtml([
          'Je ontving een nieuwe inschrijving via Blissify.',
          '',
          `Opleiding: ${courseTitle}`,
          `Naam: ${name}`,
          `E-mail: ${email}`,
          `Telefoon: ${phone}`,
          `Aantal deelnemers: ${participantCount}`,
          `Link: ${courseLink}`,
        ]),
      })
    }

    // Confirm to the registrant.
    await sendEmail({
      to: email,
      subject: `Bevestiging inschrijving - ${courseTitle}`,
      html: emailHtml([
        `Bedankt ${name},`,
        `We hebben je inschrijving voor ${courseTitle} ontvangen. De aanbieder neemt rechtstreeks contact met je op.`,
      ]),
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Er ging iets mis. Probeer het later opnieuw.' }, { status: 500 })
  }
}
