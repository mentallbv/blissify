import { NextResponse } from 'next/server'
import { sbInsert, supabaseConfigured } from '@/lib/supabase'
import { sendEmail, emailHtml, SITE_URL } from '@/lib/email'

/**
 * POST /api/leads - capture a course enquiry ("Ik ben geinteresseerd").
 * Saves to Supabase, notifies the provider, and confirms to the cursist.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim()
    const message = body.message ? String(body.message).trim() : ''
    // Accept both the new contract (courseId) and the legacy payload_course_id.
    const courseId = String(body.courseId || body.payload_course_id || '').trim()
    const courseTitle = String(body.courseTitle || '').trim()
    const courseSlug = String(body.courseSlug || '').trim()
    const providerEmail = String(body.providerEmail || '').trim()
    const providerName = String(body.providerName || 'de opleider').trim()

    if (!name || !email || !courseId) {
      return NextResponse.json({ error: 'Naam, e-mailadres en opleiding zijn verplicht.' }, { status: 400 })
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Vul een geldig e-mailadres in.' }, { status: 400 })
    }

    // 1. Persist to Supabase (best-effort, graceful when not configured).
    if (supabaseConfigured()) {
      await sbInsert('leads', { name, email, message: message || null, payload_course_id: courseId, read: false })
    }

    const courseLink = courseSlug ? `${SITE_URL}/opleidingen/${courseSlug}` : SITE_URL

    // 2. Notify the provider.
    if (providerEmail) {
      await sendEmail({
        to: providerEmail,
        replyTo: email,
        subject: `Nieuwe aanvraag voor ${courseTitle || 'jouw opleiding'}`,
        html: emailHtml([
          `Je ontving een nieuwe aanvraag via Blissify.`,
          '',
          `Naam: ${name}`,
          `E-mail: ${email}`,
          message ? `Bericht: ${message}` : 'Bericht: (geen bericht)',
          courseTitle ? `Opleiding: ${courseTitle}` : '',
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
