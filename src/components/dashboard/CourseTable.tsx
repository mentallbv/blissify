import React from 'react'
import { StatusPill } from '@/components/ui'

export type DashCourse = {
  id?: number
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

export function CourseTable({
  rows,
  limit,
  onDuplicate,
  onDelete,
  busyId,
}: {
  rows: DashCourse[]
  limit?: number
  onDuplicate?: (id: number) => void
  onDelete?: (id: number) => void
  busyId?: number | null
}) {
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
    <div className="bl-dashboard-table-scroll" style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', overflow: 'auto' }}>
      <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse' }}>
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
          {data.map((r, i) => {
            const busy = busyId != null && busyId === r.id
            return (
            <tr key={i} style={busy ? { opacity: 0.55 } : undefined}>
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
                {busy ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-meta)' }}>
                    <i className="ti ti-loader-2 bl-spin" style={{ fontSize: 16 }} aria-hidden="true" />
                    Bezig…
                  </span>
                ) : (
                  <>
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
                      <a href={r.viewHref} className="bl-textlink" style={{ marginRight: 16 }}>
                        Bekijken
                      </a>
                    ) : (
                      <span className="bl-textlink" style={{ marginRight: 16 }}>Bekijken</span>
                    )}
                    {onDuplicate && r.id ? (
                      <button
                        type="button"
                        onClick={() => onDuplicate(r.id as number)}
                        disabled={busyId != null}
                        className="bl-textlink"
                        style={{ marginRight: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
                      >
                        Dupliceren
                      </button>
                    ) : null}
                    {onDelete && r.id ? (
                      <button
                        type="button"
                        onClick={() => onDelete(r.id as number)}
                        disabled={busyId != null}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--status-warning)' }}
                      >
                        Verwijderen
                      </button>
                    ) : null}
                  </>
                )}
              </td>
            </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
