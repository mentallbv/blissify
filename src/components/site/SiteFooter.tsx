import React from 'react'
import { NewsletterForm } from './NewsletterForm'

const COLS = [
  {
    head: 'Opleidingen',
    items: [
      { label: 'Nagelstyliste', href: '/opleidingen/nagelstyliste' },
      { label: 'Massage', href: '/opleidingen/massage' },
      { label: 'Schoonheid', href: '/opleidingen/schoonheid' },
      { label: 'Yoga', href: '/opleidingen/yoga' },
    ],
  },
  {
    head: 'Ontdekken',
    items: [
      { label: 'Alle opleiders', href: '/opleiders' },
      { label: 'Merken', href: '/merken' },
      { label: 'Publiceer opleiding', href: '/voor-aanbieders' },
    ],
  },
  {
    head: 'Platform',
    items: [
      { label: 'Over ons', href: '/over-ons' },
      { label: 'Voor aanbieders', href: '/voor-aanbieders' },
      { label: 'Prijzen', href: '/prijzen' },
      { label: 'Contact', href: '/contact' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer style={{ background: 'var(--surface-dark)', color: 'var(--blissify-chalk)', borderTop: '0.5px solid rgba(245,240,234,0.15)' }}>
      <div className="bl-container" style={{ paddingTop: 80, paddingBottom: 40 }}>
        <div className="bl-footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48 }}>
          <div style={{ maxWidth: 380 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 22, letterSpacing: '-0.01em' }}>Blissify</div>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontWeight: 'var(--fw-ui-regular)',
                fontSize: 15,
                lineHeight: 1.6,
                color: 'rgba(245,240,234,0.7)',
                margin: '16px 0 0',
              }}
            >
              Jouw praktijk begint hier.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 'var(--fw-display-light)',
                fontSize: 18,
                lineHeight: 1.35,
                color: 'var(--blissify-chalk)',
                margin: '16px 0 0',
              }}
            >
              Nieuwe opleidingen, direct in je inbox.
            </p>
            <div style={{ marginTop: 16 }}>
              <NewsletterForm />
            </div>
          </div>
          {COLS.map((c) => (
            <div key={c.head}>
              <div
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 'var(--fw-ui-medium)',
                  fontSize: 'var(--type-label)',
                  textTransform: 'uppercase',
                  color: 'var(--blissify-terracotta)',
                  marginBottom: 16,
                  letterSpacing: '0.12em',
                }}
              >
                {c.head}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {c.items.map((i) => (
                  <a key={i.label} href={i.href} className="bl-footer-link" style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 14, lineHeight: 2, color: 'rgba(245,240,234,0.65)' }}>
                    {i.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            borderTop: '0.5px solid rgba(245,240,234,0.15)',
            marginTop: 48,
            paddingTop: 24,
            display: 'flex',
            gap: 24,
            alignItems: 'center',
            flexWrap: 'wrap',
            fontFamily: 'var(--font-ui)',
            fontSize: 12,
            color: 'rgba(245,240,234,0.55)',
          }}
        >
          <span>© 2026 Blissify · Professionele wellnessopleiding · België</span>
          <a href="/privacybeleid" className="bl-footer-link" style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'rgba(245,240,234,0.55)' }}>Privacybeleid</a>
          <a href="/cookiebeleid" className="bl-footer-link" style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'rgba(245,240,234,0.55)' }}>Cookiebeleid</a>
        </div>
      </div>
    </footer>
  )
}

/** Forest marquee wordmark band - infinite horizontal scroll. */
export function Marquee() {
  return (
    <div style={{ background: 'var(--surface-dark)', overflow: 'hidden', padding: '36px 0', borderBottom: '0.5px solid rgba(245,240,234,0.12)' }}>
      <div style={{ display: 'flex', width: 'max-content', animation: 'bl-marquee 26s linear infinite' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 'var(--fw-display-light)',
              fontSize: 56,
              letterSpacing: '-0.01em',
              color: 'rgba(245,240,234,0.16)',
              padding: '0 28px',
              whiteSpace: 'nowrap',
            }}
          >
            Blissify <span style={{ color: 'var(--blissify-terracotta)' }}>·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
