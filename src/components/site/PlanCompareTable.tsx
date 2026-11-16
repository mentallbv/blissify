import React from 'react'
import type { PlanCompare } from '@/lib/plan-compare'

/**
 * Plan comparison with collapsible groups (feedback round 4, 10.1). Native
 * <details>, so it opens without JavaScript; prices stay visible above.
 */
function Value({ v }: { v: string }) {
  if (v === 'Y') return <i className="ti ti-check" aria-label="Inbegrepen" style={{ fontSize: 18, color: 'var(--blissify-terracotta)' }} />
  if (v === '-') return <span aria-label="Niet inbegrepen" style={{ color: 'var(--text-meta)' }}>—</span>
  return <>{v}</>
}

export function PlanCompareTable({ data }: { data: PlanCompare }) {
  return (
    <div className="bl-comparison-scroll" style={{ maxWidth: 1100, margin: '0 auto', overflowX: 'auto' }}>
      <div className="bl-compare" role="table" aria-label="Vergelijk de abonnementen">
        <div className="bl-compare-row bl-compare-head" role="row">
          <div role="columnheader">Functionaliteit</div>
          {data.cols.map((c, i) => (
            <div key={c} role="columnheader">{i === 2 ? <span aria-hidden="true" style={{ color: 'var(--blissify-terracotta)', marginRight: 4 }}>★</span> : null}{c}</div>
          ))}
        </div>
        {data.prices.map((r) => (
          <div key={r.label} className="bl-compare-row bl-compare-price" role="row">
            <div role="rowheader">{r.label}</div>
            {r.v.map((v, i) => <div key={i} role="cell"><Value v={v} /></div>)}
          </div>
        ))}
        {data.groups.map((g) => (
          <details key={g.title} className="bl-compare-group">
            <summary>
              <span>{g.title}</span>
              <i className="ti ti-chevron-down" aria-hidden="true" />
            </summary>
            {g.rows.map((r) => (
              <div key={r.label} className="bl-compare-row" role="row">
                <div role="rowheader">{r.label}</div>
                {r.v.map((v, i) => <div key={i} role="cell"><Value v={v} /></div>)}
              </div>
            ))}
          </details>
        ))}
      </div>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)', margin: '12px 0 0', textAlign: 'center' }}>Alle prijzen zijn exclusief btw. Klik op een onderdeel om te zien wat erin zit.</p>
    </div>
  )
}
