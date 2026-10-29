'use client'

import React from 'react'
import { Button, FieldLabel, Input, Select } from '@/components/ui'
import { ModalShell } from './ModalShell'
import { REPORT_REASONS } from '@/lib/report-reasons'

/** "Meld deze advertentie": a short report that goes to the Blissify admin. */
export function ReportListing({ kind, slug }: { kind: 'workspace' | 'vacancy'; slug: string }) {
  const [open, setOpen] = React.useState(false)
  const [f, setF] = React.useState({ reason: '', details: '', email: '', website: '' })
  const [done, setDone] = React.useState(false)
  const [error, setError] = React.useState('')
  const close = React.useCallback(() => setOpen(false), [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/report-listing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, kind, slug }) }).catch(() => null)
    const data = res ? await res.json().catch(() => ({})) : {}
    if (!res?.ok) setError((data as { error?: string }).error || 'Versturen mislukt.')
    else setDone(true)
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="bl-textlink" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text-meta)' }}>
        <i className="ti ti-flag" aria-hidden="true" /> Meld deze advertentie
      </button>
      {open ? (
        <ModalShell title={done ? 'Bedankt voor je melding' : 'Meld deze advertentie'} onClose={close} width={440}>
          {done ? (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-body)', margin: 0 }}>We bekijken de advertentie zo snel mogelijk.</p>
          ) : (
            <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
              <Select label="Reden" value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} options={[{ value: '', label: 'Kies een reden' }, ...REPORT_REASONS.map((r) => ({ value: r, label: r }))]} required />
              <div>
                <FieldLabel>Toelichting (optioneel)</FieldLabel>
                <textarea value={f.details} onChange={(e) => setF({ ...f, details: e.target.value })} style={{ width: '100%', minHeight: 80, border: '0.5px solid var(--neutral-200)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', padding: '12px 16px', fontFamily: 'var(--font-ui)', fontSize: 14 }} />
              </div>
              <Input label="Je e-mailadres (optioneel)" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
              <input type="text" tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} aria-hidden="true" />
              {error ? <div role="alert" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--status-error)' }}>{error}</div> : null}
              <Button variant="primary" type="submit">Melding versturen</Button>
            </form>
          )}
        </ModalShell>
      ) : null}
    </>
  )
}
