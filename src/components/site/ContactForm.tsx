'use client'

import React from 'react'
import { Input, Button, FieldLabel } from '@/components/ui'

export function ContactForm() {
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [subject, setSubject] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [done, setDone] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Verzenden mislukt.')
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 8, padding: 40, textAlign: 'center' }}>
        <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--status-success-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
          <i className="ti ti-check" style={{ fontSize: 28, color: 'var(--status-success)' }} />
        </span>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--text-brand)', margin: '0 0 8px' }}>Bericht verstuurd</h3>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-body)', margin: 0 }}>
          Bedankt. We nemen zo snel mogelijk contact met je op.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 8, padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Input label="Naam" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="E-mailadres" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input label="Onderwerp" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <div>
        <FieldLabel>Bericht</FieldLabel>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          style={{ width: '100%', minHeight: 130, border: '0.5px solid var(--neutral-200)', borderRadius: 6, background: 'var(--surface-card)', padding: '12px 16px', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-strong)', lineHeight: 1.6, resize: 'vertical', outline: 'none' }}
        />
      </div>
      {error ? <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--status-error)', background: 'var(--status-error-bg)', borderRadius: 6, padding: '10px 14px' }}>{error}</div> : null}
      <div>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Versturen…' : 'Verstuur bericht'}
        </Button>
      </div>
    </form>
  )
}
