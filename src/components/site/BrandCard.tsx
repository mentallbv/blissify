import React from 'react'
import { Avatar, TypeBadge } from '@/components/ui'
import type { BrandCardData } from '@/lib/data'

/** Brand / supplier card, shared by /merken-leveranciers and the homepage. */
export function BrandCard({ b }: { b: BrandCardData }) {
  return (
    <a href={b.href} className="bl-providercard" style={{ display: 'block', padding: 20 }}>
      <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
        <Avatar initial={b.initial} src={b.logo} size={44} radius={6} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: '0 0 2px', fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 20, color: 'var(--text-brand)', lineHeight: 1.15 }}>
            {b.name}
          </h3>
          <p style={{ margin: 0, fontFamily: 'var(--font-ui)', fontSize: 'var(--type-xs)', color: 'var(--text-body)', lineHeight: 1.4 }}>{b.sector}</p>
          <div style={{ marginTop: 8 }}>
            <TypeBadge type="brand" />
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 'var(--space-5)', fontFamily: 'var(--font-ui)', fontSize: 'var(--type-xs)', color: 'var(--text-accent)' }}>
        <span>{b.providerCount} opleiders</span>
        <span style={{ color: 'var(--text-meta)' }}>·</span>
        <span>{b.courseCount} cursussen</span>
      </div>
    </a>
  )
}
