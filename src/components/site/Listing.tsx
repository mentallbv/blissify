import React from 'react'
import { CourseCard, Tag } from '@/components/ui'
import { categoryTiles, type CourseCardData, type CourseFilterOptions } from '@/lib/data'
import { FilterSidebar } from './FilterSidebar'
import { SortSelect } from './SortSelect'

export function Listing({
  title,
  cards,
  total,
  options,
  activeCategory,
  lockCategory = false,
  showHeader = true,
}: {
  title: string
  cards: CourseCardData[]
  total: number
  options: CourseFilterOptions
  activeCategory?: string
  lockCategory?: boolean
  showHeader?: boolean
}) {
  return (
    <>
      {showHeader ? (
        <>
          {/* Forest header */}
          <section style={{ background: 'var(--surface-dark)' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 32px' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(245,240,234,0.5)' }}>Zoekresultaten</span>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 34, lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--blissify-chalk)', margin: '8px 0 0' }}>
                {title}
              </h1>
            </div>
          </section>

          {/* Category pill bar */}
          <section style={{ background: 'var(--surface-page)', borderBottom: '0.5px solid var(--border-hairline)' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 32px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {categoryTiles.map((c) => (
                <Tag key={c.slug} as="a" href={`/opleidingen/${c.slug}`} active={activeCategory === c.slug}>
                  {c.name}
                </Tag>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {/* Sidebar + results */}
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="bl-listing-grid" style={{ display: 'grid', gridTemplateColumns: '264px 1fr', alignItems: 'start' }}>
          <FilterSidebar options={options} lockCategory={lockCategory} />

          <div style={{ padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, gap: 16 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 13, color: 'var(--text-body)' }}>
                {total} {total === 1 ? 'opleiding' : 'opleidingen'} gevonden
              </span>
              <SortSelect />
            </div>

            {cards.length ? (
              <div className="bl-grid-3">
                {cards.map((c) => (
                  <CourseCard key={c.slug} {...c} />
                ))}
              </div>
            ) : (
              <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 8, padding: 48, textAlign: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)', margin: '0 0 8px' }}>
                  Geen opleidingen gevonden
                </h3>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-meta)', margin: 0 }}>
                  Pas je filters aan of wis ze om meer resultaten te zien.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
