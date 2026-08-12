import React from 'react'
import { SiteNav } from './SiteNav'
import { SiteFooter } from './SiteFooter'
import { getCurrentUser } from '@/lib/session'

/** Wraps marketing/marketplace pages with the sticky nav and forest footer. */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  return (
    <>
      <SiteNav user={user ? { name: user.name, role: user.role } : null} />
      <main>{children}</main>
      <SiteFooter />
    </>
  )
}

/** Shared section heading - Freight Display, used across marketplace pages. */
export function SectionHead({ children, size = 40 }: { children: React.ReactNode; size?: number }) {
  return (
    <h2
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 'var(--fw-display-light)',
        fontSize: size,
        letterSpacing: '-0.01em',
        color: 'var(--text-brand)',
        lineHeight: 1.1,
        margin: 0,
      }}
    >
      {children}
    </h2>
  )
}
