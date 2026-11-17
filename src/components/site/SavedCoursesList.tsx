'use client'

import React from 'react'
import { CourseCard, ButtonLink } from '@/components/ui'
import { removeSavedCourse, useSavedCourses, savedKind, SAVED_KIND_LABEL, type SavedKind } from '@/lib/saved-courses'

const ORDER: SavedKind[] = ['opleiding', 'werkruimte', 'vacature', 'merk']

/** The visitor's favourites (this browser only), grouped per type (client round 2 #4.3, Lonne Nov 2026). */
export function SavedCoursesList() {
  const saved = useSavedCourses()
  const [ready, setReady] = React.useState(false)
  React.useEffect(() => setReady(true), [])

  if (!ready) return null
  if (!saved.length) {
    return (
      <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '56px 32px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-meta)', margin: '0 auto 20px', maxWidth: 460 }}>
          Je hebt nog geen favorieten. Klik op het hartje bij een opleiding, werkruimte, vacature of merk om het hier te bewaren.
        </p>
        <ButtonLink href="/opleidingen" variant="primary">
          Ontdek het aanbod
        </ButtonLink>
      </div>
    )
  }
  const groups = ORDER.map((kind) => ({ kind, items: saved.filter((c) => savedKind(c) === kind) })).filter((g) => g.items.length)
  return (
    <div style={{ display: 'grid', gap: 48 }}>
      {groups.map((g) => (
        <section key={g.kind}>
          {groups.length > 1 ? (
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 26, color: 'var(--text-brand)', margin: '0 0 20px' }}>
              {SAVED_KIND_LABEL[g.kind].many} <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-meta)' }}>({g.items.length})</span>
            </h2>
          ) : null}
          <div className="bl-grid-3">
            {g.items.map((c) => (
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
        </section>
      ))}
    </div>
  )
}
