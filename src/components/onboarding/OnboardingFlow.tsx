'use client'

import React from 'react'
import { Input, Select, Button, Tag } from '@/components/ui'
import { PricingCard, type PricingCardTier } from '@/components/site/PricingCard'
import { FormErrorCard } from '@/components/site/FormErrorCard'
import { PaymentMethodPicker, usePaymentMethods } from '@/components/dashboard/PaymentMethodPicker'

const STEPS = [
  { n: 1, label: 'Account' },
  { n: 2, label: 'Profiel' },
  { n: 3, label: 'Abonnement' },
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

export type OnboardingTier = PricingCardTier & { key: string }

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 'var(--fw-display-light)',
  fontSize: 40,
  lineHeight: 1.1,
  letterSpacing: '-0.01em',
  color: 'var(--text-brand)',
  margin: '0 0 12px',
}
const subheadStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontWeight: 'var(--fw-ui-regular)',
  fontSize: 16,
  lineHeight: 1.7,
  color: 'var(--text-body)',
  margin: '0 0 40px',
  maxWidth: 560,
}
const fieldLabelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-ui)',
  fontWeight: 'var(--fw-ui-medium)',
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--text-strong)',
  marginBottom: 8,
}

/** Post-registration onboarding: profile completion, then subscription selection. */
export function OnboardingFlow({
  tiers,
  role,
  initialTier,
  billingCycle,
}: {
  tiers: OnboardingTier[]
  role: 'trainer' | 'brand'
  initialTier?: string
  billingCycle: 'yearly' | 'monthly'
}) {
  const [phase, setPhase] = React.useState<'profile' | 'tier'>('profile')
  const [current, setCurrent] = React.useState(2)
  const [name, setName] = React.useState('')
  const [city, setCity] = React.useState('')
  const [about, setAbout] = React.useState('')
  const [specs, setSpecs] = React.useState<string[]>(['massage'])
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const lastTier = React.useRef<OnboardingTier['key'] | null>(null)
  // Picking a tier loads its payment methods; the user only sees a choice when
  // more than one is available, otherwise checkout starts straight away.
  const [chosenTier, setChosenTier] = React.useState<OnboardingTier['key'] | null>(null)
  const [method, setMethod] = React.useState<string | null>(null)
  const methods = usePaymentMethods(chosenTier || '', billingCycle, Boolean(chosenTier))
  const choosing = Boolean(chosenTier) && methods !== null && methods.length > 1
  const autoStarted = React.useRef(false)
  const toggleSpec = (s: string) => setSpecs((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))

  async function saveAndContinue() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          city,
          about,
          ...(role === 'brand' ? { tags: specs } : { specializations: specs }),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Opslaan mislukt.')
      // Profile saved. Advance to subscription selection (payment gates publishing).
      setCurrent(3)
      setPhase('tier')
      setLoading(false)
    } catch (err) {
      console.error('[onboarding] profile save failed', err)
      setError('We konden je profiel niet opslaan. Controleer je gegevens en probeer het opnieuw.')
      setLoading(false)
    }
  }

  async function startCheckout(tier: OnboardingTier['key'], chosenMethod: string | null = null) {
    lastTier.current = tier
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/subscription/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tier, billingCycle, method: chosenMethod }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.checkoutUrl) throw new Error(data?.error || 'checkout_failed')
      window.location.href = data.checkoutUrl
    } catch (err) {
      console.error('[onboarding] checkout start failed', err)
      setError(
        err instanceof Error && err.message && err.message !== 'checkout_failed'
          ? err.message
          : 'Er ging iets mis bij het starten van de betaling. Probeer het opnieuw of neem contact op als het probleem aanhoudt.',
      )
      setChosenTier(null)
      autoStarted.current = false
      setLoading(false)
    }
  }

  // Only one method available -> skip the picker entirely.
  React.useEffect(() => {
    if (!chosenTier || methods === null || methods.length > 1 || autoStarted.current) return
    autoStarted.current = true
    void startCheckout(chosenTier)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenTier, methods])

  return (
    <>
      <header style={{ background: 'var(--blissify-chalk)', borderBottom: '0.5px solid var(--border-hairline)' }}>
        <div className="bl-container" style={{ height: 68, display: 'flex', alignItems: 'center' }}>
          <a href="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, letterSpacing: '-0.01em', color: 'var(--blissify-forest)' }}>
            Blissify
          </a>
        </div>
      </header>

      <section className="bl-container" style={{ paddingTop: 72, paddingBottom: 96 }}>
        <div style={{ maxWidth: phase === 'tier' ? 1100 : 680, margin: '0 auto' }}>
          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 48 }}>
            {STEPS.map((s, i) => {
              const done = s.n < current
              const active = s.n === current
              return (
                <React.Fragment key={s.n}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 'none' }}>
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 'none',
                        fontFamily: 'var(--font-ui)',
                        fontWeight: 'var(--fw-ui-medium)',
                        fontSize: 14,
                        background: done ? 'var(--blissify-forest)' : active ? 'var(--blissify-terracotta)' : 'transparent',
                        border: !done && !active ? '0.5px solid var(--border-hairline)' : 'none',
                        color: done || active ? '#fff' : 'var(--text-meta)',
                      }}
                    >
                      {done ? <i className="ti ti-check" style={{ fontSize: 16 }} /> : s.n}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontWeight: active ? 'var(--fw-ui-medium)' : 'var(--fw-ui-regular)',
                        fontSize: 14,
                        color: done || active ? 'var(--text-strong)' : 'var(--text-meta)',
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 ? (
                    <span style={{ flex: 1, height: 1, background: done ? 'var(--blissify-forest)' : 'var(--border-hairline)', margin: '0 16px' }} />
                  ) : null}
                </React.Fragment>
              )
            })}
          </div>

          {phase === 'profile' ? (
            <>
              <h1 style={headingStyle}>Vul je {role === 'brand' ? 'merk- of leveranciersprofiel' : 'opleiderprofiel'} aan</h1>
              <p style={subheadStyle}>Deze gegevens verschijnen op je publieke profiel. Je kunt ze later altijd aanpassen.</p>

              <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Input label="Naam organisatie" placeholder="bijv. Academia Van der Berg" value={name} onChange={(e) => setName(e.target.value)} />
                <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Select label="Hoofdcategorie" placeholder="Kies een categorie" options={CATEGORIES} />
                  <Select label="Locatie" placeholder="Kies een stad" options={LOCATIONS} value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div>
                  <span style={fieldLabelStyle}>{role === 'brand' ? 'Categorieën en trefwoorden' : 'Specialisaties'}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {SPECS.map((s) => (
                      <Tag key={s.value} as="button" active={specs.includes(s.value)} onClick={() => toggleSpec(s.value)}>
                        {s.label}
                      </Tag>
                    ))}
                  </div>
                </div>
                <div>
                  <span style={fieldLabelStyle}>Over {role === 'brand' ? 'het merk of de leverancier' : 'de opleider'}</span>
                  <textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Beschrijf je organisatie, specialisatie en aanpak. Minimaal 80 woorden."
                    style={{ width: '100%', minHeight: 120, border: '0.5px solid var(--neutral-200)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', padding: '12px 16px', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 14, color: 'var(--text-strong)', lineHeight: 1.6, resize: 'vertical', outline: 'none' }}
                  />
                </div>
              </div>

              {error ? (
                <div style={{ marginTop: 20 }}>
                  <FormErrorCard message={error} />
                </div>
              ) : null}

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 24 }}>
                <Button variant="primary" onClick={saveAndContinue} disabled={loading}>
                  {loading ? 'Opslaan...' : 'Profiel opslaan'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 style={headingStyle}>Kies je abonnement</h1>
              <p style={subheadStyle}>
                Kies een formule om je profiel te activeren. Je wordt doorgestuurd naar onze betaalpartner Mollie.
                Je betaalt {billingCycle === 'monthly' ? 'maandelijks vooraf en kunt per maand opzeggen' : 'het volledige jaar vooraf'}; publiceren kan zodra je betaling is bevestigd.
                Alle prijzen zijn exclusief btw. Het abonnement wordt automatisch verlengd totdat je de verlenging stopzet; reeds betaalde periodes worden niet terugbetaald.
              </p>

              <div className="bl-cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'start' }}>
                {tiers.map((t) => (
                  <PricingCard
                    key={t.key}
                    tier={{ ...t, recommended: t.key === initialTier || t.recommended }}
                    cta={
                      <Button
                        variant={t.recommended ? 'accent' : 'primary'}
                        fullWidth
                        onClick={() => {
                          setMethod(null)
                          autoStarted.current = false
                          setChosenTier(t.key)
                        }}
                        disabled={loading || Boolean(chosenTier)}
                      >
                        {chosenTier === t.key ? 'Gekozen' : loading ? 'Bezig...' : `Kies ${t.name}`}
                      </Button>
                    }
                  />
                ))}
              </div>

              {choosing ? (
                <div style={{ marginTop: 32, maxWidth: 520 }}>
                  <PaymentMethodPicker methods={methods} value={method} onChange={setMethod} />
                  <Button
                    variant="accent"
                    onClick={() => startCheckout(chosenTier as OnboardingTier['key'], method)}
                    disabled={loading || !method}
                  >
                    {loading ? 'Bezig...' : 'Doorgaan naar betaling'}
                  </Button>
                </div>
              ) : null}

              {error ? (
                <div style={{ marginTop: 32 }}>
                  <FormErrorCard message={error} onRetry={lastTier.current ? () => startCheckout(lastTier.current as OnboardingTier['key'], method) : undefined} />
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </>
  )
}
