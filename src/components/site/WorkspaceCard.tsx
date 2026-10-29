import React from 'react'
import type { WorkspaceCardData } from '@/lib/workspaces'
import { workplaceLabels } from '@/lib/workspaces'
import { cssUrl } from '@/lib/css-url'

/** Overview card (like flexsalon.be: photo, type, city, salon, price, highlights, availability). */
export function WorkspaceCard({ w }: { w: WorkspaceCardData }) {
  return (
    <a href={w.href} className="bl-providercard" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', height: '100%', overflow: 'hidden', padding: 0 }}>
      <div style={{ aspectRatio: '16 / 10', background: w.image ? `${cssUrl(w.image)} center / cover` : 'var(--surface-page)', position: 'relative' }}>
        {w.availableNow ? (
          <span style={{ position: 'absolute', left: 12, top: 12, background: 'var(--surface-card)', color: 'var(--status-success)', borderRadius: 'var(--radius-pill)', padding: '4px 10px', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 'var(--fw-ui-medium)' }}>Nu beschikbaar</span>
        ) : null}
      </div>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-meta)' }}>
          {workplaceLabels(w.workplaceTypes)[0] || 'Werkruimte'} · {w.city}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 19, lineHeight: 1.25, color: 'var(--text-brand)' }}>{w.title}</div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-body)' }}>{w.companyName}</div>
        {w.highlights.length ? <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)' }}>{w.highlights.join(' · ')}</div> : null}
        <div style={{ marginTop: 'auto', paddingTop: 6, fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 15, color: 'var(--text-brand)' }}>
          {w.price} {w.price.startsWith('€') ? <span style={{ fontWeight: 'var(--fw-ui-regular)', fontSize: 11, color: 'var(--text-meta)' }}>excl. btw</span> : null}
        </div>
      </div>
    </a>
  )
}
