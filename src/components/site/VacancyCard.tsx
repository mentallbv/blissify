import React from 'react'
import { Avatar } from '@/components/ui'
import type { VacancyCardData } from '@/lib/vacancies'
import { regimeLabels, sectorLabels, typeLabels } from '@/lib/vacancies'

/** Overview card (spec: title, company, city, type, sector, regime, publication date). */
export function VacancyCard({ v }: { v: VacancyCardData }) {
  const meta = [typeLabels(v.types)[0], regimeLabels(v.regimes)[0]].filter(Boolean).join(' · ')
  return (
    <a href={v.href} className="bl-providercard" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 22, textDecoration: 'none', height: '100%' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <Avatar initial={(v.companyName || '?')[0]} src={v.logo} size={44} radius={6} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-meta)' }}>{v.companyName}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 19, lineHeight: 1.25, color: 'var(--text-brand)' }}>{v.title}</div>
        </div>
      </div>
      {v.intro ? <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.6, color: 'var(--text-body)', margin: 0 }}>{v.intro}</p> : null}
      <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)' }}>
        <span><i className="ti ti-map-pin" aria-hidden="true" /> {v.city}</span>
        {meta ? <span>{meta}</span> : null}
        {v.sectors[0] ? <span>{sectorLabels(v.sectors)[0]}</span> : null}
        <span>{new Date(v.publishedAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>
    </a>
  )
}
