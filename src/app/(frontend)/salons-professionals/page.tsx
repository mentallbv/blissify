import React from 'react'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/SiteChrome'
import { ProviderCard } from '@/components/ui'
import { GroupFilterSidebar } from '@/components/site/GroupFilterSidebar'
import { HubContent, HubHeader } from '@/components/site/HubContent'
import { getProviderCards, getTrainerFilterOptions } from '@/lib/data'

export const dynamic = 'force-dynamic'

// Copy 10/2026, "Salons & professionals".
export const metadata: Metadata = {
  title: 'Salons en beautyprofessionals ontdekken',
  description: 'Maak kennis met salons, zelfstandige professionals, opleiders en academies in beauty en wellness in België en Nederland. Neem rechtstreeks contact op.',
}

const one = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v || '')
const many = (v: string | string[] | undefined): string[] => one(v).split(',').map((s) => s.trim()).filter(Boolean)

type SP = Promise<Record<string, string | string[] | undefined>>

export default async function SalonsProfessionalsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const land = one(sp.land) || undefined
  const [{ cards }, opts] = await Promise.all([
    getProviderCards({ specialisaties: many(sp.specialisatie), city: one(sp.locatie) || undefined, land, q: one(sp.q).trim() || undefined, limit: 48 }),
    getTrainerFilterOptions(land),
  ])

  return (
    <SiteChrome>
      <HubHeader
        eyebrow="Ontdek salons & professionals"
        title="Ontdek de professionals achter het aanbod."
        intro="Maak kennis met salons, zelfstandige professionals, opleiders en academies binnen de beauty- en wellnesssector in België en Nederland. Ontdek hun expertise, verken hun opleidingen en professionele mogelijkheden en kom rechtstreeks met hen in contact."
      />
      <div className="bl-container bl-listing-section" style={{ paddingTop: 40, paddingBottom: 96 }}>
        <div className="bl-listing-grid" style={{ display: 'grid', gridTemplateColumns: '264px 1fr', alignItems: 'start', gap: 40 }}>
          <GroupFilterSidebar groups={opts.groups} facets={opts.facets} searchPlaceholder="Naam van salon of professional" />
          <div style={{ minHeight: 480, minWidth: 0 }}>
            <div style={{ marginBottom: 22, minHeight: 40, display: 'flex', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-body)' }}>{cards.length} {cards.length === 1 ? 'profiel' : 'profielen'} gevonden</span>
            </div>
            {cards.length ? (
              <div className="bl-grid-ws">{cards.map((p) => <ProviderCard key={`${p.type || 'trainer'}:${p.slug}`} {...p} />)}</div>
            ) : (
              <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '72px 48px', textAlign: 'center', minHeight: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)', margin: '0 0 8px' }}>Geen profielen gevonden</h3>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-strong)', margin: 0, maxWidth: 380 }}>Pas je filters aan of wis ze om meer resultaten te zien.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <HubContent
        sections={[
          { h2: 'Salons, instituten en zelfstandige professionals in beauty en wellness', body: 'Elk profiel toont wat de onderneming aanbiedt: opleidingen, vacatures, werkruimtes en samenwerkingen. Zo zie je meteen of een salon of professional bij jou past.' },
          { h2: 'Opleiders en academies: leer van de professionals', body: <>Opleiders en academies presenteren hun opleidingen, trainers en locaties. Bekijk ook de <a href="/opleidingen" className="bl-textlink">opleidingen</a>.</> },
          { h2: 'Zelf zichtbaar worden als salon of professional', body: <>Maak een profiel, publiceer je opleidingen, vacatures of werkruimtes en laat professionals je rechtstreeks contacteren. Zie <a href="/abonnementen-tarieven" className="bl-textlink">Abonnementen &amp; tarieven</a>.</> },
        ]}
        faqTitle="Veelgestelde vragen over salons & professionals"
        faq={[
          ['Is Blissify bedoeld om mijn salonbehandelingen aan consumenten te promoten?', 'Nee. Blissify is een B2B-platform voor professionele mogelijkheden binnen de beauty- en wellnesssector. Het is geen boekingsplatform of bedrijvengids voor consumenten die een schoonheidsbehandeling zoeken.'],
          ['Wat staat er op een profiel van een salon of professional?', 'Wat de aanbieder zelf invult: beschrijving, locatie, opleidingen, vacatures, werkruimtes en contactgegevens.'],
          ['Hoe maak ik een profiel aan?', 'Kies een abonnement en maak je profiel. Je beheert alles via je dashboard.'],
          ['Hoe neem ik contact op met een salon of opleider?', 'Rechtstreeks via de contactmogelijkheden op het profiel.'],
        ]}
        links={[
          { href: '/opleidingen', label: 'Opleidingen' },
          { href: '/vacatures', label: 'Vacatures' },
          { href: '/werkruimtes', label: 'Werkruimtes' },
          { href: '/merken-leveranciers', label: 'Merken & leveranciers' },
          { href: '/abonnementen-tarieven', label: 'Abonnementen & tarieven' },
        ]}
      />
    </SiteChrome>
  )
}
