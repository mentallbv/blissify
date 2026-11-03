import React from 'react'
import { ButtonLink } from '@/components/ui'

/** Closing call to action: a soft lilac/sand panel above the footer (homepage, pricing, Over Blissify). */
export function CtaPanel({ title, accent, body, href, label }: { title: string; accent?: string; body: React.ReactNode; href: string; label: string }) {
  return (
    <section style={{ paddingTop: 24, paddingBottom: 96 }}>
      <div className="bl-container">
        <div className="bl-soft-panel" data-reveal style={{ padding: 'clamp(48px, 7vw, 96px) 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 'clamp(36px, 5vw, 60px)', lineHeight: 1.08, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: 0, textWrap: 'balance' }}>
              {title}{accent ? <>{' '}<span className="bl-hero-accent">{accent}</span></> : null}
            </h2>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 17, lineHeight: 1.7, color: 'var(--text-strong)', margin: '14px 0 0' }}>{body}</p>
            <div style={{ marginTop: 30 }}><ButtonLink href={href} variant="primary">{label}</ButtonLink></div>
          </div>
        </div>
      </div>
    </section>
  )
}
