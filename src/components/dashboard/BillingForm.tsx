'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, FieldLabel } from '@/components/ui'

export type BillingValues = {
  billingCompanyName: string
  billingStreet: string
  billingPostalCode: string
  billingCity: string
  billingCountry: string
  vatNumber: string
  chamberOfCommerceNumber: string
}

/** Facturatiegegevens on the Abonnement page. Saved via PATCH /api/billing (VIES check). */
export function BillingForm({ initial, vatVerified }: { initial: BillingValues; vatVerified: boolean }) {
  const router = useRouter()
  const [v, setV] = React.useState(initial)
  const [state, setState] = React.useState<'idle' | 'saving' | 'saved'>('idle')
  const [error, setError] = React.useState('')
  const [note, setNote] = React.useState('')
  const set = (k: keyof BillingValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setV((s) => ({ ...s, [k]: e.target.value }))
    setState('idle')
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setState('saving')
    setError('')
    setNote('')
    const res = await fetch('/api/billing', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(v) }).catch(() => null)
    const data = await res?.json().catch(() => ({}))
    if (!res?.ok) {
      setError(data?.error || 'Opslaan is niet gelukt.')
      setState('idle')
      return
    }
    if (data?.viesUnavailable) setNote('De Europese btw-controle (VIES) is even niet bereikbaar. We controleren je btw-nummer opnieuw bij de betaling.')
    setState('saved')
    router.refresh()
  }

  const selectStyle: React.CSSProperties = { width: '100%', height: 44, border: '0.5px solid var(--neutral-200)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', padding: '0 12px', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-strong)' }

  return (
    <form onSubmit={save} style={{ display: 'grid', gap: 14 }}>
      <Input label="Bedrijfsnaam" value={v.billingCompanyName} onChange={set('billingCompanyName')} required autoComplete="organization" />
      <Input label="Straat en nummer" value={v.billingStreet} onChange={set('billingStreet')} required autoComplete="street-address" />
      <div className="bl-billing-row">
        <Input label="Postcode" value={v.billingPostalCode} onChange={set('billingPostalCode')} required autoComplete="postal-code" />
        <Input label="Gemeente" value={v.billingCity} onChange={set('billingCity')} required autoComplete="address-level2" />
      </div>
      <div>
        <FieldLabel>Land</FieldLabel>
        <select value={v.billingCountry} onChange={set('billingCountry')} style={selectStyle}>
          <option value="BE">België</option>
          <option value="NL">Nederland</option>
          <option value="EU">Ander EU-land</option>
        </select>
      </div>
      <div className="bl-billing-row">
        <Input label="Btw-nummer" placeholder={v.billingCountry === 'NL' ? 'bijv. NL123456789B01' : 'bijv. BE0123456789'} value={v.vatNumber} onChange={set('vatNumber')} />
        <Input label="KvK- of ondernemingsnummer" value={v.chamberOfCommerceNumber} onChange={set('chamberOfCommerceNumber')} />
      </div>
      {vatVerified && v.vatNumber === initial.vatNumber && v.vatNumber ? (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--status-success)', margin: 0 }}><i className="ti ti-circle-check" aria-hidden="true" /> Btw-nummer gecontroleerd</p>
      ) : null}
      {error ? <div role="alert" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--status-error)', background: 'var(--status-error-bg)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>{error}</div> : null}
      {note ? <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, lineHeight: 1.5, color: 'var(--text-meta)', margin: 0 }}>{note}</p> : null}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button variant="primary" type="submit" size="sm" disabled={state === 'saving'}>{state === 'saving' ? 'Opslaan…' : 'Gegevens opslaan'}</Button>
        {state === 'saved' ? <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--status-success)' }}>Opgeslagen</span> : null}
      </div>
    </form>
  )
}
