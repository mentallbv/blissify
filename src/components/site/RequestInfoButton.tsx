'use client'

import React from 'react'
import { Input, Button, FieldLabel } from '@/components/ui'

export function RequestInfoButton({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [done, setDone] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, payload_course_id: courseId }),
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

  return (
    <>
      <Button variant="primary" fullWidth onClick={() => setOpen(true)}>
        Vraag informatie aan
      </Button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(26,46,37,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 8, padding: 28 }}>
            {done ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--status-success-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <i className="ti ti-check" style={{ fontSize: 28, color: 'var(--status-success)' }} />
                </span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--text-brand)', margin: '0 0 8px' }}>Aanvraag verstuurd</h3>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.7, color: 'var(--text-body)', margin: '0 0 20px' }}>
                  De opleider neemt rechtstreeks contact met je op.
                </p>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Sluiten
                </Button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--text-brand)', margin: '0 0 4px' }}>Vraag informatie aan</h3>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)', margin: '0 0 20px' }}>{courseTitle}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Input label="Naam" value={name} onChange={(e) => setName(e.target.value)} required />
                  <Input label="E-mailadres" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <div>
                    <FieldLabel>Bericht (optioneel)</FieldLabel>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      style={{ width: '100%', minHeight: 90, border: '0.5px solid var(--neutral-200)', borderRadius: 6, background: 'var(--surface-card)', padding: '12px 16px', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-strong)', lineHeight: 1.6, resize: 'vertical', outline: 'none' }}
                    />
                  </div>
                  {error ? <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--status-error)', background: 'var(--status-error-bg)', borderRadius: 6, padding: '10px 14px' }}>{error}</div> : null}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button variant="primary" type="submit" fullWidth disabled={loading}>
                      {loading ? 'Versturen…' : 'Verstuur aanvraag'}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
