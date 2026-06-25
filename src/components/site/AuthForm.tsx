'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Input, Button, FieldLabel } from '@/components/ui'

export function AuthForm({ mode }: { mode: 'inloggen' | 'registreren' }) {
  const register = mode === 'registreren'
  const router = useRouter()
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [role, setRole] = React.useState<'trainer' | 'brand'>('trainer')
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function login(): Promise<{ role?: string } | null> {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.errors?.[0]?.message || 'E-mailadres of wachtwoord is onjuist.')
    }
    const data = await res.json()
    return data?.user || null
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (register) {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || 'Registratie mislukt.')
        await login()
        router.push('/onboarding')
        router.refresh()
        return
      }
      const user = await login()
      const target = user?.role === 'admin' ? '/admin' : '/dashboard'
      router.push(target)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis. Probeer het opnieuw.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {register ? (
        <div>
          <FieldLabel>Ik ben een</FieldLabel>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['trainer', 'brand'] as const).map((r) => {
              const on = role === r
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 'var(--fw-ui-medium)',
                    fontSize: 13,
                    border: '1px solid ' + (on ? 'var(--blissify-forest)' : 'var(--neutral-200)'),
                    background: on ? 'var(--blissify-forest)' : 'var(--surface-card)',
                    color: on ? 'var(--blissify-chalk)' : 'var(--text-body)',
                  }}
                >
                  {r === 'trainer' ? 'Trainer' : 'Merk / academie'}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {register ? (
        <Input label="Naam organisatie" placeholder="bijv. Academia Van der Berg" value={name} onChange={(e) => setName(e.target.value)} required />
      ) : null}
      <Input label="E-mailadres" type="email" placeholder="jouw@email.be" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input label="Wachtwoord" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />

      {error ? (
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--status-error)', background: 'var(--status-error-bg)', borderRadius: 6, padding: '10px 14px' }}>
          {error}
        </div>
      ) : null}

      <Button variant="primary" fullWidth type="submit" disabled={loading}>
        {loading ? (register ? 'Account aanmaken…' : 'Inloggen…') : register ? 'Account aanmaken' : 'Inloggen'}
      </Button>
    </form>
  )
}
