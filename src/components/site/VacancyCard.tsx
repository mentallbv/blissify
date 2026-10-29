import React from 'react'
import { Avatar } from '@/components/ui'
import type { VacancyCardData } from '@/lib/vacancies'
import { regimeLabels, sectorLabels, typeLabels } from '@/lib/vacancies'

const SHORT_TYPE: Record<string, string> = {
  'Werknemer in loondienst': 'Loondienst',
  'Zelfstandige / freelancer': 'Zelfstandig',
  'Zelfstandige in bijberoep': 'Bijberoep',
  'Samenwerking op commissiebasis': 'Commissie',
  'Stage / leerwerkplek': 'Stage',
  'Andere samenwerking': 'Andere samenwerking',
}

/** One vacancy as a list row (like creativeskills.be): easy to scan and compare. */
export function VacancyCard({ v }: { v: VacancyCardData }) {
  const date = new Date(v.publishedAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })
  return (
    <a href={v.href} className="bl-listrow">
      <Avatar initial={(v.companyName || '?')[0]} src={v.logo} size={56} radius={8} />
      <div style={{ minWidth: 0 }}>
        <div className="bl-listrow-company">{v.companyName}</div>
        <div className="bl-listrow-title">{v.title}</div>
        {v.intro ? <p className="bl-listrow-intro">{v.intro}</p> : null}
        <div className="bl-tags">
          {typeLabels(v.types).map((t) => <span key={t} className="bl-tag">{SHORT_TYPE[t] || t}</span>)}
          {regimeLabels(v.regimes).slice(0, 2).map((r) => <span key={r} className="bl-tag bl-tag--quiet">{r}</span>)}
          {sectorLabels(v.sectors).slice(0, 1).map((s) => <span key={s} className="bl-tag bl-tag--quiet">{s}</span>)}
        </div>
      </div>
      <div className="bl-listrow-side">
        <span><i className="ti ti-map-pin" aria-hidden="true" style={{ color: 'var(--palette-rose)', marginRight: 4 }} />{v.city}</span>
        <span style={{ color: 'var(--text-strong)' }}>{date}</span>
        <span className="bl-listrow-cta">Bekijk vacature →</span>
      </div>
    </a>
  )
}
