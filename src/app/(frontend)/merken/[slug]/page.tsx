import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteChrome } from '@/components/site/SiteChrome'
import { ButtonLink, TypeBadge } from '@/components/ui'
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
    title: `${brand.name} - Opleiders & opleidingen in België | Blissify`,
    description: `Vind ${brand.name} opleiders in België. Bekijk ${brand.courseCount} opleidingen in ${brand.sector.toLowerCase()} en vergelijk het aanbod via Blissify.`,
  }
}

export default async function MerkPage({ params }: Params) {
  const { slug } = await params
  const { brand, providers, courses } = await getBrandBySlug(slug)
  if (!brand) notFound()
  const partnerType = ({
    productmerken: 'Productmerk',
    apparatuurmerken: 'Apparatuurmerk',
    groothandels_distributeurs: 'Groothandel / Distributeur',
    leveranciers: 'Leverancier',
  } as Record<string, string>)[brand.partnerType || ''] || 'Merk & Leverancier'
  const origin = ({
    belgisch: 'Belgisch',
    nederlands: 'Nederlands',
    europees: 'Europees',
    internationaal: 'Internationaal',
  } as Record<string, string>)[brand.origin || ''] || 'Herkomst niet vermeld'

  return (
    <SiteChrome>
      {brand.id != null ? <TrackPageView kind="brand" id={brand.id} /> : null}
      {/* Dark forest header (brand cover as backdrop when present) */}
      <header
        style={{
          background: 'var(--surface-dark)',
          backgroundImage: brand.cover ? `linear-gradient(rgba(26,46,37,0.72),rgba(26,46,37,0.72)), url(${brand.cover})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="bl-container" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 80px', overflow: 'hidden' }}>
              {brand.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={brand.logo} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 40, color: 'var(--blissify-forest)' }}>
                  {brand.initial}
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 48, lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--blissify-chalk)', margin: 0 }}>
                {brand.name}
              </h1>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'rgba(245,240,234,0.7)', margin: '8px 0 12px' }}>
                {partnerType} · {origin}
              </p>
              <TypeBadge type="brand" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {brand.email ? (
                <ButtonLink href={`mailto:${brand.email}?subject=${encodeURIComponent(`Informatieaanvraag via Blissify over ${brand.name}`)}`} variant="accent" size="sm" icon={<i className="ti ti-mail" />}>
                  Vraag meer informatie
                </ButtonLink>
              ) : null}
              {brand.website ? <a href={brand.website} target="_blank" rel="noopener noreferrer" aria-label="Website" style={{ color: 'var(--blissify-chalk)', fontSize: 20 }}><i className="ti ti-world" /></a> : null}
              {brand.social?.instagram ? <a href={brand.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: 'var(--blissify-chalk)', fontSize: 20 }}><i className="ti ti-brand-instagram" /></a> : null}
              {brand.social?.facebook ? <a href={brand.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ color: 'var(--blissify-chalk)', fontSize: 20 }}><i className="ti ti-brand-facebook" /></a> : null}
              {brand.social?.tiktok ? <a href={brand.social.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" style={{ color: 'var(--blissify-chalk)', fontSize: 20 }}><i className="ti ti-brand-tiktok" /></a> : null}
            </div>
          </div>
        </div>
      </header>

      <section className="bl-container" style={{ paddingTop: 48, paddingBottom: 96 }}>
        {brand.gallery?.length ? (
          <div style={{ marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 26, color: 'var(--text-brand)', margin: '0 0 20px' }}>Sfeer &amp; producten</h2>
            <div style={{ display: 'grid', gridTemplateColumns: brand.gallery.length === 1 ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
              {brand.gallery.map((item, index) => (
                <figure key={`${item.image}-${index}`} style={{ margin: 0, minHeight: index === 0 ? 360 : 240, borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', background: 'var(--surface-dark)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.caption || `${brand.name} sfeerfoto ${index + 1}`} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, objectFit: 'cover' }} />
                  {item.caption ? <figcaption style={{ position: 'absolute', left: 14, bottom: 12, right: 14, color: '#fff', fontFamily: 'var(--font-ui)', fontSize: 12, textShadow: '0 1px 8px rgba(0,0,0,.65)' }}>{item.caption}</figcaption> : null}
                </figure>
              ))}
            </div>
          </div>
        ) : null}
        <BrandTabs brand={brand} providers={providers} courses={courses} />

        {brand.localPartners?.length ? (
          <section style={{ borderTop: '0.5px solid var(--border-hairline)', marginTop: 56, paddingTop: 40 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 26, color: 'var(--text-brand)', margin: '0 0 20px' }}>Lokale partners &amp; distributeurs</h2>
            <div className="bl-grid-3">
              {brand.localPartners.map((partner, index) => (
                <div key={`${partner.name}-${index}`} style={{ border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', padding: 20 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--text-brand)' }}>{partner.name}</div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)', marginTop: 5 }}>{partner.country}</div>
                  {partner.website ? <a href={partner.website} target="_blank" rel="noopener noreferrer" className="bl-textlink" style={{ display: 'inline-block', marginTop: 12 }}>Website bezoeken</a> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </SiteChrome>
  )
}
