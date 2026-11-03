import React from 'react'
import type { BrandCardData } from '@/lib/data'
import { cssUrl } from '@/lib/css-url'

const prettySector = (s: string) => (s ? (s.charAt(0).toUpperCase() + s.slice(1)).replace(/-/g, ' ') : '')

/** Brand / supplier card, shared by /merken-leveranciers and the homepage. */
export function BrandCard({ b }: { b: BrandCardData }) {
  const counts = [b.courseCount ? `${b.courseCount} ${b.courseCount === 1 ? 'opleiding' : 'opleidingen'}` : null, b.providerCount ? `${b.providerCount} ${b.providerCount === 1 ? 'opleider' : 'opleiders'}` : null].filter(Boolean)
  return (
    <a href={b.href} className="bl-wscard bl-brandcard">
      <div className="bl-wscard-media bl-brandcard-media" style={b.cover ? { backgroundImage: cssUrl(b.cover) } : undefined}>
        {b.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="bl-brandcard-logo" src={b.logo} alt={`Logo ${b.name}`} />
        ) : !b.cover ? (
          <span className="bl-brandcard-mark" aria-hidden="true">{b.name}</span>
        ) : null}
      </div>
      <div className="bl-wscard-body">
        {b.sector ? <div className="bl-brandcard-sector">{prettySector(b.sector)}</div> : null}
        <h3 className="bl-brandcard-name">{b.name}</h3>
        {counts.length ? <div className="bl-brandcard-meta">{counts.join(' · ')}</div> : null}
        <span className="bl-listrow-cta" style={{ marginTop: 'auto' }}>Bekijk merk →</span>
      </div>
    </a>
  )
}
