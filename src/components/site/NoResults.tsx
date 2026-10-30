'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { ButtonLink } from '@/components/ui'

/** Empty search result for every overview page (copy 10/2026, "Zoekresultaten en foutmeldingen"). */
export function NoResults({ minHeight = 360 }: { minHeight?: number }) {
  // Clearing the filters means the same page without its query string.
  const pathname = usePathname()
  return (
    <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '72px 48px', textAlign: 'center', minHeight, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)', margin: '0 0 8px' }}>Geen resultaten gevonden.</h3>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-strong)', margin: '0 0 20px', maxWidth: 380 }}>Pas je zoekterm of filters aan, of bekijk al het aanbod.</p>
      <ButtonLink href={pathname} variant="primary">Filters wissen</ButtonLink>
    </div>
  )
}
