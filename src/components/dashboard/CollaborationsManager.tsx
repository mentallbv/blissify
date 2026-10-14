'use client'

import React from 'react'
import { Avatar, Button, Input } from '@/components/ui'
import type { CollaborationRow } from '@/lib/collaborations'

/**
 * Dashboard "Samenwerkingen" (client round 2, section 5).
 * Brand (Partner Ultimate): find an opleider, invite, follow requests, end.
 * Opleider: accept or decline requests, end collaborations.
 */

type SearchResult = { id: number; name: string; slug: string; city: string; image: string | null }

const card: React.CSSProperties = { background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 24, marginBottom: 20 }
const h2: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)', margin: '0 0 6px' }
const lead: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 13, lineHeight: 1.6, color: 'var(--text-meta)', margin: '0 0 18px' }
const empty: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-meta)', margin: 0 }

export function CollaborationsManager({
  role,
  canInvite,
  initialRows,
}: {
  role: 'brand' | 'trainer'
  canInvite: boolean
  initialRows: CollaborationRow[]
}) {
  const [rows, setRows] = React.useState(initialRows)
  const [busy, setBusy] = React.useState<number | null>(null)
  const [error, setError] = React.useState('')
  const [notice, setNotice] = React.useState('')

  const refresh = async () => {
    const res = await fetch('/api/dashboard/collaborations', { credentials: 'include' })
    if (res.ok) setRows(((await res.json()) as { rows: CollaborationRow[] }).rows)
  }

  const act = async (id: number, action: 'accept' | 'decline' | 'remove', confirmText?: string, doneText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return
    setBusy(id)
    setError('')
    setNotice('')
    try {
      const res = await fetch(`/api/dashboard/collaborations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action }),
      })
      const json = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) setError(json.error || 'Er ging iets mis.')
      else {
        setNotice(doneText || (action === 'accept' ? 'Samenwerking aanvaard.' : action === 'decline' ? 'Verzoek geweigerd.' : 'Samenwerking beëindigd.'))
        await refresh()
      }
    } finally {
      setBusy(null)
    }
  }

  const approved = rows.filter((r) => r.status === 'approved')
  const pending = rows.filter((r) => r.status === 'pending')
  const partnerWord = role === 'brand' ? 'opleider' : 'merk'

  return (
    <div style={{ maxWidth: 820 }}>
      {error ? <Banner tone="error">{error}</Banner> : null}
      {notice ? <Banner tone="ok">{notice}</Banner> : null}

      {role === 'brand' ? (
        canInvite ? (
          <InviteBox
            onInvited={async (name) => {
              setNotice(`Samenwerkingsverzoek verstuurd naar ${name}.`)
              setError('')
              await refresh()
            }}
            onError={setError}
            existing={new Map(rows.map((r) => [r.partner.id, r.status]))}
          />
        ) : (
          <div style={card}>
            <h2 style={h2}>Samenwerken met opleiders</h2>
            <p style={{ ...lead, margin: 0 }}>
              Met Partner Ultimate stuur je opleiders een samenwerkingsverzoek. Na hun goedkeuring verschijnt de samenwerking op beide profielen en
              kun je opleiders koppelen aan je opleidingen. <a href="/dashboard/abonnement" style={{ color: 'var(--text-accent)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Bekijk je abonnement</a>
            </p>
          </div>
        )
      ) : null}

      <div style={card}>
        <h2 style={h2}>{role === 'brand' ? 'Verstuurde verzoeken' : 'Samenwerkingsverzoeken'}</h2>
        <p style={lead}>
          {role === 'brand'
            ? 'Verzoeken die nog op een antwoord van de opleider wachten.'
            : 'Merken die met jou willen samenwerken. Na je goedkeuring verschijnt de samenwerking op beide profielen.'}
        </p>
        {pending.length ? (
          <List>
            {pending.map((r) => (
              <PartnerRow key={r.id} row={r}>
                {role === 'trainer' ? (
                  <>
                    <Button size="sm" variant="primary" disabled={busy === r.id} onClick={() => act(r.id, 'accept')}>Aanvaarden</Button>
                    <Button size="sm" variant="ghost" disabled={busy === r.id} onClick={() => act(r.id, 'decline')}>Weigeren</Button>
                  </>
                ) : (
                  <Button size="sm" variant="ghost" disabled={busy === r.id} onClick={() => act(r.id, 'remove', `Verzoek aan ${r.partner.name} intrekken?`, 'Verzoek ingetrokken.')}>Intrekken</Button>
                )}
              </PartnerRow>
            ))}
          </List>
        ) : (
          <p style={empty}>Geen openstaande verzoeken.</p>
        )}
      </div>

      <div style={card}>
        <h2 style={h2}>Actieve samenwerkingen</h2>
        <p style={lead}>
          {role === 'brand'
            ? 'Deze opleiders staan als "Samenwerkende opleiders" op je profiel. Je kunt ze koppelen aan je opleidingen.'
            : 'Deze merken staan als "Werkt samen met" op je profiel. Je kunt ze koppelen aan je opleidingen.'}
        </p>
        {approved.length ? (
          <List>
            {approved.map((r) => (
              <PartnerRow key={r.id} row={r}>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy === r.id}
                  onClick={() => act(r.id, 'remove', `Samenwerking met ${r.partner.name} beëindigen? Gekoppelde opleidingen worden losgekoppeld.`)}
                >
                  Beëindigen
                </Button>
              </PartnerRow>
            ))}
          </List>
        ) : (
          <p style={empty}>Nog geen actieve samenwerkingen met een {partnerWord}.</p>
        )}
      </div>
    </div>
  )
}

function InviteBox({
  onInvited,
  onError,
  existing,
}: {
  onInvited: (name: string) => void
  onError: (msg: string) => void
  existing: Map<number, string>
}) {
  const [q, setQ] = React.useState('')
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const [sending, setSending] = React.useState<number | null>(null)

  React.useEffect(() => {
    const term = q.trim()
    if (term.length < 2) {
      setResults([])
      return
    }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/dashboard/collaborations/search?q=${encodeURIComponent(term)}`, { credentials: 'include' })
        if (res.ok) setResults(((await res.json()) as { results: SearchResult[] }).results)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [q])

  const invite = async (r: SearchResult) => {
    setSending(r.id)
    try {
      const res = await fetch('/api/dashboard/collaborations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ trainerId: r.id }),
      })
      const json = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) onError(json.error || 'Versturen mislukt.')
      else onInvited(r.name)
    } finally {
      setSending(null)
    }
  }

  const stateLabel: Record<string, string> = { pending: 'Verzoek verstuurd', approved: 'Werkt al samen' }

  return (
    <div style={card}>
      <h2 style={h2}>Opleider uitnodigen</h2>
      <p style={lead}>Zoek een opleider op naam en stuur een samenwerkingsverzoek. De opleider moet het verzoek goedkeuren.</p>
      <Input type="search" placeholder="Zoek op naam van de opleider" value={q} onChange={(e) => setQ(e.target.value)} icon={<i className="ti ti-search" />} />
      {q.trim().length >= 2 ? (
        <div style={{ marginTop: 14 }}>
          {loading && !results.length ? (
            <p style={empty}>Zoeken…</p>
          ) : results.length ? (
            <List>
              {results.map((r) => {
                const state = existing.get(r.id)
                return (
                  <div key={r.id} style={rowStyle}>
                    <Avatar initial={r.name[0]} src={r.image} size={40} radius={20} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={nameStyle}>{r.name}</div>
                      {r.city ? <div style={metaStyle}>{r.city}</div> : null}
                    </div>
                    {state && stateLabel[state] ? (
                      <span style={metaStyle}>{stateLabel[state]}</span>
                    ) : (
                      <Button size="sm" variant="primary" disabled={sending === r.id} onClick={() => invite(r)}>
                        Uitnodigen
                      </Button>
                    )}
                  </div>
                )
              })}
            </List>
          ) : (
            <p style={empty}>Geen opleiders gevonden.</p>
          )}
        </div>
      ) : null}
    </div>
  )
}

