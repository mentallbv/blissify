import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteChrome } from '@/components/site/SiteChrome'
import { BrandTabs } from '@/components/site/BrandTabs'
import { getBrandBySlug } from '@/lib/data'
import { TrackPageView } from '@/components/site/TrackPageView'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const { brand } = await getBrandBySlug(slug)
  if (!brand) return {}
  return {
    title: `${brand.name} - Gecertificeerde opleiders & opleidingen in België | Blissify`,
    description: `Vind gecertificeerde ${brand.name} opleiders in België. Ontdek ${brand.courseCount} erkende opleidingen in ${brand.sector.toLowerCase()} via Blissify.`,
  }
}

export default async function MerkPage({ params }: Params) {
  const { slug } = await params
  const { brand, providers, courses } = await getBrandBySlug(slug)
  if (!brand) notFound()

  return (
    <SiteChrome>
      {brand.id != null ? <TrackPageView kind="brand" id={brand.id} /> : null}
      {/* Dark forest header */}
      <header style={{ background: 'var(--surface-dark)' }}>
        <div className="bl-container" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 80px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 40, color: 'var(--blissify-forest)' }}>
                {brand.initial}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 48, lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--blissify-chalk)', margin: 0 }}>
                {brand.name}
              </h1>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'rgba(245,240,234,0.7)', margin: '8px 0 12px' }}>
                {brand.sector} · Internationaal merk
              </p>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 'var(--fw-ui-medium)',
                  fontSize: 'var(--type-label)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-accent)',
                }}
              >
                <i className="ti ti-rosette-discount-check-filled" style={{ fontSize: 15 }} />
                Geverifieerd merk
              </span>
            </div>
            {brand.website ? (
              <a
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 13, color: 'var(--blissify-chalk)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                Bezoek website <i className="ti ti-arrow-up-right" />
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <section className="bl-container" style={{ paddingTop: 48, paddingBottom: 96 }}>
        <BrandTabs brand={brand} providers={providers} courses={courses} />
      </section>
    </SiteChrome>
  )
}
