'use client'

import React from 'react'
import { Input, Select, Button, Tag } from '@/components/ui'

const STEPS = [
  { n: 1, label: 'Account' },
  { n: 2, label: 'Profiel' },
  { n: 3, label: 'Opleidingen' },
]

const CATEGORIES = ['Massage', 'Nagelstyliste', 'Schoonheid', 'Yoga', 'Voeding', 'Reflexologie']
const LOCATIONS = ['Antwerpen', 'Gent', 'Brussel', 'Limburg', 'West-Vlaanderen', 'Online']
const SPECS = ['Sportsmassage', 'Deep tissue', 'Klassieke massage', 'Prenataal', 'Cupping']

export default function OnboardingPage() {
  const [current, setCurrent] = React.useState(1)
  const [specs, setSpecs] = React.useState<string[]>(['Sportsmassage', 'Klassieke massage'])
  const toggleSpec = (s: string) => setSpecs((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))

  return (
    <>
      <header style={{ background: 'var(--blissify-chalk)', borderBottom: '0.5px solid var(--border-hairline)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center' }}>
          <a href="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, letterSpacing: '-0.01em', color: 'var(--blissify-forest)' }}>
            Blissify
          </a>
        </div>
      </header>

      <section style={{ maxWidth: 680, margin: '0 auto', padding: '56px 32px 96px' }}>
        {/* Stepper */}
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

        <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 8, padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Input label="Naam organisatie" placeholder="bijv. Academia Van der Berg" />
          <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Select label="Hoofdcategorie" placeholder="Kies een categorie" options={CATEGORIES} />
            <Select label="Locatie" placeholder="Kies een stad" options={LOCATIONS} />
          </div>
          <div>
            <span style={{ display: 'block', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-strong)', marginBottom: 8 }}>
              Specialisaties
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SPECS.map((s) => (
                <Tag key={s} as="button" active={specs.includes(s)} onClick={() => toggleSpec(s)}>
                  {s}
                </Tag>
              ))}
            </div>
          </div>
          <div>
            <span style={{ display: 'block', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-strong)', marginBottom: 8 }}>
              Over de opleider
            </span>
            <textarea
              placeholder="Beschrijf je organisatie, specialisatie en aanpak. Minimaal 80 woorden."
              style={{ width: '100%', minHeight: 120, border: '0.5px solid var(--neutral-200)', borderRadius: 6, background: 'var(--surface-card)', padding: '12px 16px', fontFamily: 'var(--font-ui)', fontWeight: 400, fontSize: 14, color: 'var(--text-strong)', lineHeight: 1.6, resize: 'vertical', outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
          <button
            type="button"
            onClick={() => setCurrent((c) => Math.max(1, c - 1))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 13, color: 'var(--text-body)' }}
          >
            Terug
          </button>
          <Button variant="primary" onClick={() => setCurrent((c) => Math.min(STEPS.length, c + 1))}>
            Volgende stap
          </Button>
        </div>
      </section>
    </>
  )
}