const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderTop: '0.5px solid var(--border-hairline)', flexWrap: 'wrap' }
const nameStyle: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 14, color: 'var(--text-strong)' }
const metaStyle: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)' }

function List({ children }: { children: React.ReactNode }) {
  return <div style={{ borderBottom: '0.5px solid var(--border-hairline)' }}>{children}</div>
}

function PartnerRow({ row, children }: { row: CollaborationRow; children: React.ReactNode }) {
  return (
    <div style={rowStyle}>
      <Avatar initial={row.partner.name[0] || '?'} src={row.partner.image} size={40} radius={20} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <a href={row.partner.href} target="_blank" rel="noopener noreferrer" style={{ ...nameStyle, textDecoration: 'none' }}>
          {row.partner.name}
        </a>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>{children}</div>
    </div>
  )
}

function Banner({ tone, children }: { tone: 'ok' | 'error'; children: React.ReactNode }) {
  const err = tone === 'error'
  return (
    <div
      role={err ? 'alert' : 'status'}
      style={{
        marginBottom: 16,
        padding: '12px 14px',
        borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-ui)',
        fontSize: 14,
        background: err ? 'var(--status-error-bg)' : 'var(--status-success-bg)',
        color: err ? 'var(--status-error)' : 'var(--status-success)',
      }}
    >
      {children}
    </div>
  )
}
