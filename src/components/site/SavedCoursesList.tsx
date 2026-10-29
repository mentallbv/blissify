'use client'

import React from 'react'
import { CourseCard, ButtonLink } from '@/components/ui'
import { removeSavedCourse, useSavedCourses } from '@/lib/saved-courses'

/** The visitor's saved courses (this browser only), for comparing (client round 2 #4.3). */
export function SavedCoursesList() {
  const saved = useSavedCourses()
  const [ready, setReady] = React.useState(false)
  React.useEffect(() => setReady(true), [])

  if (!ready) return null
  if (!saved.length) {
    return (
      <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '56px 32px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-meta)', margin: '0 auto 20px', maxWidth: 420 }}>
          Je hebt nog geen favorieten. Klik op &ldquo;Opleiding opslaan&rdquo; bij een opleiding om ze hier te bewaren.
        </p>
        <ButtonLink href="/opleidingen" variant="primary">
          Vind een opleiding
        </ButtonLink>
      </div>
    )
  }
  return (
    <div className="bl-grid-3">
      {saved.map((c) => (
        <div key={c.href} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <CourseCard
            href={c.href}
            title={c.title}
            category={c.category}
            provider={c.provider}
            location={c.location}
            price={c.price}
            format={c.format}
            image={c.image}
            providerType={c.providerType}
          />
          <button
            type="button"
            onClick={() => removeSavedCourse(c.href)}
            style={{ alignSelf: 'flex-start', border: 0, background: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)', textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            Verwijderen uit favorieten
          </button>
        </div>
      ))}
    </div>
  )
}
