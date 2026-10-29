import React from 'react'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/SiteChrome'
import { WorkspaceCard } from '@/components/site/WorkspaceCard'
import { getWorkspaceCards, getWorkspaceFilterOptions } from '@/lib/workspaces'
import { WORKSPACE_LANDINGS } from '@/lib/workspace-landings'
import { GroupFilterSidebar } from '@/components/site/GroupFilterSidebar'

export const dynamic = 'force-dynamic'

// Copy 10/2026, "Werkruimtes (hub)".
export const metadata: Metadata = {
  title: 'Salon te huur en werkruimte huren in beauty & wellness',
  description: 'Vind een salon te huur, stoelhuur, behandelkamer of praktijkruimte in België en Nederland. Vergelijk ruimtes en contacteer de verhuurder rechtstreeks.',
}

type SP = Promise<Record<string, string | string[] | undefined>>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || ''
const many = (v: string | string[] | undefined) => one(v).split(',').map((s) => s.trim()).filter(Boolean)
const numOr = (v: string) => (v && Number.isFinite(Number(v)) ? Number(v) : undefined)

const FAQ: [string, string][] = [
  ['Kan ik een werkruimte huren voor enkele uren of dagen?', 'Dat hangt af van de verhuurder. Sommige ruimtes worden aangeboden voor vaste dagen, bepaalde tijdstippen of langere periodes. Bekijk de huurvoorwaarden in de publicatie.'],
  ['Wat is het verschil tussen exclusief en gedeeld gebruik?', 'Bij exclusief gebruik beschik je tijdens de afgesproken huurperiode zelf over de werkruimte. Bij gedeeld gebruik kan de ruimte ook door andere professionals worden gebruikt, afhankelijk van de afspraken met de verhuurder.'],
  ['Wat kost een salon te huur of stoelhuur?', 'Dat verschilt per locatie en per verhuurder. De huurprijs staat bij elke publicatie.'],
  ['Is Blissify partij bij de huurovereenkomst?', 'Nee. Je maakt afspraken rechtstreeks met de verhuurder.'],
  ['Kan ik als beginnende zelfstandige een werkruimte huren?', 'Ja, veel verhuurders werken met beginnende zelfstandigen. Vraag naar de voorwaarden, zoals looptijd en opzegtermijn.'],
]

const h2: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 28, lineHeight: 1.2, color: 'var(--text-brand)', margin: '0 0 14px' }
const h3: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 20, color: 'var(--text-brand)', margin: '22px 0 8px' }
const p: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-body)', margin: 0, maxWidth: 720 }

export default async function WerkruimtesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const land = one(sp.land) || undefined
  const [cards, opts] = await Promise.all([
    getWorkspaceCards({
      land,
      locatie: one(sp.locatie) || undefined,
      sector: many(sp.sector),
      werkplek: many(sp.werkplek),
      gebruik: one(sp.gebruik) || undefined,
      dag: many(sp.dag),
      moment: many(sp.moment),
      per: one(sp.per) || undefined,
      prijsMin: numOr(one(sp.prijsMin)),
      prijsMax: numOr(one(sp.prijsMax)),
      q: one(sp.q).trim() || undefined,
    }),
    getWorkspaceFilterOptions(land),
  ])
  const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }

  return (
    <SiteChrome>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      {/* Same structure as the course overview: dark header, filters left, results right. */}
      <section style={{ background: 'var(--surface-dark)' }}>
        <div className="bl-container" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 'var(--type-label)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(225, 230, 234, 0.7)' }}>Ontdek werkruimtes</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 'clamp(30px, 4vw, 40px)', lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--blissify-chalk)', margin: '10px 0 0', textWrap: 'balance' }}>
            Vind de werkruimte die bij jou past.
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'rgba(225, 230, 234, 0.85)', margin: '12px 0 0', maxWidth: 680 }}>
            Ontdek beschikbare behandelruimtes, salonruimtes en professionele werkplekken binnen de beauty- en wellnesssector in België en Nederland. Vergelijk de mogelijkheden en kom rechtstreeks in contact met verhuurders.
          </p>
        </div>
      </section>

      <div className="bl-container bl-listing-section" style={{ paddingTop: 40, paddingBottom: 96 }}>
        <div className="bl-listing-grid" style={{ display: 'grid', gridTemplateColumns: '264px 1fr', alignItems: 'start', gap: 40 }}>
          <GroupFilterSidebar groups={opts.groups} facets={opts.facets} searchPlaceholder="Titel of salonnaam" priceRange />
          <div style={{ minHeight: 480, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, gap: 16, minHeight: 40 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-body)' }}>{cards.length} {cards.length === 1 ? 'werkruimte' : 'werkruimtes'} gevonden</span>
            </div>
            {cards.length ? (
              <div className="bl-grid-ws">{cards.map((w) => <WorkspaceCard key={w.id} w={w} />)}</div>
            ) : (
              <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '72px 48px', textAlign: 'center', minHeight: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)', margin: '0 0 8px' }}>Geen werkruimtes gevonden</h3>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-strong)', margin: 0, maxWidth: 380 }}>Pas je filters aan of wis ze om meer resultaten te zien.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <section style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)' }}>
        <div className="bl-container" style={{ paddingTop: 64, paddingBottom: 80, display: 'grid', gap: 48 }}>
          <div>
            <h2 style={h2}>Salon te huur, stoelhuur of behandelkamer: welke werkruimte past bij jou?</h2>
            <p style={p}>Zoek je een salon te huur, stoelhuur in een bestaande salon of een behandelkamer voor een paar dagen per week? Op Blissify bieden salons en praktijken hun beschikbare werkruimtes aan. Je ziet locatie, huurprijs, voorzieningen en beschikbaarheid en maakt rechtstreeks afspraken met de verhuurder. Blissify is geen partij bij de huurovereenkomst.</p>
            {WORKSPACE_LANDINGS.map((l) => (
              <div key={l.key}>
                <h3 style={h3}>{l.h1}</h3>
                <p style={p}>{l.intro} <a href={`/werkruimtes/${l.key}`} className="bl-textlink">Bekijk {l.key === 'stoelhuur' ? 'stoelhuur' : 'behandelruimtes'}</a></p>
              </div>
            ))}
          </div>
          <div>
            <h2 style={h2}>Zelfstandig starten in beauty en wellness: eigen salon of werkruimte huren?</h2>
            <p style={p}>Wie als zelfstandige begint, kan een volledige salon huren, een stoel delen of een ruimte per dag huren. Een gedeelde ruimte houdt de vaste kosten laag en laat je testen of de plek werkt, een volledige salon geeft je meer vrijheid. Vergelijk locatie, huurprijs en voorzieningen.</p>
          </div>
          <div>
            <h2 style={h2}>Werkruimte verhuren aan beauty- en wellnessprofessionals</h2>
            <p style={p}>Heb je een ruimte die je niet altijd gebruikt? Salons, instituten en praktijken publiceren hun beschikbare plekken op Blissify. Zie <a href="/abonnementen-tarieven" className="bl-textlink">Abonnementen &amp; tarieven</a>.</p>
          </div>
          <div>
            <h2 style={h2}>Veelgestelde vragen over werkruimtes huren</h2>
            {FAQ.map(([q, a]) => (
              <div key={q}><h3 style={h3}>{q}</h3><p style={p}>{a}</p></div>
            ))}
          </div>
        </div>
      </section>
    </SiteChrome>
  )
}
