import React from 'react'

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
    head: 'Blissify',
    items: [
      { label: 'Over ons', href: '/over-ons' },
      { label: 'Voor aanbieders', href: '/voor-aanbieders' },
      { label: 'Prijzen', href: '/prijzen' },
      { label: 'Contact', href: '/over-ons' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer style={{ background: 'var(--surface-dark)', color: 'var(--blissify-chalk)', borderTop: '0.5px solid rgba(245,240,234,0.15)' }}>
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '64px 32px 32px' }}>
        <div className="bl-footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', gap: 32 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 28, letterSpacing: '-0.01em' }}>Blissify</div>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 'var(--fw-display-light)',
                fontSize: 20,
                color: 'rgba(245,240,234,0.85)',
                margin: '12px 0 0',
                maxWidth: 240,
                lineHeight: 1.3,
              }}
            >
              Jouw praktijk begint hier.
            </p>
          </div>
          {COLS.map((c) => (
            <div key={c.head}>
              <div
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 'var(--fw-ui-medium)',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'rgba(245,240,234,0.5)',
                  marginBottom: 16,
                }}
              >
                {c.head}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {c.items.map((i) => (
                  <a key={i.label} href={i.href} style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 13, color: 'rgba(245,240,234,0.8)' }}>
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
            fontFamily: 'var(--font-ui)',
            fontSize: 12,
            color: 'rgba(245,240,234,0.4)',
          }}
        >
          © 2026 Blissify · Professionele wellnessopleiding · België
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
