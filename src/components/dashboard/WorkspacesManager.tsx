'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button, ButtonLink, StatusPill } from '@/components/ui'
import type { DashWorkspaceRow } from '@/lib/dashboard-data'

/** Dashboard list of werkruimtes: switch on/off, edit, delete. */
export function WorkspacesManager({ rows }: { rows: DashWorkspaceRow[] }) {
  const router = useRouter()
  const [busy, setBusy] = React.useState<number | null>(null)
  const [error, setError] = React.useState('')

  async function call(id: number, init: RequestInit) {
    setBusy(id)
    setError('')
    try {
      const res = await fetch(`/api/dashboard/workspaces/${id}`, { ...init, headers: { 'Content-Type': 'application/json' }, credentials: 'include' })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) setError(data.error || 'Er ging iets mis.')
      else router.refresh()
    } finally {
      setBusy(null)
    }
  }

  const th: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-meta)', textAlign: 'left', padding: '12px 16px' }
  const td: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-body)', padding: '14px 16px', borderTop: '0.5px solid var(--border-hairline)' }

  return (
    <>
      {error ? <div role="alert" style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-ui)', fontSize: 14, background: 'var(--status-error-bg)', color: 'var(--status-error)' }}>{error}</div> : null}
      <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse' }}>
          <thead>
            <tr><th style={th}>Werkruimte</th><th style={th}>Locatie</th><th style={th}>Status</th><th style={{ ...th, textAlign: 'right' }}>Acties</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={busy === r.id ? { opacity: 0.55 } : undefined}>
                <td style={{ ...td, fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text-brand)' }}>{r.title}</td>
                <td style={td}>{r.city}</td>
                <td style={td}><StatusPill status={r.status === 'published' ? 'published' : 'draft'}>{r.status === 'published' ? 'Online' : 'Offline'}</StatusPill></td>
                <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'inline-flex', gap: 8 }}>
                    <Button size="sm" variant="ghost" disabled={busy === r.id} onClick={() => call(r.id, { method: 'PATCH', body: JSON.stringify({ status: r.status === 'published' ? 'draft' : 'published' }) })}>
                      {r.status === 'published' ? 'Offline zetten' : 'Online zetten'}
                    </Button>
                    <ButtonLink size="sm" variant="ghost" href={`/dashboard/werkruimtes/${r.id}`}>Bewerken</ButtonLink>
                    <Button size="sm" variant="ghost" disabled={busy === r.id} onClick={() => { if (window.confirm(`"${r.title}" verwijderen?`)) call(r.id, { method: 'DELETE' }) }}>Verwijderen</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
