import React from 'react'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/SiteChrome'
import { ContactForm } from '@/components/site/ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Neem contact op met Blissify. Vragen over het platform, je account of een samenwerking.',
}

export default function ContactPage() {
  return (
    <SiteChrome>
      <section style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '88px 32px 64px' }}>
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'start' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-accent)' }}>Contact</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 52, lineHeight: 1.05, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: '16px 0 0', textWrap: 'balance' }}>
              Neem contact op met Blissify.
            </h1>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', maxWidth: 460, margin: '22px 0 0' }}>
              Vragen over het platform, je account of een samenwerking? We helpen je graag verder.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 28 }}>
              {[
                ['ti ti-mail', 'hallo@blissify.be'],
                ['ti ti-map-pin', 'België'],
              ].map(([icon, label]) => (
                <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'center', fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--text-body)' }}>
                  <i className={icon} style={{ fontSize: 18, color: 'var(--text-meta)' }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </SiteChrome>
  )
}
