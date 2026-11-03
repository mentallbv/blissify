import React from 'react'
import type { VacancyCardData } from '@/lib/vacancies'
import { regimeLabels, typeLabels } from '@/lib/vacancies'

/** Compact vacancy card for the homepage grid; the hub keeps the scannable list rows. */
export function VacancyTile({ v }: { v: VacancyCardData }) {
  const date = new Date(v.publishedAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })
  const tags = [...typeLabels(v.types).slice(0, 1), ...regimeLabels(v.regimes).slice(0, 1)]
  return (
    <a href={v.href} className="bl-wscard bl-vactile">
      <div className="bl-wscard-body">
        <div className="bl-brandcard-sector">{v.companyName}</div>
        <h3 className="bl-vactile-title">{v.title}</h3>
        {v.intro ? <p className="bl-vactile-intro">{v.intro}</p> : null}
        <div className="bl-tags">{tags.map((t) => <span key={t} className="bl-tag">{t}</span>)}</div>
        <div className="bl-vactile-foot">
          <span><i className="ti ti-map-pin" aria-hidden="true" /> {v.city}</span>
          <span>{date}</span>
        </div>
      </div>
    </a>
  )
}
