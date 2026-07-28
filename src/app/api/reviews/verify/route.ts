import { createHash, timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { ADMIN_EMAIL, emailHtml, sendEmail, SITE_URL } from '@/lib/email'

const hash = (value: string) => createHash('sha256').update(value).digest()

export async function GET(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id') || ''
  const token = url.searchParams.get('token') || ''
  const resultUrl = new URL('/review-bevestigd', SITE_URL)
  try {
    if (!id || !token) throw new Error('invalid')
    const payload = await getPayload({ config: await config })
    const review = await payload.findByID({ collection: 'reviews', id, depth: 1, overrideAccess: true }).catch(() => null)
    if (!review) throw new Error('invalid')
    if (review.status !== 'awaiting_verification') {
      resultUrl.searchParams.set('status', review.status === 'approved' || review.status === 'pending' ? 'already' : 'invalid')
      return NextResponse.redirect(resultUrl)
    }
    const expected = hash(String(review.verificationTokenHash || ''))
    const provided = hash(createHash('sha256').update(token).digest('hex'))
    if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) throw new Error('invalid')
    if (!review.verificationExpiresAt || new Date(review.verificationExpiresAt).getTime() < Date.now()) {
      resultUrl.searchParams.set('status', 'expired')
      return NextResponse.redirect(resultUrl)
    }

    await payload.update({
      collection: 'reviews',
      id: review.id,
      data: { status: 'pending', verifiedAt: new Date().toISOString(), verificationTokenHash: null } as never,
      overrideAccess: true,
    })
    const courseTitle = typeof review.course === 'object' ? review.course.title : `opleiding ${review.course}`
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `Nieuwe geverifieerde review voor ${courseTitle}`,
      html: emailHtml([
        `${review.reviewerName} heeft het e-mailadres bevestigd.`,
        `Beoordeling: ${review.rating}/5`,
        String(review.body),
        `Keur de review goed of af via ${SITE_URL}/admin/collections/reviews/${review.id}.`,
      ]),
    })
    resultUrl.searchParams.set('status', 'success')
    return NextResponse.redirect(resultUrl)
  } catch {
    resultUrl.searchParams.set('status', 'invalid')
    return NextResponse.redirect(resultUrl)
  }
}
