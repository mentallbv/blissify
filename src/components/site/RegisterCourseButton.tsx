'use client'

import React from 'react'
import { Input, Button, FieldLabel } from '@/components/ui'

/**
 * In-platform registration (Brand courses on Partner Professional/Premium).
 * Signup only - naam, email, telefoon, aantal deelnemers + required GDPR consent.
 * Posts to /api/registrations; the server enforces that the course is bookable.
 */
export function RegisterCourseButton({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [participantCount, setParticipantCount] = React.useState('1')
  const [consent, setConsent] = React.useState(false)
  const [done, setDone] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!consent) {
      setError('Bevestig dat je akkoord gaat met de privacyverklaring.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, participantCount: Number(participantCount), consent, courseId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Inschrijven mislukt.')
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
        Schrijf je in
      </Button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(26,46,37,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-lg)', padding: 28 }}>
            {done ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--status-success-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <i className="ti ti-check" style={{ fontSize: 28, color: 'var(--status-success)' }} />
                </span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--text-brand)', margin: '0 0 8px' }}>Inschrijving verstuurd</h3>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.7, color: 'var(--text-body)', margin: '0 0 20px' }}>
                  De aanbieder neemt rechtstreeks contact met je op.
                </p>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Sluiten
                </Button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--text-brand)', margin: '0 0 4px' }}>Schrijf je in</h3>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)', margin: '0 0 20px' }}>{courseTitle}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Input label="Naam" value={name} onChange={(e) => setName(e.target.value)} required />
                  <Input label="E-mailadres" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <Input label="Telefoon" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  <Input
                    label="Aantal deelnemers"
                    type="number"
                    min={1}
                    value={participantCount}
                    onChange={(e) => setParticipantCount(e.target.value)}
                    required
                  />
                  <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: 'var(--font-ui)', fontSize: 13, lineHeight: 1.5, color: 'var(--text-body)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      required
                      style={{ marginTop: 3, accentColor: 'var(--blissify-forest)', flex: 'none' }}
                    />
                    <span>
                      Ik ga akkoord met de verwerking van mijn gegevens volgens de{' '}
                      <a href="/privacybeleid" target="_blank" rel="noopener noreferrer" className="bl-textlink">privacyverklaring</a>.
                    </span>
                  </label>
                  {error ? <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--status-error)', background: 'var(--status-error-bg)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>{error}</div> : null}
                  <Button variant="primary" type="submit" fullWidth disabled={loading}>
                    {loading ? 'Versturen...' : 'Verstuur inschrijving'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
