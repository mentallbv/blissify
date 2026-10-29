import React from 'react'
import { Logo } from '@/components/ui/Logo'
import { NewsletterForm } from './NewsletterForm'

// Footer from the copy (10/2026), same order as the menu. `ready: false`
// links stay hidden until their page exists, so nothing points at a 404.
type FooterLink = { label: string; href: string; ready?: boolean }
const COLS: { head: string; items: FooterLink[] }[] = [
  {
    head: 'Ontdekken',
    items: [
      { label: 'Salons & professionals', href: '/salons-professionals' },
      { label: 'Merken & leveranciers', href: '/merken-leveranciers' },
      { label: 'Opleidingen', href: '/opleidingen' },
      { label: 'Werkruimtes', href: '/werkruimtes', ready: false },
      { label: 'Vacatures & samenwerkingen', href: '/vacatures' },
    ],
  },
  {
    head: 'Voor aanbieders',
    items: [
      { label: 'Word aanbieder', href: '/abonnementen-tarieven' },
      { label: 'Bied opleidingen aan', href: '/abonnementen-tarieven' },
      { label: 'Promoot jouw merk', href: '/abonnementen-tarieven?voor=merken' },
      { label: 'Bied een werkruimte aan', href: '/abonnementen-tarieven', ready: false },
      { label: 'Plaats een vacature', href: '/abonnementen-tarieven' },
    ],
  },
  {
    head: 'Blissify',
    items: [
      { label: 'Over Blissify', href: '/over-ons' },
      { label: 'Abonnementen & tarieven', href: '/abonnementen-tarieven' },
      { label: 'Veelgestelde vragen', href: '/veelgestelde-vragen', ready: false },
      { label: 'Contact', href: '/contact' },
    ],
  },
]

/** "Populair": plain text links for search engines (copy 10/2026). */
const POPULAR: FooterLink[] = [
  { label: 'Opleiding schoonheidsspecialiste', href: '/opleidingen/schoonheid' },
  { label: 'Nagelstyliste opleiding', href: '/opleidingen/nagelstyliste' },
  { label: 'Opleiding pedicure', href: '/opleidingen/pedicure', ready: false },
  { label: 'Massage opleiding', href: '/opleidingen/massage' },
  { label: 'Vacature schoonheidsspecialiste', href: '/vacatures/schoonheidsspecialiste' },
  { label: 'Salon te huur', href: '/werkruimtes', ready: false },
]

const shown = (l: FooterLink) => l.ready !== false
const smallLink: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 12, color: 'rgba(225, 230, 234,0.55)' }

export function SiteFooter() {
  return (
    <footer style={{ background: 'var(--surface-dark)', color: 'var(--blissify-chalk)', borderTop: '0.5px solid rgba(225, 230, 234,0.15)' }}>
      <div className="bl-container" style={{ paddingTop: 80, paddingBottom: 40 }}>
        <div className="bl-footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48 }}>
          <div style={{ maxWidth: 380 }}>
            <Logo height={34} light />
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontWeight: 'var(--fw-ui-regular)',
                fontSize: 15,
                lineHeight: 1.6,
                color: 'rgba(225, 230, 234,0.7)',
                margin: '16px 0 0',
              }}
            >
              Alles voor jouw groei in beauty &amp; wellness.
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.6, color: 'rgba(225, 230, 234,0.55)', margin: '8px 0 0' }}>
              Ontdek opleidingen, salons, merken, leveranciers, werkruimtes en carrièremogelijkheden. Eén platform voor beauty- en wellnessprofessionals in België en Nederland.
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
              Blijf op de hoogte.
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.6, color: 'rgba(225, 230, 234,0.7)', margin: '6px 0 0' }}>
              Ontvang nieuwe opleidingen, merken, vacatures en werkruimtes in jouw mailbox.
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
                  color: 'var(--palette-sand)',
                  marginBottom: 16,
                  letterSpacing: '0.12em',
                }}
              >
                {c.head}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {c.items.filter(shown).map((i) => (
                  <a key={i.label} href={i.href} className="bl-footer-link" style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 14, lineHeight: 2, color: 'rgba(225, 230, 234,0.65)' }}>
                    {i.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 48, display: 'flex', gap: '6px 18px', flexWrap: 'wrap', alignItems: 'baseline', fontFamily: 'var(--font-ui)', fontSize: 13 }}>
          <span style={{ fontWeight: 'var(--fw-ui-medium)', fontSize: 'var(--type-label)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--palette-sand)' }}>Populair</span>
          {POPULAR.filter(shown).map((l) => (
            <a key={l.label} href={l.href} className="bl-footer-link" style={{ color: 'rgba(225, 230, 234,0.65)' }}>
              {l.label}
            </a>
          ))}
        </div>
        <div
          style={{
            borderTop: '0.5px solid rgba(225, 230, 234,0.15)',
            marginTop: 24,
            paddingTop: 24,
            display: 'flex',
            gap: 24,
            alignItems: 'center',
            flexWrap: 'wrap',
            fontFamily: 'var(--font-ui)',
            fontSize: 12,
            color: 'rgba(225, 230, 234,0.55)',
          }}
        >
          <span>© {new Date().getFullYear()} Blissify · België &amp; Nederland</span>
          <a href="/privacybeleid" className="bl-footer-link" style={smallLink}>Privacybeleid</a>
          <a href="/cookiebeleid" className="bl-footer-link" style={smallLink}>Cookiebeleid</a>
        </div>
      </div>
    </footer>
  )
}

/** Forest marquee wordmark band - infinite horizontal scroll. */
export function Marquee() {
  const words = Array.from({ length: 8 })
  return (
    <div className="bl-marquee" style={{ background: 'var(--surface-dark)', overflow: 'hidden', padding: '36px 0', borderBottom: '0.5px solid rgba(225, 230, 234,0.12)' }}>
      <div className="bl-marquee-track">
        {[0, 1].map((group) => (
          <div key={group} className="bl-marquee-group" aria-hidden={group === 1}>
            {words.map((_, i) => (
              <span key={i} className="bl-marquee-word">
                Blissify <span style={{ color: 'var(--blissify-terracotta)' }}>·</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
