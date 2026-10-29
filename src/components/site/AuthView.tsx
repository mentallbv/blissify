import React from 'react'
import { Logo } from '@/components/ui/Logo'
import { AuthForm } from './AuthForm'

export function AuthView({
  mode,
  initialRole,
  initialTier,
  initialBilling,
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
  const heading = register ? 'Account aanmaken' : 'Inloggen'
  const subtitle = register
    ? 'Kies de categorie die bij jouw onderneming past: salons & professionals of merken & leveranciers. De betaalde abonnementen zijn bedoeld voor professionele klanten. Bij registratie vragen we jouw ondernemingsgegevens.'
    : 'Log in om jouw profiel en publicaties te beheren.'
  const switchText = register ? 'Heb je al een account?' : 'Nog geen aanbieder?'
  const switchLink = register ? 'Inloggen' : 'Bekijk de abonnementen'
  const switchHref = register ? '/inloggen' : '/abonnementen-tarieven'

  return (
    <div className="bl-auth-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
      {/* Forest brand panel */}
      <div style={{ background: 'var(--surface-dark)', padding: 56, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <a href="/" aria-label="Blissify home">
          <Logo height={36} light />
        </a>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 44, lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--blissify-chalk)', margin: 0, textWrap: 'balance' }}>
            Alles voor jouw groei in beauty &amp; wellness.
          </h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 16, lineHeight: 1.7, color: 'rgba(225, 230, 234,0.7)', margin: '20px 0 0', maxWidth: 380 }}>
            Beheer je profiel, opleidingen, vacatures en werkruimtes vanuit één account en kom rechtstreeks in contact met beauty- en wellnessprofessionals in België en Nederland.
          </p>
        </div>
        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 12, color: 'rgba(225, 230, 234,0.4)' }}>© {new Date().getFullYear()} Blissify · België &amp; Nederland</div>
      </div>

      {/* Form panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 56 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-accent)' }}>Voor aanbieders</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 34, lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: '12px 0 0' }}>
            {heading}
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 14, color: 'var(--text-body)', margin: '8px 0 28px' }}>{subtitle}</p>

          <AuthForm
            mode={mode}
            initialRole={initialRole}
            initialTier={initialTier}
            initialBilling={initialBilling}
            registrationPricing={registrationPricing}
          />

          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 13, color: 'var(--text-body)', marginTop: 24, textAlign: 'center' }}>
            {switchText}{' '}
            <a href={switchHref} style={{ color: 'var(--text-brand)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 }}>
              {switchLink}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
