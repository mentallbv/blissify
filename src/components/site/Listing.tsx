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
            <div className="bl-container" style={{ paddingTop: 36, paddingBottom: 36 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 'var(--type-label)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(245,240,234,0.5)' }}>Zoekresultaten</span>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 34, lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--blissify-chalk)', margin: '8px 0 0' }}>
                {title}
              </h1>
            </div>
          </section>

          {/* Category pill bar */}
          <section style={{ background: 'var(--surface-page)', borderBottom: '0.5px solid var(--border-hairline)' }}>
            <div className="bl-container" style={{ paddingTop: 14, paddingBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
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
      <div className="bl-container" style={{ paddingTop: 40, paddingBottom: 96 }}>
        <div className="bl-listing-grid" style={{ display: 'grid', gridTemplateColumns: '264px 1fr', alignItems: 'start', gap: 40 }}>
          <FilterSidebar options={options} lockCategory={lockCategory} />

          <div style={{ minHeight: 480 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, gap: 16, minHeight: 40 }}>
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
              <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '72px 48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)', margin: '0 0 8px' }}>
                  Geen opleidingen gevonden
                </h3>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-meta)', margin: 0, maxWidth: 380 }}>
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
