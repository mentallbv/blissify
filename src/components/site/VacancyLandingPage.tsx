import React from 'react'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/SiteChrome'
import { VacancyCard } from '@/components/site/VacancyCard'
import { getVacancyCards } from '@/lib/vacancies'
import { LANDING_INDEX_MIN, type VacancyLanding } from '@/lib/vacancy-landings'

const SITE = 'https://blissify.vercel.app'

/** Canonical to the hub until the page has enough vacancies (copy: "eigen pagina vanaf 5 actieve vacatures"). */
export async function landingMetadata(l: VacancyLanding): Promise<Metadata> {
  const count = (await getVacancyCards({ functions: l.functions })).length
  const own = count >= LANDING_INDEX_MIN
  return {
    title: l.title,
    description: l.description,
    alternates: { canonical: own ? `${SITE}/vacatures/${l.key}` : `${SITE}/vacatures` },
    robots: own ? undefined : { index: false, follow: true },
  }
}

const h2: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 28, lineHeight: 1.2, color: 'var(--text-brand)', margin: '0 0 14px' }
const h3: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 20, color: 'var(--text-brand)', margin: '22px 0 8px' }
const p: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-body)', margin: 0, maxWidth: 720, whiteSpace: 'pre-line' }

export async function VacancyLandingPage({ landing: l }: { landing: VacancyLanding }) {
  const cards = await getVacancyCards({ functions: l.functions })
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: l.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  }
  return (
    <SiteChrome>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <section className="bl-container" style={{ paddingTop: 72, paddingBottom: 24 }}>
        <nav aria-label="Kruimelpad" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)', marginBottom: 16 }}>
          <a href="/vacatures" className="bl-textlink">Vacatures</a> → {l.h1}
        </nav>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 44, letterSpacing: '-0.01em', color: 'var(--text-brand)', lineHeight: 1.1, margin: 0, maxWidth: 760 }}>{l.h1}</h1>
        <p style={{ ...p, fontSize: 16, margin: '20px 0 0' }}>{l.intro}</p>
      </section>
      <section className="bl-container" style={{ paddingTop: 16, paddingBottom: 64 }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)', margin: '0 0 16px' }}>{cards.length} {cards.length === 1 ? 'vacature' : 'vacatures'}</p>
        {cards.length ? (
          <div className="bl-grid-3">{cards.map((v) => <VacancyCard key={v.id} v={v} />)}</div>
        ) : (
          <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '56px 40px', textAlign: 'center' }}>
            <p style={{ ...p, margin: '0 auto', color: 'var(--text-meta)', maxWidth: 420 }}>
              Er zijn op dit moment geen vacatures voor dit beroep. <a href="/vacatures" className="bl-textlink">Bekijk alle vacatures</a>
            </p>
          </div>
        )}
      </section>
      <section style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)' }}>
        <div className="bl-container" style={{ paddingTop: 64, paddingBottom: 80, display: 'grid', gap: 40 }}>
          {l.sections.map((s) => (
            <div key={s.h2}>
              <h2 style={h2}>{s.h2}</h2>
              <p style={p}>{s.body}</p>
            </div>
          ))}
          <div>
            <h2 style={h2}>{l.faqTitle}</h2>
            {l.faq.map(([q, a]) => (
              <div key={q}>
                <h3 style={h3}>{q}</h3>
                <p style={p}>{a}</p>
              </div>
            ))}
          </div>
          <p style={p}>
            <a href="/vacatures" className="bl-textlink">Alle vacatures</a> · <a href="/opleidingen" className="bl-textlink">Opleidingen</a> · <a href="/abonnementen-tarieven" className="bl-textlink">Zelf een vacature plaatsen</a>
          </p>
        </div>
      </section>
    </SiteChrome>
  )
}
