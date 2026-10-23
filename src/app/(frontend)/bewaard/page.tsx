import React from 'react'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/SiteChrome'
import { Eyebrow } from '@/components/ui'
import { SavedCoursesList } from '@/components/site/SavedCoursesList'

export const metadata: Metadata = {
  title: 'Bewaarde opleidingen',
  description: 'Je bewaarde wellness- en beautyopleidingen op dit toestel, om te vergelijken.',
  robots: { index: false },
}

/** Saved courses, kept in the visitor's browser (client round 2 #4.3). */
export default function SavedCoursesPage() {
  return (
    <SiteChrome>
      <section className="bl-container" style={{ paddingTop: 72, paddingBottom: 24 }}>
        <Eyebrow tone="meta">Bewaard</Eyebrow>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 48, letterSpacing: '-0.01em', color: 'var(--text-brand)', lineHeight: 1.1, margin: '14px 0 0' }}>
          Bewaarde opleidingen
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', maxWidth: 640, margin: '20px 0 0' }}>
          De opleidingen die je op dit toestel hebt bewaard. Ze blijven hier staan zolang je je browsergegevens niet wist.
        </p>
      </section>
      <section className="bl-container" style={{ paddingTop: 24, paddingBottom: 80 }}>
        <SavedCoursesList />
      </section>
    </SiteChrome>
  )
}
