'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

export type LeadRow = {
  id: string
  name: string
  email: string
  message: string | null
  courseTitle: string
  read: boolean
  created_at: string
}

export function LeadsList({ leads }: { leads: LeadRow[] }) {
  const router = useRouter()
  const [busy, setBusy] = React.useState<string | null>(null)

  async function markRead(id: string) {
    setBusy(id)
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ read: true }),
    }).catch(() => {})
    setBusy(null)
    router.refresh()
  }

  if (leads.length === 0) {
    return (
      <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 8, padding: 40, textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-meta)', margin: 0 }}>
          Nog geen aanvragen. Zodra cursisten informatie aanvragen, verschijnen ze hier.
        </p>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 8, overflow: 'hidden' }}>
      {leads.map((l, i) => (
        <div key={l.id} style={{ display: 'flex', gap: 16, padding: '18px 20px', borderBottom: i < leads.length - 1 ? '0.5px solid var(--border-hairline)' : 'none', alignItems: 'flex-start' }}>
          <span style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--surface-dark)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 16, color: 'var(--blissify-chalk)', flex: 'none' }}>
            {l.name[0]}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 14, color: 'var(--text-strong)' }}>{l.name}</span>
              {!l.read ? <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-accent)' }}>Nieuw</span> : null}
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-body)' }}>
              {l.email} · {l.courseTitle}
            </div>
            {l.message ? <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.6, color: 'var(--text-body)', margin: '8px 0 0' }}>{l.message}</p> : null}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flex: 'none' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)' }}>{new Date(l.created_at).toLocaleDateString('nl-BE')}</span>
            {!l.read ? (
              <button type="button" onClick={() => markRead(l.id)} disabled={busy === l.id} className="bl-textlink" style={{ fontSize: 12 }}>
                {busy === l.id ? '…' : 'Markeer als gelezen'}
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
