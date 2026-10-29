import React from 'react'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/SiteChrome'
import { VacancyCard } from '@/components/site/VacancyCard'
import { getVacancyCards, getVacancyFilterOptions } from '@/lib/vacancies'
import { VACANCY_LANDINGS } from '@/lib/vacancy-landings'
import { GroupFilterSidebar } from '@/components/site/GroupFilterSidebar'

export const dynamic = 'force-dynamic'

// Copy 10/2026, "Vacatures & samenwerkingen (hub)".
export const metadata: Metadata = {
  title: 'Vacatures beauty & wellness: loondienst en zelfstandig',
  description: 'Vacatures, freelanceopdrachten en stages voor schoonheidsspecialisten, nagelstylisten, masseurs en kappers in België en Nederland. Reageer rechtstreeks.',
}

type SP = Promise<Record<string, string | string[] | undefined>>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || ''
const many = (v: string | string[] | undefined) => one(v).split(',').map((s) => s.trim()).filter(Boolean)

const FAQ = [
  ['Hoe reageer ik op een vacature?', 'Via de contactmogelijkheden op de vacaturepagina neem je rechtstreeks contact op met de onderneming. De sollicitatie en verdere communicatie verlopen rechtstreeks tussen jou en de onderneming.'],
  ['Kan ik als zelfstandige ook een samenwerking zoeken?', 'Ja. Blissify richt zich niet uitsluitend op vacatures in loondienst. Je vindt ook mogelijkheden voor zelfstandigen, freelancers en andere samenwerkingsvormen.'],
  ['Welke functies vind ik op Blissify?', 'Schoonheidsspecialiste, nagelstyliste, pedicure, masseur, kapper en andere functies in beauty en wellness.'],
  ['Ik zoek personeel. Hoe plaats ik een vacature?', 'Kies een abonnement, maak je profiel aan en publiceer je vacature. Zie Abonnementen & tarieven.'],
]

const h2: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 28, lineHeight: 1.2, color: 'var(--text-brand)', margin: '0 0 14px' }
const h3: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 20, color: 'var(--text-brand)', margin: '22px 0 8px' }
const p: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-body)', margin: 0, maxWidth: 720 }

export default async function VacaturesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const land = one(sp.land) || undefined
  const [cards, opts] = await Promise.all([
    getVacancyCards({ land, locatie: one(sp.locatie) || undefined, type: many(sp.type), sector: many(sp.sector), regime: many(sp.regime), q: one(sp.q).trim() || undefined }),
    getVacancyFilterOptions(land),
  ])
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  }

  return (
    <SiteChrome>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      {/* Same structure as the course overview: dark header, filters left, results right. */}
      <section style={{ background: 'var(--surface-dark)' }}>
        <div className="bl-container" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 'var(--type-label)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(225, 230, 234, 0.7)' }}>Ontdek vacatures &amp; samenwerkingen</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 'clamp(30px, 4vw, 40px)', lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--blissify-chalk)', margin: '10px 0 0', textWrap: 'balance' }}>
            Ontdek jouw volgende professionele kans.
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'rgba(225, 230, 234, 0.85)', margin: '12px 0 0', maxWidth: 680 }}>
            Verken vacatures, freelanceopdrachten en samenwerkingsmogelijkheden binnen de beauty- en wellnesssector in België en Nederland. Vind kansen die aansluiten bij jouw ambities en kom rechtstreeks in contact met de aanbiedende ondernemingen.
          </p>
        </div>
      </section>

      <div className="bl-container bl-listing-section" style={{ paddingTop: 40, paddingBottom: 96 }}>
        <div className="bl-listing-grid" style={{ display: 'grid', gridTemplateColumns: '264px 1fr', alignItems: 'start', gap: 40 }}>
          <GroupFilterSidebar groups={opts.groups} facets={opts.facets} searchPlaceholder="Functie of bedrijfsnaam" />
          <div style={{ minHeight: 480, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, gap: 16, minHeight: 40 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-body)' }}>{cards.length} {cards.length === 1 ? 'vacature' : 'vacatures'} gevonden</span>
            </div>
            {cards.length ? (
              <div className="bl-list">{cards.map((v) => <VacancyCard key={v.id} v={v} />)}</div>
            ) : (
              <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '72px 48px', textAlign: 'center', minHeight: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)', margin: '0 0 8px' }}>Geen vacatures gevonden</h3>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-strong)', margin: 0, maxWidth: 380 }}>Pas je filters aan of wis ze om meer resultaten te zien.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <section style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)' }}>
        <div className="bl-container" style={{ paddingTop: 64, paddingBottom: 80, display: 'grid', gap: 48 }}>
          <div>
            <h2 style={h2}>Vacatures in beauty en wellness: salon, instituut, spa of praktijk</h2>
            <p style={p}>Blissify brengt salons, instituten, spa&apos;s en praktijken samen met professionals die werk of een samenwerking zoeken. Je reageert rechtstreeks bij de onderneming. Blissify is geen partij bij arbeidsovereenkomsten of samenwerkingen.</p>
          </div>
          <div>
            <h2 style={h2}>Vacature per beroep</h2>
            <ul style={{ ...p, paddingLeft: 20, lineHeight: 2 }}>
              {VACANCY_LANDINGS.map((l) => (
                <li key={l.key}><a href={`/vacatures/${l.key}`} className="bl-textlink">{l.h1.replace(' in België en Nederland', '')}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h2 style={h2}>Werken in loondienst of als zelfstandige: welke samenwerking past bij jou?</h2>
            <p style={p}>Veel salons werken met medewerkers in loondienst, andere met zelfstandigen die een stoel of ruimte huren of op commissie werken. Op Blissify zie je per vacature om welke vorm het gaat: loondienst, zelfstandig, freelance, commissie of stage.</p>
            <h3 style={h3}>Vacature in loondienst</h3>
            <p style={p}>Vast of tijdelijk werk bij een salon, instituut of spa.</p>
            <h3 style={h3}>Zelfstandig werken in een salon</h3>
            <p style={p}>Je werkt voor eigen rekening in een bestaande salon. Soms huur je een stoel of een ruimte.</p>
            <h3 style={h3}>Stage of vacature voor starters</h3>
            <p style={p}>Stageplaatsen en instapvacatures voor wie net uit een opleiding komt. Bekijk ook de <a href="/opleidingen" className="bl-textlink">opleidingen</a>.</p>
          </div>
          <div>
            <h2 style={h2}>Veelgestelde vragen over vacatures in beauty en wellness</h2>
            {FAQ.map(([q, a]) => (
              <div key={q}>
                <h3 style={h3}>{q}</h3>
                <p style={p}>{a}</p>
              </div>
            ))}
            <p style={{ ...p, marginTop: 24 }}><a href="/abonnementen-tarieven" className="bl-textlink">Bekijk de abonnementen om zelf een vacature te plaatsen</a></p>
          </div>
        </div>
      </section>
    </SiteChrome>
  )
}
