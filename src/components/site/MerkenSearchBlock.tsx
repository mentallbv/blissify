'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { MerkenFilterBar } from '@/components/site/MerkenFilterBar'
import type { MerkenFacets } from '@/lib/merken-filters'

/**
 * B6 - homepage "Ontdek Merken & Leveranciers" block. Free-text search plus the
 * reusable Merken filter bar (quick-access). Both route to /merken.
 */
export function MerkenSearchBlock({ facets }: { facets: MerkenFacets }) {
  const router = useRouter()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = String(new FormData(e.currentTarget).get('q') || '').trim()
    router.push(q ? `/merken?q=${encodeURIComponent(q)}` : '/merken')
  }

  return (
    <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-lg)', padding: 28 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--text-brand)', marginBottom: 6 }}>
        Ontdek Merken & Leveranciers
      </div>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.6, color: 'var(--text-body)', margin: '0 0 18px' }}>
        Zoek op merk, producttype of specialisatie, bijvoorbeeld laser apparatuur of holistische skincare.
      </p>
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <input
          name="q"
          className="bl-input"
          placeholder="Wat zoek je?"
          aria-label="Wat zoek je?"
          style={{ flex: 1, minWidth: 220, padding: '0 16px' }}
        />
        <Button variant="accent" type="submit">
          Zoek merken
        </Button>
      </form>
      <MerkenFilterBar facets={facets} basePath="/merken" />
    </div>
  )
}
