'use client'

import React from 'react'

type Remaining = Record<string, number>

export function MediaPopulator() {
  const [remaining, setRemaining] = React.useState<Remaining | null>(null)
  const [message, setMessage] = React.useState('Status ophalen…')
  const [busy, setBusy] = React.useState(false)

  const loadStatus = React.useCallback(async () => {
    const response = await fetch('/api/admin/populate-media')
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Status ophalen mislukt.')
    setRemaining(data.remaining)
    setMessage('Klaar voor de volgende batch.')
  }, [])

  React.useEffect(() => { loadStatus().catch((error) => setMessage(error.message)) }, [loadStatus])

  async function populate() {
    setBusy(true)
    setMessage('Drie lege afbeeldingsvelden aanvullen…')
    const response = await fetch('/api/admin/populate-media', { method: 'POST' })
    const data = await response.json().catch(() => ({}))
    setBusy(false)
    if (!response.ok) {
      setMessage(data.error || 'Batch mislukt.')
      return
    }
    setRemaining(data.remaining)
    setMessage(data.populated?.length ? `Aangevuld: ${data.populated.join(', ')}` : 'Alles is al ingevuld.')
  }

  const total = remaining ? Object.values(remaining).reduce((sum, value) => sum + value, 0) : null
  return (
    <div style={{ maxWidth: 760, margin: '80px auto', padding: 32, fontFamily: 'system-ui', lineHeight: 1.5 }}>
      <h1>Productie-afbeeldingen aanvullen</h1>
      <p>Deze tijdelijke admin-tool vult uitsluitend lege afbeeldingsvelden. Bestaande afbeeldingen worden niet vervangen.</p>
      {remaining ? (
        <ul>
          {Object.entries(remaining).map(([name, count]) => <li key={name}>{name}: {count}</li>)}
        </ul>
      ) : null}
      <p><strong>Nog te vullen: {total ?? '…'}</strong></p>
      <button type="button" onClick={populate} disabled={busy || total === 0} style={{ padding: '12px 18px', border: 0, borderRadius: 8, background: '#1a2e25', color: '#fff', cursor: busy ? 'wait' : 'pointer' }}>
        {busy ? 'Bezig…' : 'Volgende batch van 3 uitvoeren'}
      </button>
      <p>{message}</p>
    </div>
  )
}
