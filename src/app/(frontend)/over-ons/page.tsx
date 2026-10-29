import React from 'react'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/SiteChrome'
import { Eyebrow, ButtonLink } from '@/components/ui'
import { FAQ_CATEGORIES } from '@/lib/faq-page'
import { slugify } from '@/lib/slug'

// Copy 10/2026, "Over Blissify".
export const metadata: Metadata = {
  title: { absolute: 'Over Blissify | Het platform voor beauty en wellness' },
  description: 'Blissify brengt opleidingen, merken, werkruimtes en vacatures in beauty en wellness samen in België en Nederland. Ontdek wat we doen.',
}

const PILLARS: [string, string][] = [
  ['Alles op één plek.', 'Van professionele opleidingen en gespecialiseerde merken tot beschikbare werkruimtes en vacatures. Ontdek het aanbod binnen de beauty- en wellnesssector op één overzichtelijk platform.'],
  ['Gericht op professionals.', 'Blissify is ontwikkeld voor beauty- en wellnessprofessionals, opleiders, merken, leveranciers en ondernemers die willen groeien, ontdekken en samenwerken.'],
  ['Transparant & toegankelijk.', 'Vergelijk het aanbod via duidelijke informatie en gerichte zoekfilters. Je vindt eenvoudig de juiste aanbieders en kunt hen rechtstreeks contacteren of doorklikken naar hun website.'],
]

const h2: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 'clamp(32px, 4vw, 44px)', lineHeight: 1.08, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: 0, textWrap: 'balance' }
const body: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 17, lineHeight: 1.75, color: 'var(--text-body)', margin: '20px 0 0', maxWidth: 680 }

export default function OverOnsPage() {
  return (
    <SiteChrome>
      <section className="bl-container" style={{ paddingTop: 88, paddingBottom: 56 }}>
        <Eyebrow>Over Blissify</Eyebrow>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 'clamp(40px, 6vw, 60px)', lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--text-brand)', margin: '18px 0 0', maxWidth: 820, textWrap: 'balance' }}>
          Eén platform. <span style={{ color: 'var(--blissify-terracotta)' }}>Eindeloos veel mogelijkheden.</span>
        </h1>
        <p style={{ ...body, fontSize: 19 }}>
          Blissify brengt de beauty- en wellnesssector samen op één centrale plek. Een professioneel platform waar je opleidingen ontdekt, salons en opleiders leert kennen, merken en leveranciers vindt en nieuwe professionele mogelijkheden verkent.
        </p>
        <p style={body}>
          Of je nu jouw expertise wilt uitbreiden, jouw onderneming en aanbod zichtbaar wilt maken of op zoek bent naar nieuwe samenwerkingen: Blissify helpt je om de juiste mogelijkheden en professionals te vinden.
        </p>
      </section>

      <section style={{ borderTop: '0.5px solid var(--border-hairline)' }}>
        <div className="bl-container bl-grid-3" style={{ paddingTop: 56, paddingBottom: 88, gap: 40 }}>
          {PILLARS.map(([title, text]) => (
            <div key={title}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--text-brand)', margin: 0 }}>{title}</h2>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-body)', margin: '12px 0 0' }}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)' }}>
        <div className="bl-container" style={{ paddingTop: 88, paddingBottom: 88 }}>
          <h2 style={h2}>Veelgestelde vragen.</h2>
          <p style={{ ...body, fontSize: 16 }}>Korte antwoorden op de belangrijkste vragen over Blissify en de mogelijkheden van ons platform.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '28px 0' }}>
            {FAQ_CATEGORIES.map((c) => (
              <a key={c.title} href={`/veelgestelde-vragen#${slugify(c.title)}`} className="bl-tag" style={{ textDecoration: 'none' }}>{c.title}</a>
            ))}
          </div>
          <ButtonLink href="/veelgestelde-vragen" variant="accent">Bekijk alle veelgestelde vragen</ButtonLink>
        </div>
      </section>

      <section style={{ background: 'var(--surface-dark)' }}>
        <div className="bl-container" style={{ paddingTop: 88, paddingBottom: 88, textAlign: 'center', maxWidth: 760 }}>
          <h2 style={{ ...h2, color: 'var(--blissify-chalk)' }}>Jouw groei begint hier.</h2>
          <p style={{ ...body, margin: '14px auto 0', color: 'rgba(225, 230, 234,0.85)' }}>Maak jouw aanbod zichtbaar voor beauty- en wellnessprofessionals in België en Nederland. Of je nu opleidingen aanbiedt, jouw merk wilt promoten, een werkruimte beschikbaar hebt of nieuwe medewerkers zoekt: ontdek wat Blissify voor jouw onderneming kan betekenen.</p>
          <div style={{ marginTop: 26 }}><ButtonLink href="/abonnementen-tarieven" variant="accent">Word aanbieder</ButtonLink></div>
        </div>
      </section>
    </SiteChrome>
  )
}
