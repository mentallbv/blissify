import React from 'react'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/SiteChrome'
import { Faq } from '@/components/site/Faq'
import { ButtonLink } from '@/components/ui'
import { FAQ_CATEGORIES } from '@/lib/faq-page'
import { slugify } from '@/lib/slug'

// Copy 10/2026, "Veelgestelde vragen".
export const metadata: Metadata = {
  title: 'Veelgestelde vragen over Blissify',
  description: 'Antwoorden over opleidingen, vacatures, werkruimtes, merken en abonnementen op Blissify, het platform voor beauty en wellness in België en Nederland.',
}

export default function FaqPage() {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_CATEGORIES.flatMap((c) => c.items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))),
  }
  return (
    <SiteChrome>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section style={{ background: 'var(--surface-dark)' }}>
        <div className="bl-container" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 'clamp(32px, 4.4vw, 48px)', lineHeight: 1.08, letterSpacing: '-0.01em', color: 'var(--blissify-chalk)', margin: 0 }}>Veelgestelde vragen</h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1.7, color: 'rgba(225, 230, 234, 0.85)', margin: '14px 0 0', maxWidth: 640 }}>
            Vind snel een antwoord op jouw vragen over Blissify, het ontdekken van professioneel aanbod en de mogelijkheden om zelf iets te publiceren.
          </p>
        </div>
      </section>

      <div className="bl-container" style={{ paddingTop: 40, paddingBottom: 88 }}>
        <div className="bl-listing-grid" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 48, alignItems: 'start' }}>
          <nav aria-label="Categorieën" style={{ position: 'sticky', top: 96, display: 'grid', gap: 4 }}>
            {FAQ_CATEGORIES.map((c) => (
              <a key={c.title} href={`#${slugify(c.title)}`} className="bl-faq-navlink">{c.title}</a>
            ))}
          </nav>
          <div style={{ display: 'grid', gap: 48, minWidth: 0 }}>
            {FAQ_CATEGORIES.map((c) => (
              <section key={c.title} id={slugify(c.title)} style={{ scrollMarginTop: 96 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 28, color: 'var(--text-brand)', margin: '0 0 16px' }}>{c.title}</h2>
                <Faq items={c.items.map(([q, a]) => ({ q, a }))} variant="card" defaultOpen={-1} />
              </section>
            ))}
          </div>
        </div>
      </div>

      <section style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)' }}>
        <div className="bl-container" style={{ paddingTop: 72, paddingBottom: 72, textAlign: 'center', maxWidth: 720 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 'clamp(28px, 3.4vw, 40px)', color: 'var(--text-brand)', margin: 0 }}>Groei mee met Blissify.</h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', margin: '14px 0 0' }}>
            Maak jouw professionele aanbod zichtbaar. Presenteer jouw onderneming, merk en producten, publiceer opleidingen, plaats vacatures of bied werkruimtes aan. Met Blissify bereik je beauty- en wellnessprofessionals in België en Nederland vanuit één profiel.
          </p>
          <div style={{ marginTop: 24 }}><ButtonLink href="/abonnementen-tarieven" variant="primary">Word aanbieder</ButtonLink></div>
        </div>
      </section>
    </SiteChrome>
  )
}
