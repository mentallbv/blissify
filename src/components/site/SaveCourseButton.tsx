'use client'

import React from 'react'
import { Button } from '@/components/ui'
import { toggleSavedCourse, useSavedCourses, type SavedCourse } from '@/lib/saved-courses'

/** "Opleiding opslaan" on the course page: keeps the course in this browser (client round 2 #4.3). */
export function SaveCourseButton({ course }: { course: Omit<SavedCourse, 'savedAt'> }) {
  const saved = useSavedCourses().some((c) => c.href === course.href)
  return (
    <div>
      <Button variant="ghost" fullWidth aria-pressed={saved} onClick={() => toggleSavedCourse(course)}>
        <i className={saved ? 'ti ti-heart-filled' : 'ti ti-heart'} aria-hidden="true" />
        {saved ? 'Opgeslagen' : 'Opleiding opslaan'}
      </Button>
      {saved ? (
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)', textAlign: 'center', marginTop: 6 }}>
          Bewaard op dit toestel ·{' '}
          <a href="/bewaard" style={{ color: 'var(--text-accent)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Bekijk bewaarde opleidingen
          </a>
        </div>
      ) : null}
    </div>
  )
}
