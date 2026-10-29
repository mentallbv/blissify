import React from 'react'
import { CourseCard } from '@/components/ui'
import { type CourseCardData, type CourseFilterOptions } from '@/lib/data'
import { HubHeader } from './HubContent'
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
  header,
}: {
  title: string
  cards: CourseCardData[]
  total: number
  options: CourseFilterOptions
  activeCategory?: string
  lockCategory?: boolean
  showHeader?: boolean
  header?: { eyebrow: string; title: string; intro: string }
}) {
  return (
    <>
      {showHeader ? (
        <HubHeader
          eyebrow={header?.eyebrow || 'Opleidingen'}
          title={header?.title || title}
          intro={header?.intro || ''}
        />
      ) : null}
      {/* Category chips removed (round 3 #1.2 / copy 10/2026): the filters cover
          it and the category pages are linked as text below the hub. */}

      {/* Sidebar + results */}
      <div className="bl-container bl-listing-section" style={{ paddingTop: 40, paddingBottom: 96 }}>
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
