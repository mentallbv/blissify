'use client'

import React from 'react'
import { Input, Button, FieldLabel, Select } from '@/components/ui'
import { COMPLAINT_TOPICS } from '@/lib/complaint-topics'

/** Public complaints form (meeting Nov 2026, item 7). Posts to /api/klachten. */
export function ComplaintForm() {
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [topic, setTopic] = React.useState('')
  const [page, setPage] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [privacy, setPrivacy] = React.useState(false)
  const [done, setDone] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!topic) return setError('Kies waarover je klacht gaat.')
    if (!privacy) return setError('Ga akkoord met de privacyverklaring om je klacht te versturen.')
    setLoading(true)
    try {
      const res = await fetch('/api/klachten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, topic, page, message, privacy }),
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
      <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 40, textAlign: 'center' }}>
        <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--status-success-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
          <i className="ti ti-check" style={{ fontSize: 28, color: 'var(--status-success)' }} />
        </span>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--text-brand)', margin: '0 0 8px' }}>Klacht verstuurd</h3>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-body)', margin: 0 }}>
          Bedankt. Je krijgt een bevestiging per e-mail en we laten je zo snel mogelijk iets weten.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Input label="Naam" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="E-mailadres" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Select
        label="Waarover gaat je klacht?"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        options={[{ value: '', label: 'Kies een onderwerp' }, ...COMPLAINT_TOPICS.map((s) => ({ value: s, label: s }))]}
      />
      <Input label="Over welke aanbieder of pagina? (optioneel)" value={page} onChange={(e) => setPage(e.target.value)} placeholder="Naam of link" />
      <div>
        <FieldLabel>Je klacht</FieldLabel>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          placeholder="Beschrijf wat er gebeurde en wanneer."
          style={{ width: '100%', minHeight: 150, border: '0.5px solid var(--neutral-200)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', padding: '12px 16px', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-strong)', lineHeight: 1.6, resize: 'vertical', outline: 'none' }}
        />
      </div>
      <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: 'var(--font-ui)', fontSize: 13, lineHeight: 1.5, color: 'var(--text-body)', cursor: 'pointer' }}>
        <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} required style={{ marginTop: 3 }} />
        <span>Ik ga akkoord met de verwerking van mijn gegevens volgens de <a href="/privacybeleid" target="_blank" rel="noopener noreferrer" className="bl-textlink">privacyverklaring</a>.</span>
      </label>
      {error ? <div role="alert" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--status-error)', background: 'var(--status-error-bg)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>{error}</div> : null}
      <div>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Versturen…' : 'Verstuur klacht'}
        </Button>
      </div>
    </form>
  )
}
