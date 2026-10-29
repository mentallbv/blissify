import React from 'react'
import type { WorkspaceCardData } from '@/lib/workspaces'
import { workplaceLabels } from '@/lib/workspaces'
import { cssUrl } from '@/lib/css-url'

const ICON: Record<string, string> = { werkstoel: 'ti-armchair', behandelruimte: 'ti-door', 'volledig-salon': 'ti-building-store', 'gedeelde-ruimte': 'ti-users-group' }

/** Workspace card: photo (or a branded placeholder), price on the image, type tags, highlights. */
export function WorkspaceCard({ w }: { w: WorkspaceCardData }) {
  const [amount, ...rest] = w.price.split(' / ')
  return (
    <a href={w.href} className="bl-wscard">
      <div className={'bl-wscard-media' + (w.image ? '' : ' bl-wscard-media--empty')} style={w.image ? { backgroundImage: cssUrl(w.image) } : undefined}>
        {w.image ? null : <i className={`ti ${ICON[w.workplaceTypes[0]] || 'ti-building-store'}`} aria-hidden="true" />}
        {w.availableNow ? <span className="bl-wscard-status bl-tag bl-tag--ok">Nu beschikbaar</span> : null}
        <span className="bl-wscard-price">
          {amount}
          {rest.length ? ` / ${rest.join(' / ')}` : ''}
          {w.price.startsWith('€') ? <small>excl. btw</small> : null}
        </span>
      </div>
      <div className="bl-wscard-body">
        <div className="bl-wscard-title">{w.title}</div>
        <div className="bl-meta">
          <span><i className="ti ti-building-store" aria-hidden="true" />{w.companyName}</span>
          <span><i className="ti ti-map-pin" aria-hidden="true" />{w.city}</span>
        </div>
        <div className="bl-tags">{workplaceLabels(w.workplaceTypes).slice(0, 2).map((t) => <span key={t} className="bl-tag">{t}</span>)}</div>
        {w.highlights.length ? (
          <div className="bl-wscard-foot bl-meta">
            {w.highlights.map((h) => <span key={h}><i className="ti ti-check" aria-hidden="true" />{h}</span>)}
          </div>
        ) : null}
      </div>
    </a>
  )
}
