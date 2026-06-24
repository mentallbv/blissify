import React from 'react'
import { Input, Button } from '@/components/ui'

export function AuthView({ mode }: { mode: 'inloggen' | 'registreren' }) {
  const register = mode === 'registreren'
  const heading = register ? 'Account aanmaken' : 'Inloggen'
  const subtitle = register
    ? 'Start met het publiceren van jouw opleidingen op Blissify.'
    : 'Welkom terug. Beheer je opleidingen en aanvragen.'
  const cta = register ? 'Account aanmaken' : 'Inloggen'
  const switchText = register ? 'Heb je al een account?' : 'Nog geen account?'
  const switchLink = register ? 'Inloggen' : 'Account aanmaken'
  const switchHref = register ? '/inloggen' : '/registreren'

  return (
    <div className="bl-auth-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
      {/* Forest brand panel */}
      <div style={{ background: 'var(--surface-dark)', padding: 56, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 26, letterSpacing: '-0.01em', color: 'var(--blissify-chalk)' }}>
          Blissify
        </a>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 44, lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--blissify-chalk)', margin: 0, textWrap: 'balance' }}>
            Jouw praktijk begint hier.
          </h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 16, lineHeight: 1.7, color: 'rgba(245,240,234,0.7)', margin: '20px 0 0', maxWidth: 380 }}>
            Beheer je opleidingen, ontvang directe leads en bereik duizenden professionals via het Blissify-dashboard.
          </p>
        </div>
        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 12, color: 'rgba(245,240,234,0.4)' }}>© 2026 Blissify · België</div>
      </div>

      {/* Form panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 56 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-accent)' }}>Voor aanbieders</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 34, lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: '12px 0 0' }}>
            {heading}
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 14, color: 'var(--text-body)', margin: '8px 0 28px' }}>{subtitle}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {register ? <Input label="Naam organisatie" placeholder="bijv. Academia Van der Berg" /> : null}
            <Input label="E-mailadres" type="email" placeholder="jouw@email.be" />
            <Input label="Wachtwoord" type="password" placeholder="••••••••" />
            <Button variant="primary" fullWidth>
              {cta}
            </Button>
          </div>

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
