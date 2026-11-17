import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { SiteChrome } from '@/components/site/SiteChrome'
import { ReviewForm } from '@/components/site/ReviewForm'

// Meeting Nov 2026, item 8: a review link opleiders and merken share with their clients.
// Same form and verification as on the course page, without the rest of the page around it.
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Schrijf een review', robots: { index: false, follow: false } }

export default async function ReviewLinkPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  if (!/^\d+$/.test(courseId)) notFound()
  const payload = await getPayload({ config: await config })
  const course = await payload.findByID({ collection: 'courses', id: Number(courseId), depth: 1, overrideAccess: true }).catch(() => null)
  if (!course || course.status !== 'published') notFound()
  const owner = (typeof course.trainer === 'object' && course.trainer) || (typeof course.brand === 'object' && course.brand) || null
  const ownerName = owner && 'name' in owner ? String(owner.name || '') : ''
  const cat = typeof course.category === 'object' && course.category ? course.category : null
  const courseHref = cat ? `/opleidingen/${cat.slug}/${course.slug}` : null

  return (
    <SiteChrome>
      <section className="bl-container" style={{ paddingTop: 72, paddingBottom: 96, maxWidth: 760 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 'clamp(30px, 4vw, 44px)', lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: 0, textWrap: 'balance' }}>
          Hoe was {course.title}?
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', margin: '14px 0 32px', maxWidth: 620 }}>
          {ownerName ? `${ownerName} vraagt je om je ervaring te delen. ` : ''}Je review helpt andere professionals kiezen. Na het versturen krijg je een e-mail om je review te bevestigen. Daarna controleert Blissify ze voordat ze op de opleidingspagina verschijnt.
        </p>
        <ReviewForm courseId={String(course.id)} />
        {courseHref ? (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-meta)', margin: '32px 0 0' }}>
            <a href={courseHref} className="bl-textlink">Bekijk de opleiding op Blissify</a>
          </p>
        ) : null}
      </section>
    </SiteChrome>
  )
}
