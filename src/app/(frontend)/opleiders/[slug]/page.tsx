import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteChrome, SectionHead } from '@/components/site/SiteChrome'
import { VerifiedBadge, CourseCard, Button, Tag } from '@/components/ui'
import { TrackPageView } from '@/components/site/TrackPageView'
import { getProviderBySlug } from '@/lib/data'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const { provider } = await getProviderBySlug(slug)
  if (!provider) return {}
  return {
    title: `${provider.name} - Geverifieerde opleider | Blissify`,
    description: `${provider.name} is een geverifieerde Blissify-opleider in ${provider.location}, gespecialiseerd in ${provider.speciality.toLowerCase()}.`,
  }
}

export default async function ProviderProfilePage({ params }: Params) {
  const { slug } = await params
  const { provider: p, courses } = await getProviderBySlug(slug)
  if (!p) notFound()

  return (
    <SiteChrome>
      {p.id != null ? <TrackPageView kind="trainer" id={p.id} /> : null}
      {/* Dark header */}
      <header style={{ background: 'var(--surface-dark)' }}>
        <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '48px 32px', display: 'flex', gap: 24, alignItems: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: 8, background: 'var(--surface-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 80px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 40, color: 'var(--blissify-forest)' }}>
              {p.initial}
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 48, lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--blissify-chalk)', margin: 0 }}>
              {p.name}
            </h1>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'rgba(245,240,234,0.7)', margin: '8px 0 12px' }}>
              {p.location}, België · {p.speciality} · Opgericht 2014
            </p>
            <VerifiedBadge />
          </div>
          <Button variant="accent">Contacteer opleider</Button>
        </div>
      </header>

      {/* Bio + contact */}
      <section style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '64px 32px 0' }}>
        <div className="bl-detail-split">
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 28, color: 'var(--text-brand)', margin: '0 0 16px' }}>
              Over {p.name}
            </h2>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', maxWidth: 620, margin: '0 0 14px' }}>
              {p.name} is een geverifieerde Blissify-opleider gespecialiseerd in {p.speciality.toLowerCase()}, gevestigd in{' '}
              {p.location}. De programma’s worden gegeven door praktiserende professionals en zijn erkend in de Belgische
              wellnesssector.
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', maxWidth: 620, margin: '0 0 28px' }}>
              Elke opleiding is gecontroleerd door het Blissify-curatieteam op erkenning, onderwijskwaliteit en
              leerresultaten.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 36 }}>
              {['Sportsmassage', 'Deep tissue', 'Klassieke massage', 'Blessurepreventie', 'Prenatale massage'].map((s) => (
                <Tag key={s} as="span">
                  {s}
                </Tag>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, borderTop: '0.5px solid var(--border-hairline)', paddingTop: 28, maxWidth: 560 }}>
              {[
                ['Locatie', `${p.location}, België`],
                ['Opgericht', '2014'],
                ['Opleidingen op Blissify', `${p.courseCount} opleidingen`],
                ['Talen', 'NL / FR / EN'],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-meta)', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 15, color: 'var(--text-strong)' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 8, padding: 24 }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-meta)', marginBottom: 14 }}>
              Contacteer opleider
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {[
                ['ti-map-pin', `${p.location}, België`],
                ['ti-stack-2', `${p.courseCount} actieve opleidingen`],
                ['ti-rosette-discount-check', 'Geverifieerd sinds 2023'],
              ].map(([ic, t]) => (
                <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'center', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-body)' }}>
                  <i className={'ti ' + ic} style={{ fontSize: 17, color: 'var(--text-meta)' }} />
                  {t}
                </div>
              ))}
            </div>
            <Button variant="primary" fullWidth>
              Vraag informatie aan
            </Button>
          </div>
        </div>
      </section>

      {/* Courses by provider */}
      <section style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '64px 32px 96px' }}>
        <div style={{ marginBottom: 32 }}>
          <SectionHead size={28}>Opleidingen van deze opleider</SectionHead>
        </div>
        {courses.length ? (
          <div className="bl-grid-3">
            {courses.map((c) => (
              <CourseCard key={c.slug} {...c} />
            ))}
          </div>
        ) : (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--text-meta)' }}>
            Deze opleider heeft momenteel geen gepubliceerde opleidingen.
          </p>
        )}
      </section>
    </SiteChrome>
  )
}
