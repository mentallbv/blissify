import React from 'react'
import { StatusPill } from '@/components/ui'

export type DashCourse = {
  name: string
  category: string
  price: string
  enquiries: number
  status: 'active' | 'draft' | 'archived'
  editHref?: string
  viewHref?: string
}

const STATUS_LABELS: Record<string, string> = { active: 'Actief', draft: 'Concept', archived: 'Gearchiveerd' }
const STATUS_TONE: Record<string, 'published' | 'draft' | 'archived'> = {
  active: 'published',
  draft: 'draft',
  archived: 'archived',
}

export function CourseTable({ rows, limit }: { rows: DashCourse[]; limit?: number }) {
  const data = limit ? rows.slice(0, limit) : rows
  const th: React.CSSProperties = {
    fontFamily: 'var(--font-ui)',
    fontWeight: 'var(--fw-ui-medium)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--text-meta)',
    textAlign: 'left',
    padding: '12px 20px',
    background: 'var(--surface-page)',
    whiteSpace: 'nowrap',
  }
  const td: React.CSSProperties = {
    fontFamily: 'var(--font-ui)',
    fontWeight: 'var(--fw-ui-regular)',
    fontSize: 14,
    color: 'var(--text-strong)',
    padding: '0 20px',
    height: 52,
    borderBottom: '0.5px solid var(--border-hairline)',
    verticalAlign: 'middle',
  }
  return (
    <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Opleiding</th>
            <th style={th}>Categorie</th>
            <th style={th}>Prijs</th>
            <th style={th}>Aanvragen</th>
            <th style={th}>Status</th>
            <th style={{ ...th, textAlign: 'right' }}>Acties</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i}>
              <td style={{ ...td, fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 16, color: 'var(--text-brand)' }}>
                {r.name}
              </td>
              <td style={td}>{r.category}</td>
              <td style={td}>{r.price}</td>
              <td style={td}>{r.enquiries}</td>
              <td style={td}>
                <StatusPill status={STATUS_TONE[r.status]}>{STATUS_LABELS[r.status]}</StatusPill>
              </td>
              <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                {r.editHref ? (
                  <a href={r.editHref} className="bl-textlink" style={{ marginRight: 16 }}>
                    Bewerken
                  </a>
                ) : (
                  <span className="bl-textlink" style={{ marginRight: 16 }}>
                    Bewerken
                  </span>
                )}
                {r.viewHref ? (
                  <a href={r.viewHref} className="bl-textlink">
                    Bekijken
                  </a>
                ) : (
                  <span className="bl-textlink">Bekijken</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
