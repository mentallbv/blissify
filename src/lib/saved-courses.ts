'use client'

import React from 'react'

/**
 * "Opleiding opslaan" (client round 2 #4.3). Visitors have no account, so saved
 * courses live in this browser only (localStorage). Each entry is a snapshot of
 * the course card at the moment it was saved. Storage can be unavailable
 * (private mode, blocked site data), so every access is guarded and the UI
 * simply behaves as if nothing is saved.
 */

export type SavedCourse = {
  href: string
  title: string
  category: string
  provider: string
  location: string
  price: string
  format: string
  image: string | null
  providerType: 'trainer' | 'brand'
  savedAt: string
}

const KEY = 'blissify:saved-courses'
const EVENT = 'blissify:saved-courses-changed'

function read(): SavedCourse[] {
  try {
    const raw = window.localStorage.getItem(KEY)
    const list = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(list) ? (list.filter((c) => c && typeof c === 'object' && typeof (c as SavedCourse).href === 'string') as SavedCourse[]) : []
  } catch {
    return []
  }
}

function write(list: SavedCourse[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* storage unavailable: nothing to persist */
  }
  window.dispatchEvent(new Event(EVENT))
}

export function toggleSavedCourse(course: Omit<SavedCourse, 'savedAt'>): boolean {
  const list = read()
  const exists = list.some((c) => c.href === course.href)
  write(exists ? list.filter((c) => c.href !== course.href) : [{ ...course, savedAt: new Date().toISOString() }, ...list])
  return !exists
}

export function removeSavedCourse(href: string): void {
  write(read().filter((c) => c.href !== href))
}

/** Live list of saved courses; updates across components and browser tabs. */
export function useSavedCourses(): SavedCourse[] {
  const [list, setList] = React.useState<SavedCourse[]>([])
  React.useEffect(() => {
    const sync = () => setList(read())
    sync()
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])
  return list
}
