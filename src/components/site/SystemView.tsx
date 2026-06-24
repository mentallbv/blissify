import React from 'react'
import { ButtonLink } from '@/components/ui'

export function SystemView({ state }: { state: 'betaling-succes' | '404' }) {
  const success = state === 'betaling-succes'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{ background: 'var(--blissify-chalk)', borderBottom: '0.5px solid var(--border-hairline)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center' }}>
          <a href="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, letterSpacing: '-0.01em', color: 'var(--blissify-forest)' }}>
            Blissify
          </a>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 32px' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          {success ? (
            <>
              <span style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--status-success-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
                <i className="ti ti-check" style={{ fontSize: 36, color: 'var(--status-success)' }} />
              </span>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 40, lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: '0 0 12px' }}>
                Betaling geslaagd
              </h1>
              <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', margin: '0 0 28px' }}>
                Je abonnement is actief. Je kunt nu opleidingen toevoegen en aanvragen ontvangen via je dashboard. Een
                bevestiging is naar je e-mailadres verstuurd.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <ButtonLink href="/dashboard" variant="primary">
                  Naar dashboard
                </ButtonLink>
                <ButtonLink href="/dashboard/opleidingen" variant="ghost">
                  Opleiding toevoegen
                </ButtonLink>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 96, lineHeight: 1, letterSpacing: '-0.01em', color: 'var(--blissify-terracotta)', marginBottom: 16 }}>404</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 36, lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: '0 0 12px' }}>
                Pagina niet gevonden
              </h1>
              <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', margin: '0 0 28px' }}>
                De pagina die je zoekt bestaat niet of is verplaatst. Ontdek opleidingen via de zoekfunctie of ga terug
                naar de homepage.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <ButtonLink href="/" variant="primary">
                  Naar homepage
                </ButtonLink>
                <ButtonLink href="/opleidingen" variant="ghost">
                  Zoek opleidingen
                </ButtonLink>
              </div>
            </>
          )}
        </div>
      </main>

      <footer style={{ background: 'var(--surface-dark)', color: 'rgba(245,240,234,0.4)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 32px', fontFamily: 'var(--font-ui)', fontSize: 12 }}>
          © 2026 Blissify · Professionele wellnessopleiding · België
        </div>
      </footer>
    </div>
  )
}
