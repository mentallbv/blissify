import { createHash, randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { emailHtml, sendEmail, SITE_URL } from '@/lib/email'

const fingerprint = (email: string) => createHash('sha256').update(email.trim().toLowerCase()).digest('hex')
const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex')

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const courseId = String(body.courseId || '')
    const reviewerName = String(body.name || '').trim().slice(0, 100)
    const reviewerEmail = String(body.email || '').trim().toLowerCase()
    const reviewBody = String(body.review || '').trim()
    const rating = Number(body.rating)

    if (!courseId || reviewerName.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewerEmail)) {
      return NextResponse.json({ error: 'Vul je naam en een geldig e-mailadres in.' }, { status: 400 })
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || reviewBody.length < 20 || reviewBody.length > 2000) {
      return NextResponse.json({ error: 'Kies 1–5 sterren en schrijf minimaal 20 tekens.' }, { status: 400 })
    }

    const payload = await getPayload({ config: await config })
    const course = await payload.findByID({ collection: 'courses', id: courseId, depth: 0, overrideAccess: true }).catch(() => null)
    if (!course || course.status !== 'published') return NextResponse.json({ error: 'Opleiding niet gevonden.' }, { status: 404 })

    const emailFingerprint = fingerprint(reviewerEmail)
    const submissionKey = createHash('sha256').update(`${courseId}:${emailFingerprint}`).digest('hex')
    const existing = await payload.find({
      collection: 'reviews',
      where: { and: [{ course: { equals: courseId } }, { emailFingerprint: { equals: emailFingerprint } }] } as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const previous = existing.docs[0] as { id: number | string; status?: string; verificationSentAt?: string } | undefined
    if (previous && previous.status !== 'awaiting_verification') {
      return NextResponse.json({ error: 'Dit e-mailadres heeft deze opleiding al beoordeeld.' }, { status: 409 })
    }
    if (previous?.verificationSentAt && Date.now() - new Date(previous.verificationSentAt).getTime() < 5 * 60 * 1000) {
      return NextResponse.json({ ok: true })
    }

    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const reviewData = {
      course: Number.isNaN(Number(courseId)) ? courseId : Number(courseId),
      reviewerName,
      reviewerEmail,
      emailFingerprint,
      submissionKey,
      rating,
      body: reviewBody,
      status: 'awaiting_verification',
      verificationTokenHash: tokenHash(token),
      verificationSentAt: new Date().toISOString(),
      verificationExpiresAt: expiresAt,
    }
    const review = previous
      ? await payload.update({ collection: 'reviews', id: previous.id, data: reviewData as never, overrideAccess: true })
      : await payload.create({ collection: 'reviews', data: reviewData as never, overrideAccess: true })

    const verifyUrl = `${SITE_URL}/api/reviews/verify?id=${encodeURIComponent(String(review.id))}&token=${encodeURIComponent(token)}`
    const sent = await sendEmail({
      to: reviewerEmail,
      subject: `Bevestig je review van ${course.title}`,
      html: emailHtml([
        `Hallo ${reviewerName},`,
        `Bevestig dat jij de review voor “${course.title}” hebt geschreven via deze link:`,
        verifyUrl,
        'De link blijft 24 uur geldig. Daarna kun je opnieuw een verificatiemail aanvragen.',
        'Na verificatie controleert Blissify de review voordat deze openbaar verschijnt.',
      ]),
    })
    if (!sent) return NextResponse.json({ error: 'De verificatiemail kon niet worden verstuurd. Probeer later opnieuw.' }, { status: 503 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[reviews] submit failed', err)
    return NextResponse.json({ error: 'De review kon niet worden opgeslagen.' }, { status: 500 })
  }
}
