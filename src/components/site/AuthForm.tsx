'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Input, Button, FieldLabel } from '@/components/ui'

export function AuthForm({
  mode,
  initialRole = 'trainer',
  initialTier,
  initialBilling = 'yearly',
  registrationPricing,
}: {
  mode: 'inloggen' | 'registreren'
  initialRole?: 'trainer' | 'brand'
  initialTier?: string
  initialBilling?: 'yearly' | 'monthly'
  registrationPricing?: {
    trainer: { key: string; name: string; price: string }[]
    brand: { key: string; name: string; price: string }[]
  }
}) {
  const register = mode === 'registreren'
  const router = useRouter()
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [vatNumber, setVatNumber] = React.useState('')
  const [chamberOfCommerceNumber, setChamberOfCommerceNumber] = React.useState('')
  const [billingCountry, setBillingCountry] = React.useState('BE')
  const [professionalBuyerConfirmed, setProfessionalBuyerConfirmed] = React.useState(false)
  const [role, setRole] = React.useState<'trainer' | 'brand'>(initialRole)
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
          body: JSON.stringify({ name, email, password, role, vatNumber, chamberOfCommerceNumber, billingCountry, professionalBuyerConfirmed }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || 'Registratie mislukt.')
        // Welcome + admin notification emails (best-effort, non-blocking).
        fetch('/api/register-aanbieder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, role }),
        }).catch(() => {})
        await login()
        const onboardingParams = new URLSearchParams()
        if (initialTier) onboardingParams.set('tier', initialTier)
        onboardingParams.set('billing', initialBilling)
        router.push(`/onboarding?${onboardingParams.toString()}`)
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
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 'var(--fw-ui-medium)',
                    fontSize: 13,
                    border: '1px solid ' + (on ? 'var(--blissify-forest)' : 'var(--neutral-200)'),
                    background: on ? 'var(--blissify-forest)' : 'var(--surface-card)',
                    color: on ? 'var(--blissify-chalk)' : 'var(--text-body)',
                  }}
                >
                  {r === 'trainer' ? 'Opleider' : 'Merk / Leverancier'}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {register && registrationPricing ? (
        <div style={{ border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-page)', padding: 14 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 12, color: 'var(--text-strong)', marginBottom: 8 }}>
            Abonnementen voor {role === 'trainer' ? 'opleiders' : 'merken en leveranciers'}
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            {registrationPricing[role].map((tier) => (
              <div key={tier.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontFamily: 'var(--font-ui)', fontSize: 12, color: tier.key === initialTier ? 'var(--text-accent)' : 'var(--text-body)' }}>
                <span>{tier.name}</span>
                <span>{tier.price}/jaar</span>
              </div>
            ))}
          </div>
          <a href={role === 'trainer' ? '/prijzen/opleiders' : '/prijzen/merken-leveranciers'} className="bl-textlink" style={{ display: 'inline-block', marginTop: 10, fontSize: 12 }}>
            Bekijk alle details en maandprijzen
          </a>
        </div>
      ) : null}

      {register ? (
        <Input label="Naam organisatie" placeholder="bijv. Academia Van der Berg" value={name} onChange={(e) => setName(e.target.value)} required />
      ) : null}
      {register ? (
        <>
          <Input label="Btw-nummer" placeholder="bijv. BE0123.456.789" value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} />
          <Input label="KvK- of ondernemingsnummer" placeholder="Vul minstens één bedrijfsnummer in" value={chamberOfCommerceNumber} onChange={(e) => setChamberOfCommerceNumber(e.target.value)} />
          <label style={{ display: 'grid', gap: 7, fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-strong)' }}>
            Facturatieland
            <select value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} style={{ height: 44, border: '1px solid var(--neutral-200)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', padding: '0 12px', fontFamily: 'var(--font-ui)' }}>
              <option value="BE">België</option>
              <option value="NL">Nederland</option>
              <option value="EU">Ander EU-land</option>
              <option value="OTHER">Buiten de EU</option>
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontFamily: 'var(--font-ui)', fontSize: 13, lineHeight: 1.5, color: 'var(--text-body)' }}>
            <input type="checkbox" checked={professionalBuyerConfirmed} onChange={(e) => setProfessionalBuyerConfirmed(e.target.checked)} required style={{ marginTop: 3 }} />
            <span>Ik handel in het kader van mijn beroeps- of bedrijfsactiviteit.</span>
          </label>
          <p style={{ margin: '-6px 0 0', fontFamily: 'var(--font-ui)', fontSize: 11, lineHeight: 1.5, color: 'var(--text-meta)' }}>Een btw-nummer en/of KvK- of ondernemingsnummer is verplicht. Alle abonnementsprijzen zijn exclusief btw.</p>
        </>
      ) : null}
      <Input label="E-mailadres" type="email" placeholder="jouw@email.be" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input label="Wachtwoord" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />

      {error ? (
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--status-error)', background: 'var(--status-error-bg)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
          {error}
        </div>
      ) : null}

      <Button variant="primary" fullWidth type="submit" disabled={loading}>
        {loading ? (register ? 'Account aanmaken…' : 'Inloggen…') : register ? 'Account aanmaken' : 'Inloggen'}
      </Button>
    </form>
  )
}
