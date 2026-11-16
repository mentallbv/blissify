import React from 'react'
import { Button, ButtonLink, StatusPill } from '@/components/ui'

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
  showEnquiries = true,
  onDuplicate,
  onDelete,
  busyId,
}: {
  rows: DashCourse[]
  limit?: number
  /** Request counts are statistics: hidden on Lite plans. */
  showEnquiries?: boolean
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
            {showEnquiries ? <th style={th}>Aanvragen</th> : null}
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
              {showEnquiries ? <td style={td}>{r.enquiries}</td> : null}
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
                  // Same pill buttons as the vacatures and werkruimtes lists.
                  <div style={{ display: 'inline-flex', gap: 8 }}>
                    {r.editHref ? <ButtonLink size="sm" variant="ghost" href={r.editHref}>Bewerken</ButtonLink> : null}
                    {r.viewHref ? <ButtonLink size="sm" variant="ghost" href={r.viewHref}>Bekijken</ButtonLink> : null}
                    {onDuplicate && r.id ? (
                      <Button size="sm" variant="ghost" disabled={busyId != null} onClick={() => onDuplicate(r.id as number)}>Dupliceren</Button>
                    ) : null}
                    {onDelete && r.id ? (
                      <Button size="sm" variant="ghost" disabled={busyId != null} onClick={() => onDelete(r.id as number)}>Verwijderen</Button>
                    ) : null}
                  </div>
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
