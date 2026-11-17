'use client'

import React from 'react'
import { Button } from '@/components/ui'
import { toggleSavedCourse, useSavedCourses, savedKind, SAVED_KIND_LABEL, type SavedCourse } from '@/lib/saved-courses'

/**
 * Save to favourites, kept in this browser (client round 2 #4.3). Works for
 * opleidingen, werkruimtes, vacatures and merken (Lonne, Nov 2026).
 * `tone="light"` is for dark headers.
 */
export function SaveCourseButton({ course, tone = 'default' }: { course: Omit<SavedCourse, 'savedAt'>; tone?: 'default' | 'light' }) {
  const saved = useSavedCourses().some((c) => c.href === course.href)
  const label = SAVED_KIND_LABEL[savedKind(course)]
  const icon = <i className={saved ? 'ti ti-heart-filled' : 'ti ti-heart'} aria-hidden="true" />
  if (tone === 'light') {
    return (
      <Button variant="ghost-dark" size="sm" aria-pressed={saved} onClick={() => toggleSavedCourse(course)}>
        {icon}
        {saved ? 'Opgeslagen' : label.save}
      </Button>
    )
  }
  return (
    <div>
      <Button variant="ghost" fullWidth aria-pressed={saved} onClick={() => toggleSavedCourse(course)}>
        {icon}
        {saved ? 'Opgeslagen' : label.save}
      </Button>
      {saved ? (
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)', textAlign: 'center', marginTop: 6 }}>
          Bewaard op dit toestel ·{' '}
          <a href="/favorieten" style={{ color: 'var(--text-accent)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Bekijk je favorieten
          </a>
        </div>
      ) : null}
    </div>
  )
}
