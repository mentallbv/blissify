import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteChrome } from '@/components/site/SiteChrome'
import { Faq } from '@/components/site/Faq'
import { CourseCard, Select, Tag } from '@/components/ui'
import { getCourseCards } from '@/lib/data'
import { CATEGORY_CONTENT, CATEGORY_SLUGS } from '@/lib/categories'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ category: string }> }

const PILLS = ['Avondschool', 'Weekend', 'Online', 'Erkend certificaat', 'Antwerpen', 'Gent', 'Limburg']

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params
  const c = CATEGORY_CONTENT[category]
  if (!c) return {}
  return { title: c.metaTitle, description: c.metaDescription }
}

export default async function CategoryPage({ params }: Params) {
  const { category } = await params
  const content = CATEGORY_CONTENT[category]
  if (!content) notFound()

  const { cards, total } = await getCourseCards({ categorySlug: category, limit: 12 })

  return (
    <SiteChrome>
      {/* Editorial hero */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px 0' }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 12, color: 'var(--text-body)' }}>
          <a href="/opleidingen">Opleidingen</a> <span style={{ color: 'var(--text-meta)' }}>→</span> {content.name}
        </div>
        <div className="bl-hero-split" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 56, alignItems: 'center', padding: '36px 0 48px' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-accent)' }}>
              Categorie · {content.name}
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 52, lineHeight: 1.08, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: '14px 0 0', textWrap: 'balance' }}>
              {content.h1}
            </h1>
            <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', maxWidth: 560, margin: '20px 0 0' }}>
              {content.heroIntro}
            </p>
          </div>
          <div style={{ width: '100%', height: 300, borderRadius: 8, background: 'var(--surface-dark)' }} />
        </div>
      </section>

      {/* SEO intro (2-col) */}
      <section style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)', borderBottom: '0.5px solid var(--border-hairline)' }}>
        <div className="bl-2col" style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'start' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', margin: 0 }}>{content.seoIntro}</p>
          {content.section ? (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 28, color: 'var(--text-brand)', margin: '0 0 14px', lineHeight: 1.15 }}>{content.section.title}</h2>
              <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-body)', margin: 0 }}>{content.section.body}</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* Filter pills + results */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 32px 0' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 28, color: 'var(--text-brand)', margin: '0 0 18px', lineHeight: 1.15 }}>
          Vind de opleiding die bij jou past
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
          {PILLS.map((p, i) => (
            <Tag key={p} as="span" active={i === 0}>
              {p}
            </Tag>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 13, color: 'var(--text-body)' }}>{total} opleidingen gevonden</span>
          <div style={{ width: 220 }}>
            <Select
              options={[
                { value: 'relevant', label: 'Meest relevant' },
                { value: 'price-asc', label: 'Prijs: laag naar hoog' },
                { value: 'recent', label: 'Nieuwst eerst' },
              ]}
            />
          </div>
        </div>
        <div className="bl-grid-3">
          {cards.map((c) => (
            <CourseCard key={c.slug} {...c} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      {content.faqs ? (
        <section style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)', marginTop: 88 }}>
          <div style={{ maxWidth: 820, margin: '0 auto', padding: '80px 32px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 40, letterSpacing: '-0.01em', color: 'var(--text-brand)', lineHeight: 1.1, margin: '0 0 40px', textWrap: 'balance' }}>
              Veelgestelde vragen over de opleiding {content.name.toLowerCase()}
            </h2>
            <Faq items={content.faqs} variant="list" defaultOpen={-1} />
          </div>
        </section>
      ) : null}
    </SiteChrome>
  )
}

export function generateStaticParams() {
  return CATEGORY_SLUGS.map((category) => ({ category }))
}
