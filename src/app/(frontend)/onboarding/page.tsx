'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Input, Select, Button, Tag } from '@/components/ui'

const STEPS = [
  { n: 1, label: 'Account' },
  { n: 2, label: 'Profiel' },
  { n: 3, label: 'Opleidingen' },
]

const CATEGORIES = ['Massage', 'Nagelstyliste', 'Schoonheid', 'Yoga', 'Voeding', 'Reflexologie']
const LOCATIONS = ['Antwerpen', 'Gent', 'Brussel', 'Limburg', 'West-Vlaanderen', 'Online']
const SPECS: { value: string; label: string }[] = [
  { value: 'massage', label: 'Massage' },
  { value: 'nagelstyliste', label: 'Nagelstyliste' },
  { value: 'schoonheid', label: 'Schoonheid' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'voeding', label: 'Voeding' },
  { value: 'reiki', label: 'Reiki' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [current, setCurrent] = React.useState(2)
  const [name, setName] = React.useState('')
  const [city, setCity] = React.useState('')
  const [about, setAbout] = React.useState('')
  const [specs, setSpecs] = React.useState<string[]>(['massage'])
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const toggleSpec = (s: string) => setSpecs((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))

  async function saveAndContinue() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, city, about, specializations: specs }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Opslaan mislukt.')
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis.')
      setLoading(false)
    }
  }

  return (
    <>
      <header style={{ background: 'var(--blissify-chalk)', borderBottom: '0.5px solid var(--border-hairline)' }}>
        <div className="bl-container" style={{ height: 68, display: 'flex', alignItems: 'center' }}>
          <a href="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, letterSpacing: '-0.01em', color: 'var(--blissify-forest)' }}>
            Blissify
          </a>
        </div>
      </header>

      <section className="bl-container" style={{ paddingTop: 56, paddingBottom: 96 }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40 }}>
          {STEPS.map((s) => {
            const done = s.n < current
            const isCurrent = s.n === current
            return (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 'none',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 'var(--fw-ui-medium)',
                    fontSize: 13,
                    background: done ? 'var(--blissify-forest)' : isCurrent ? 'var(--blissify-terracotta)' : 'transparent',
                    border: !done && !isCurrent ? '0.5px solid var(--neutral-200)' : 'none',
                    color: done || isCurrent ? '#fff' : 'var(--text-meta)',
                  }}
                >
                  {done ? <i className="ti ti-check" style={{ fontSize: 15 }} /> : s.n}
                </span>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 13, color: 'var(--text-strong)' }}>{s.label}</span>
              </div>
            )
          })}
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 34, lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: '0 0 8px' }}>
          Vul je opleiderprofiel aan
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-body)', margin: '0 0 32px' }}>
          Deze gegevens verschijnen op je publieke profiel. Je kunt ze later altijd aanpassen.
        </p>

        <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Input label="Naam organisatie" placeholder="bijv. Academia Van der Berg" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Select label="Hoofdcategorie" placeholder="Kies een categorie" options={CATEGORIES} />
            <Select label="Locatie" placeholder="Kies een stad" options={LOCATIONS} value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <span style={{ display: 'block', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-strong)', marginBottom: 8 }}>
              Specialisaties
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SPECS.map((s) => (
                <Tag key={s.value} as="button" active={specs.includes(s.value)} onClick={() => toggleSpec(s.value)}>
                  {s.label}
                </Tag>
              ))}
            </div>
          </div>
          <div>
            <span style={{ display: 'block', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-strong)', marginBottom: 8 }}>
              Over de opleider
            </span>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Beschrijf je organisatie, specialisatie en aanpak. Minimaal 80 woorden."
              style={{ width: '100%', minHeight: 120, border: '0.5px solid var(--neutral-200)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', padding: '12px 16px', fontFamily: 'var(--font-ui)', fontWeight: 400, fontSize: 14, color: 'var(--text-strong)', lineHeight: 1.6, resize: 'vertical', outline: 'none' }}
            />
          </div>
        </div>

        {error ? (
          <div style={{ marginTop: 16, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--status-error)', background: 'var(--status-error-bg)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
            {error}
          </div>
        ) : null}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
          <button
            type="button"
            onClick={() => setCurrent((c) => Math.max(1, c - 1))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 13, color: 'var(--text-body)' }}
          >
            Terug
          </button>
          <Button variant="primary" onClick={saveAndContinue} disabled={loading}>
            {loading ? 'Opslaan…' : 'Profiel opslaan'}
          </Button>
        </div>
        </div>
      </section>
    </>
  )
}
