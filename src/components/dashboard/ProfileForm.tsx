'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Input, Button, FieldLabel } from '@/components/ui'

export function ProfileForm({
  initial,
}: {
  initial: { name: string; city: string; website: string; email: string; phone: string; about: string }
}) {
  const router = useRouter()
  const [v, setV] = React.useState(initial)
  const [error, setError] = React.useState<string | null>(null)
  const [saved, setSaved] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const set = (k: keyof typeof v, val: string) => setV((s) => ({ ...s, [k]: val }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    setLoading(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(v),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Opslaan mislukt.')
      setSaved(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 640 }}>
      <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 8, padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Input label="Naam opleider" value={v.name} onChange={(e) => set('name', e.target.value)} />
        <Input label="Locatie" value={v.city} onChange={(e) => set('city', e.target.value)} />
        <Input label="Website" value={v.website} onChange={(e) => set('website', e.target.value)} />
        <Input label="E-mail" type="email" value={v.email} onChange={(e) => set('email', e.target.value)} />
        <Input label="Telefoon" value={v.phone} onChange={(e) => set('phone', e.target.value)} />
        <div>
          <FieldLabel>Over de opleider</FieldLabel>
          <textarea
            value={v.about}
            onChange={(e) => set('about', e.target.value)}
            style={{ width: '100%', minHeight: 120, border: '0.5px solid var(--neutral-200)', borderRadius: 6, background: 'var(--surface-card)', padding: '12px 16px', fontFamily: 'var(--font-ui)', fontWeight: 400, fontSize: 14, color: 'var(--text-strong)', lineHeight: 1.6, resize: 'vertical', outline: 'none' }}
          />
        </div>
      </div>

      {error ? (
        <div style={{ marginTop: 16, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--status-error)', background: 'var(--status-error-bg)', borderRadius: 6, padding: '10px 14px' }}>{error}</div>
      ) : null}
      {saved ? (
        <div style={{ marginTop: 16, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--status-success)', background: 'var(--status-success-bg)', borderRadius: 6, padding: '10px 14px' }}>Profiel opgeslagen.</div>
      ) : null}

      <div style={{ marginTop: 20 }}>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Opslaan…' : 'Wijzigingen opslaan'}
        </Button>
      </div>
    </form>
  )
}
