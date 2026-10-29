'use client'

import React from 'react'
import { Button, FieldLabel, Input, Select } from '@/components/ui'
import { ModalShell } from './ModalShell'
import { APPLICANT_STATUS, DAYS } from '@/lib/workspace-options'

/**
 * "Stuur een aanvraag" for a werkruimte (fields like flexsalon.be). The
 * request goes by email to the landlord through Blissify; no account needed.
 */
export function WorkspaceApply({ workspaceId, title, label = 'Stuur een aanvraag' }: { workspaceId: number; title: string; label?: string }) {
  const [open, setOpen] = React.useState(false)
  const [f, setF] = React.useState({ name: '', email: '', message: '', service: '', desiredDays: [] as string[], phone: '', city: '', status: 'onbekend', budget: '', portfolio: '', consent: false, website: '' })
  const [state, setState] = React.useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = React.useState('')
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }))
  const close = React.useCallback(() => setOpen(false), [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!f.consent) return setError('Geef toestemming om je aanvraag door te sturen naar de verhuurder.')
    setState('sending')
    const res = await fetch('/api/workspace-applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, workspaceId }) }).catch(() => null)
    const data = res ? await res.json().catch(() => ({})) : {}
    if (!res?.ok) {
      setError((data as { error?: string }).error || 'Versturen mislukt.')
      setState('idle')
    } else setState('done')
  }

  const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '14px 20px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--blissify-terracotta)', color: '#fff', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 15, cursor: 'pointer' }
  const ta: React.CSSProperties = { width: '100%', minHeight: 96, border: '0.5px solid var(--neutral-200)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', padding: '12px 16px', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-strong)', lineHeight: 1.6, resize: 'vertical' }

  return (
    <>
      <button type="button" style={btn} onClick={() => setOpen(true)}>{label}</button>
      {open ? (
        <ModalShell title={state === 'done' ? 'Aanvraag verstuurd' : `Aanvraag voor ${title}`} onClose={close}>
          {state === 'done' ? (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-body)', margin: 0 }}>
              Je aanvraag is doorgestuurd naar de verhuurder. Die neemt rechtstreeks contact met je op. Je ontvangt ook een bevestiging per e-mail.
            </p>
          ) : (
            <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, lineHeight: 1.6, color: 'var(--text-meta)', margin: 0 }}>Je gegevens gaan alleen naar de verhuurder. Je hebt geen account nodig.</p>
              <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input label="Naam" value={f.name} onChange={(e) => set('name', e.target.value)} required />
                <Input label="E-mailadres" type="email" value={f.email} onChange={(e) => set('email', e.target.value)} required />
              </div>
              <div>
                <FieldLabel>Kort bericht</FieldLabel>
                <textarea required value={f.message} onChange={(e) => set('message', e.target.value)} style={ta} placeholder="Vertel kort over je werk en op welke dagen je de ruimte wilt gebruiken." />
              </div>
              <Input label="Welke behandeling bied je aan?" value={f.service} onChange={(e) => set('service', e.target.value)} />
              <div>
                <FieldLabel>Gewenste dagen</FieldLabel>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
                  {DAYS.map((d) => (
                    <label key={d.value} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-body)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={f.desiredDays.includes(d.value)} onChange={() => set('desiredDays', f.desiredDays.includes(d.value) ? f.desiredDays.filter((x) => x !== d.value) : [...f.desiredDays, d.value])} style={{ accentColor: 'var(--blissify-forest)' }} />
                      {d.label.slice(0, 2)}
                    </label>
                  ))}
                </div>
              </div>
              <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input label="Telefoon (optioneel)" value={f.phone} onChange={(e) => set('phone', e.target.value)} />
                <Input label="Jouw stad" value={f.city} onChange={(e) => set('city', e.target.value)} />
              </div>
              <Select label="Statuut" value={f.status} onChange={(e) => set('status', e.target.value)} options={APPLICANT_STATUS} />
              <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input label="Budget (optioneel)" placeholder="bijv. €150 per maand" value={f.budget} onChange={(e) => set('budget', e.target.value)} />
                <Input label="Instagram of portfolio (optioneel)" placeholder="https://instagram.com/..." value={f.portfolio} onChange={(e) => set('portfolio', e.target.value)} />
              </div>
              {/* Honeypot: hidden from people, bots fill it in. */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set('website', e.target.value)} style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} aria-hidden="true" />
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontFamily: 'var(--font-ui)', fontSize: 13, lineHeight: 1.5, color: 'var(--text-body)', cursor: 'pointer' }}>
                <input type="checkbox" checked={f.consent} onChange={(e) => set('consent', e.target.checked)} style={{ marginTop: 3, accentColor: 'var(--blissify-forest)' }} />
                Ik ga ermee akkoord dat deze aanvraag en mijn contactgegevens naar de verhuurder worden gestuurd.
              </label>
              {error ? <div role="alert" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--status-error)', background: 'var(--status-error-bg)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>{error}</div> : null}
              <Button variant="primary" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Versturen…' : 'Aanvraag versturen'}</Button>
            </form>
          )}
        </ModalShell>
      ) : null}
    </>
  )
}
