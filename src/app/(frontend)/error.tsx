'use client'

import React from 'react'
import { Button, ButtonLink } from '@/components/ui'

/** Error state (copy 10/2026, "Zoekresultaten en foutmeldingen"). */
export default function FrontendError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="bl-container" style={{ paddingTop: 120, paddingBottom: 120, textAlign: 'center', maxWidth: 560 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 36, lineHeight: 1.1, color: 'var(--text-brand)', margin: '0 0 12px' }}>Er ging iets mis.</h1>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', margin: '0 0 28px' }}>Probeer het opnieuw, of neem contact met ons op.</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button variant="primary" onClick={reset}>Probeer opnieuw</Button>
        <ButtonLink href="/contact" variant="ghost">Contact</ButtonLink>
      </div>
    </main>
  )
}
