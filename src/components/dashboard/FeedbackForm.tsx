'use client'

import React from 'react'
import { Button, FieldLabel } from '@/components/ui'

const KINDS = [
  { value: 'Suggestie', label: 'Suggestie', hint: 'Een idee om Blissify beter te maken' },
  { value: 'Klacht', label: 'Klacht', hint: 'Iets loopt niet zoals het hoort' },
]

const textarea: React.CSSProperties = { width: '100%', minHeight: 160, border: '0.5px solid var(--neutral-200)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', padding: '12px 16px', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-strong)', lineHeight: 1.6, resize: 'vertical', outline: 'none' }

export function FeedbackForm() {
  const [kind, setKind] = React.useState('Suggestie')
  const [message, setMessage] = React.useState('')
  const [state, setState] = React.useState<'idle' | 'busy' | 'sent'>('idle')
  const [error, setError] = React.useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setState('busy')
    const res = await fetch('/api/dashboard/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, message }) }).catch(() => null)
    const data = res ? await res.json().catch(() => ({})) : {}
    if (!res?.ok) { setError(data.error || 'Versturen lukte niet.'); setState('idle'); return }
    setState('sent')
  }

  if (state === 'sent') {
    return (
      <div role="status" style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 32 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text-brand)', margin: 0 }}>Bedankt voor je bericht.</p>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.7, color: 'var(--text-body)', margin: '10px 0 20px' }}>We lezen elke {kind.toLowerCase()} en nemen indien nodig contact met je op via het e-mailadres van je account.</p>
        <Button size="sm" variant="ghost" onClick={() => { setMessage(''); setState('idle') }}>Nog een bericht sturen</Button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 'clamp(20px, 3vw, 32px)', display: 'grid', gap: 20, maxWidth: 720 }}>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ padding: 0 }}><FieldLabel>Waarover gaat het?</FieldLabel></legend>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {KINDS.map((k) => (
            <label key={k.value} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: kind === k.value ? '1px solid var(--blissify-terracotta)' : '0.5px solid var(--neutral-200)', cursor: 'pointer' }}>
              <input type="radio" name="kind" value={k.value} checked={kind === k.value} onChange={() => setKind(k.value)} style={{ marginTop: 3, accentColor: 'var(--blissify-terracotta)' }} />
              <span>
                <span style={{ display: 'block', fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 14, color: 'var(--text-strong)' }}>{k.label}</span>
                <span style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)', marginTop: 2 }}>{k.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <label>
        <FieldLabel>Je bericht</FieldLabel>
        <textarea required minLength={5} maxLength={4000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Vertel ons wat je in gedachten hebt…" style={textarea} />
      </label>
      {error ? <div role="alert" style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-ui)', fontSize: 14, background: 'var(--status-error-bg)', color: 'var(--status-error)' }}>{error}</div> : null}
      <div><Button type="submit" variant="accent" disabled={state === 'busy'}>{state === 'busy' ? 'Bezig…' : 'Versturen'}</Button></div>
    </form>
  )
}
