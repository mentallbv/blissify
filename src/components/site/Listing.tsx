import React from 'react'
import { CourseCard, Select, Tag } from '@/components/ui'
import { categoryTiles, type CourseCardData } from '@/lib/data'

const FILTER_GROUPS = [
  { title: 'Lesmoment', options: [['Dag', '64'], ['Avondschool', '48'], ['Weekend', '37'], ['Online', '52']] },
  { title: 'Prijs', options: [['Tot € 500', '58'], ['€ 500 - € 1.000', '61'], ['€ 1.000+', '23']] },
  { title: 'Duur', options: [['Onder 4 weken', '72'], ['4 - 8 weken', '49'], ['8 weken+', '21']] },
]

function CheckRow({ label, count }: { label: string; count?: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', cursor: 'pointer' }}>
      <span style={{ width: 16, height: 16, borderRadius: 3, flex: 'none', border: '0.5px solid var(--neutral-200)', background: 'var(--surface-card)' }} />
      <span style={{ flex: 1, fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 13, color: 'var(--text-body)' }}>{label}</span>
      {count ? <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)' }}>{count}</span> : null}
    </label>
  )
}

export function Listing({
  title,
  cards,
  total,
  activeCategory,
}: {
  title: string
  cards: CourseCardData[]
  total: number
  activeCategory?: string
}) {
  return (
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

      {/* Sidebar + results */}
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="bl-listing-grid" style={{ display: 'grid', gridTemplateColumns: '264px 1fr', alignItems: 'start' }}>
          <aside style={{ position: 'sticky', top: 68, alignSelf: 'start', background: 'var(--surface-card)', borderRight: '0.5px solid var(--border-hairline)', padding: '28px 24px', minHeight: 'calc(100vh - 68px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 20, color: 'var(--text-brand)' }}>Filters</span>
              <a href="/opleidingen" style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 12, color: 'var(--text-accent)' }}>Wissen</a>
            </div>
            {FILTER_GROUPS.map((g) => (
              <div key={g.title} style={{ marginBottom: 26 }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-strong)', marginBottom: 12 }}>{g.title}</div>
                {g.options.map(([label, count]) => (
                  <CheckRow key={label} label={label} count={count} />
                ))}
              </div>
            ))}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-strong)', marginBottom: 12 }}>Erkenning</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <span style={{ width: 34, height: 20, borderRadius: 20, background: 'var(--blissify-forest)', flex: 'none', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: 'var(--blissify-chalk)' }} />
                </span>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 13, color: 'var(--text-body)' }}>Alleen erkend certificaat</span>
              </label>
            </div>
          </aside>

          <div style={{ padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, gap: 16 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 13, color: 'var(--text-body)' }}>
                {total} {total === 1 ? 'opleiding' : 'opleidingen'} gevonden
              </span>
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
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 48 }}>
              {['1', '2', '3', '4', '…', '12'].map((p, i) => (
                <span
                  key={i}
                  style={{
                    minWidth: 36,
                    height: 36,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 6,
                    border: '0.5px solid ' + (p === '1' ? 'var(--blissify-forest)' : 'var(--border-hairline)'),
                    background: p === '1' ? 'var(--blissify-forest)' : 'var(--surface-card)',
                    color: p === '1' ? 'var(--blissify-chalk)' : 'var(--text-body)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
