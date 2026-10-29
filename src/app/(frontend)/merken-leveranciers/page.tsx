import React from 'react'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/SiteChrome'
import { BrandCard } from '@/components/site/BrandCard'
import { GroupFilterSidebar } from '@/components/site/GroupFilterSidebar'
import { HubContent, HubHeader } from '@/components/site/HubContent'
import { getBrandCards, getMerkenFacets, type MerkenFilters } from '@/lib/data'
import { MERKEN_GROUPS } from '@/lib/merken-filters'

export const dynamic = 'force-dynamic'

// Copy 10/2026, "Merken & leveranciers".
export const metadata: Metadata = {
  title: 'Merken en leveranciers voor beauty en wellness',
  description: 'Ontdek professionele beauty- en wellnessmerken, leveranciers, producten en apparatuur in België en Nederland. Kom rechtstreeks in contact.',
}

const one = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v || '')
const list = (v: string | string[] | undefined): string[] => one(v).split(',').filter(Boolean)

export default async function MerkenPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const filters: MerkenFilters = {
    q: one(sp.q) || undefined,
    producttype: list(sp.producttype),
    typePartner: one(sp.typePartner) || undefined,
    herkomst: one(sp.herkomst) || undefined,
    filosofie: list(sp.filosofie),
    extra: list(sp.extra),
  }
  const [{ cards }, facets] = await Promise.all([getBrandCards(filters), getMerkenFacets()])
  return (
    <SiteChrome>
      <HubHeader
        eyebrow="Ontdek merken & leveranciers"
        title="Ontdek de merken achter jouw professionele groei."
        intro="Verken professionele beauty- en wellnessmerken en leveranciers in België en Nederland. Ontdek hun producten, apparatuur, expertise en opleidingen en kom rechtstreeks in contact met de bedrijven achter het aanbod."
      />
      <div className="bl-container bl-listing-section" style={{ paddingTop: 40, paddingBottom: 96 }}>
        <div className="bl-listing-grid" style={{ display: 'grid', gridTemplateColumns: '264px 1fr', alignItems: 'start', gap: 40 }}>
          <GroupFilterSidebar groups={MERKEN_GROUPS} facets={facets} searchPlaceholder="Merk- of bedrijfsnaam" />
          <div style={{ minHeight: 480, minWidth: 0 }}>
            <div style={{ marginBottom: 22, minHeight: 40, display: 'flex', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-body)' }}>{cards.length} {cards.length === 1 ? 'merk of leverancier' : 'merken en leveranciers'} gevonden</span>
            </div>
            {cards.length ? (
              <div className="bl-grid-ws">{cards.map((b) => <BrandCard key={b.slug} b={b} />)}</div>
            ) : (
              <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '72px 48px', textAlign: 'center', minHeight: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)', margin: '0 0 8px' }}>Geen merken gevonden</h3>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-strong)', margin: 0, maxWidth: 380 }}>Pas je filters aan of wis ze om meer resultaten te zien.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <HubContent
        sections={[
          { h2: 'Professionele beautymerken en leveranciers van apparatuur', body: 'Per merk zie je producten, apparatuur en expertise, en of het merk ook opleidingen of workshops geeft. Geen webshop: aankopen verlopen rechtstreeks via het merk.' },
          { h2: 'Opleidingen en trainingen van merken', body: <>Veel merken trainen professionals in producten en technieken. Bekijk het aanbod op <a href="/opleidingen" className="bl-textlink">Opleidingen</a>.</> },
          { h2: 'Zichtbaar worden als merk of leverancier', body: <>Publiceer je merkprofiel, opleidingen en events voor professionals in beauty en wellness. Zie <a href="/abonnementen-tarieven?voor=merken" className="bl-textlink">Abonnementen &amp; tarieven</a>.</> },
        ]}
        faqTitle="Veelgestelde vragen over merken en leveranciers"
        faq={[
          ['Kan ik producten rechtstreeks via Blissify kopen?', 'Nee. Blissify is geen webshop en verwerkt zelf geen productbestellingen. Aankopen en verdere afspraken verlopen rechtstreeks via het merk of de leverancier.'],
          ['Controleert Blissify de kwaliteit van de producten?', 'Een vermelding op Blissify is geen kwaliteitsgarantie of goedkeuring. Merken en leveranciers zijn zelf verantwoordelijk voor hun producten, diensten en de informatie die ze publiceren.'],
          ['Hoe krijg ik mijn merk op Blissify?', 'Kies een abonnement voor merken & leveranciers en maak een profiel. Bekijk de formules op Abonnementen & tarieven.'],
          ['Kan ik als merk opleidingen of events publiceren?', 'Ja, afhankelijk van je abonnement. Zie de tabel op Abonnementen & tarieven.'],
        ]}
        links={[
          { href: '/opleidingen', label: 'Opleidingen' },
          { href: '/salons-professionals', label: 'Salons & professionals' },
          { href: '/abonnementen-tarieven?voor=merken', label: 'Abonnementen & tarieven' },
        ]}
      />
    </SiteChrome>
  )
}
