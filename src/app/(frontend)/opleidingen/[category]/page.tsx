import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteChrome } from '@/components/site/SiteChrome'
import { Faq } from '@/components/site/Faq'
import { Listing } from '@/components/site/Listing'
import { getCourseCards, getCourseFilterOptions, getCategoryLanding } from '@/lib/data'
import { parseCourseFilters } from '@/lib/filters'
import { CATEGORY_SLUGS } from '@/lib/categories'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ category: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params
  const c = await getCategoryLanding(category)
  if (!c) return {}
  return { title: c.metaTitle, description: c.metaDescription }
}

export default async function CategoryPage({ params, searchParams }: Params) {
  const { category } = await params
  const content = await getCategoryLanding(category)
  if (!content) notFound()

  // Filters apply within this category: the route slug always wins over ?categorie.
  const filters = { ...parseCourseFilters(await searchParams), categorySlug: category }
  const [{ cards, total }, options] = await Promise.all([
    getCourseCards({ ...filters, limit: 24 }),
    getCourseFilterOptions(),
  ])

  return (
    <SiteChrome>
      {/* Editorial hero */}
      <section className="bl-container" style={{ paddingTop: 32 }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 'var(--type-xs)', color: 'var(--text-body)' }}>
          <a href="/opleidingen">Opleidingen</a> <span style={{ color: 'var(--text-meta)' }}>→</span> {content.name}
        </div>
        <div className="bl-hero-split" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 56, alignItems: 'center', padding: '36px 0 48px' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 'var(--type-label)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-accent)' }}>
              Categorie · {content.name}
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 52, lineHeight: 1.08, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: '14px 0 0', textWrap: 'balance' }}>
              {content.h1}
            </h1>
            <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', maxWidth: 560, margin: '20px 0 0' }}>
              {content.heroIntro}
            </p>
          </div>
          <div style={{ width: '100%', height: 300, borderRadius: 'var(--radius-md)', background: 'var(--surface-dark)' }} />
        </div>
      </section>

      {/* SEO intro (2-col) */}
      <section style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)', borderBottom: '0.5px solid var(--border-hairline)' }}>
        <div className="bl-2col bl-container" style={{ paddingTop: 64, paddingBottom: 64, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'start' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', margin: 0 }}>{content.seoIntro}</p>
          {content.section ? (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 28, color: 'var(--text-brand)', margin: '0 0 14px', lineHeight: 1.15 }}>{content.section.title}</h2>
              <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-body)', margin: 0 }}>{content.section.body}</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* Filters + results (category locked) */}
      <section className="bl-container" style={{ paddingTop: 48 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 28, color: 'var(--text-brand)', margin: '0 0 18px', lineHeight: 1.15 }}>
          Vind de opleiding die bij jou past
        </h2>
      </section>
      <Listing title="" cards={cards} total={total} options={options} activeCategory={category} lockCategory showHeader={false} />

      {/* FAQ */}
      {content.faqs ? (
        <section style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)', marginTop: 88 }}>
          <div className="bl-container" style={{ paddingTop: 80, paddingBottom: 80 }}>
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
