import React from 'react'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/SiteChrome'
import { Eyebrow, Avatar } from '@/components/ui'
import { FilterPills } from '@/components/site/FilterPills'
import { getBrandCards, getBrandFilterOptions } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Merken in de wellnesssector - Aanbieders & Opleidingen',
  description:
    'Ontdek merken die samenwerken met professionele opleiders in de Belgische wellness- en beautysector. Vind erkende opleidingen per merk via Blissify.',
}

const one = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v || '')

export default async function MerkenPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const tag = one(sp.tag) || undefined
  const [{ cards }, tagOptions] = await Promise.all([getBrandCards({ tag }), getBrandFilterOptions()])
  return (
    <SiteChrome>
      <section className="bl-container" style={{ paddingTop: 72, paddingBottom: 32 }}>
        <Eyebrow tone="meta">Merken</Eyebrow>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--fw-display-light)',
            fontSize: 48,
            letterSpacing: '-0.01em',
            color: 'var(--text-brand)',
            lineHeight: 1.1,
            margin: '14px 0 0',
          }}
        >
          Merken op Blissify
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', maxWidth: 640, margin: '20px 0 0' }}>
          Ontdek merken die samenwerken met professionele opleiders in de Belgische wellness- en beautysector.
        </p>
        <div style={{ marginTop: 24 }}>
          <FilterPills paramKey="tag" options={tagOptions} />
        </div>
      </section>

      <section className="bl-container" style={{ paddingTop: 24, paddingBottom: 80 }}>
        {cards.length === 0 ? (
          <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '72px 48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-meta)', margin: 0, maxWidth: 380 }}>
              Geen merken gevonden voor deze filter.
            </p>
          </div>
        ) : (
        <div className="bl-grid-3">
          {cards.map((b) => (
            <a key={b.slug} href={b.href} className="bl-providercard" style={{ display: 'block', padding: 20 }}>
              <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                <Avatar initial={b.initial} src={b.logo} size={44} radius={6} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: '0 0 2px', fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 20, color: 'var(--text-brand)', lineHeight: 1.15 }}>
                    {b.name}
                  </h3>
                  <p style={{ margin: 0, fontFamily: 'var(--font-ui)', fontSize: 'var(--type-xs)', color: 'var(--text-body)', lineHeight: 1.4 }}>{b.sector}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 'var(--space-5)', fontFamily: 'var(--font-ui)', fontSize: 'var(--type-xs)', color: 'var(--text-accent)' }}>
                <span>{b.providerCount} opleiders</span>
                <span style={{ color: 'var(--text-meta)' }}>·</span>
                <span>{b.courseCount} cursussen</span>
              </div>
            </a>
          ))}
        </div>
        )}
      </section>
    </SiteChrome>
  )
}
