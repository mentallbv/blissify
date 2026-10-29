'use client'

import React from 'react'
import { Button, FieldLabel, Input, Select } from '@/components/ui'
import { ModalShell } from './ModalShell'
import { APPLICANT_STATUS, DAYS } from '@/lib/workspace-options'

/**
 * "Stuur een aanvraag" for a werkruimte (fields like flexsalon.be), grouped
 * so the required part stays short; extras fold out. The request goes by
 * email to the landlord through Blissify; no account needed.
 */
export function WorkspaceApply({ workspaceId, title, label = 'Stuur een aanvraag' }: { workspaceId: number; title: string; label?: string }) {
  const [open, setOpen] = React.useState(false)
  const [more, setMore] = React.useState(false)
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
      setError((data as { error?: string }).error || 'Versturen mislukt. Probeer het opnieuw.')
      setState('idle')
    } else setState('done')
  }

  const ta: React.CSSProperties = { width: '100%', minHeight: 104, border: '0.5px solid var(--neutral-200)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', padding: '12px 14px', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-strong)', lineHeight: 1.6, resize: 'vertical' }

  return (
    <>
      <button type="button" className="bl-apply-btn" onClick={() => setOpen(true)}>{label}</button>
      {open ? (
        <ModalShell title={state === 'done' ? 'Aanvraag verstuurd' : 'Stuur een aanvraag'} subtitle={state === 'done' ? undefined : title} onClose={close} width={560}>
          {state === 'done' ? (
            <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
              <span style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--status-success-bg)', display: 'grid', placeItems: 'center' }}><i className="ti ti-check" style={{ fontSize: 26, color: 'var(--status-success)' }} /></span>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-body)', margin: 0 }}>
                Je aanvraag is doorgestuurd naar de verhuurder, die rechtstreeks contact met je opneemt. Je krijgt ook een bevestiging per e-mail.
              </p>
              <Button variant="primary" onClick={close}>Sluiten</Button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="bl-dialog-group">
                <p className="bl-dialog-group-title">Over jou</p>
                <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Input label="Naam" autoComplete="name" value={f.name} onChange={(e) => set('name', e.target.value)} required />
                  <Input label="E-mailadres" type="email" autoComplete="email" value={f.email} onChange={(e) => set('email', e.target.value)} required />
                </div>
                <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Input label="Welke behandeling bied je aan?" placeholder="bijv. gelnagels" value={f.service} onChange={(e) => set('service', e.target.value)} />
                  <Select label="Statuut" value={f.status} onChange={(e) => set('status', e.target.value)} options={APPLICANT_STATUS} />
                </div>
              </div>

              <div className="bl-dialog-group">
                <p className="bl-dialog-group-title">Je aanvraag</p>
                <div>
                  <FieldLabel>Op welke dagen wil je de ruimte gebruiken?</FieldLabel>
                  <div className="bl-daychips" role="group" aria-label="Gewenste dagen">
                    {DAYS.map((d) => {
                      const on = f.desiredDays.includes(d.value)
                      return (
                        <button key={d.value} type="button" className="bl-daychip" aria-pressed={on} aria-label={d.label} onClick={() => set('desiredDays', on ? f.desiredDays.filter((x) => x !== d.value) : [...f.desiredDays, d.value])}>
                          {d.label.slice(0, 2)}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <FieldLabel>Kort bericht</FieldLabel>
                  <textarea required value={f.message} onChange={(e) => set('message', e.target.value)} style={ta} placeholder="Vertel kort over je werk, je klanten en hoe je de ruimte wilt gebruiken." />
                </div>
              </div>

              <div className="bl-dialog-group">
                <button type="button" onClick={() => setMore((m) => !m)} aria-expanded={more} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', border: 'none', background: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--text-brand)' }}>
                  Meer over jou (optioneel)
                  <i className={`ti ti-chevron-${more ? 'up' : 'down'}`} aria-hidden="true" />
                </button>
                {more ? (
                  <>
                    <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Input label="Telefoon" type="tel" autoComplete="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} />
                      <Input label="Jouw stad" autoComplete="address-level2" value={f.city} onChange={(e) => set('city', e.target.value)} />
                    </div>
                    <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Input label="Budget" placeholder="bijv. €150 per maand" value={f.budget} onChange={(e) => set('budget', e.target.value)} />
                      <Input label="Instagram of portfolio" placeholder="https://instagram.com/..." value={f.portfolio} onChange={(e) => set('portfolio', e.target.value)} />
                    </div>
                  </>
                ) : null}
              </div>

              {/* Honeypot: hidden from people, bots fill it in. */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set('website', e.target.value)} style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} aria-hidden="true" />
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontFamily: 'var(--font-ui)', fontSize: 13, lineHeight: 1.55, color: 'var(--text-strong)', cursor: 'pointer', marginBottom: 16 }}>
                <input type="checkbox" checked={f.consent} onChange={(e) => set('consent', e.target.checked)} style={{ marginTop: 3, accentColor: 'var(--blissify-forest)' }} />
                Ik ga ermee akkoord dat deze aanvraag en mijn contactgegevens naar de verhuurder worden gestuurd.
              </label>
              {error ? <div role="alert" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--status-error)', background: 'var(--status-error-bg)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 14 }}>{error}</div> : null}
              <button type="submit" className="bl-apply-btn" disabled={state === 'sending'}>{state === 'sending' ? 'Versturen…' : 'Aanvraag versturen'}</button>
              <p className="bl-contactbox-note" style={{ marginTop: 12 }}><i className="ti ti-lock" aria-hidden="true" />Geen account nodig. Je gegevens gaan alleen naar de verhuurder.</p>
            </form>
          )}
        </ModalShell>
      ) : null}
    </>
  )
}
