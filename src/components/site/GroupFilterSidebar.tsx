'use client'

import React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { MerkenFacets, MerkenGroup } from '@/lib/merken-filters'

/**
 * Left filter column for Vacatures and Werkruimtes, matching the course
 * FilterSidebar (same panel, labels, checkboxes and sticky behaviour).
 * Multi-select groups render as checkboxes, single ones as a select; a group's
 * `clears` resets dependent params (Land resets Stad). Optional search field
 * (`q`) and price range (`prijsMin` / `prijsMax`).
 */
export function GroupFilterSidebar({
  groups,
  facets,
  searchPlaceholder,
  priceRange = false,
}: {
  groups: MerkenGroup[]
  facets: MerkenFacets
  searchPlaceholder?: string
  priceRange?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const get = (k: string) => params.get(k) || ''

  const push = (changes: Record<string, string | null>, clears: string[] = []) => {
    const next = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    clears.forEach((k) => next.delete(k))
    const qs = next.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }
  const toggle = (g: MerkenGroup, value: string) => {
    const cur = get(g.key).split(',').filter(Boolean)
    const next = cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value]
    push({ [g.key]: next.join(',') || null }, g.clears)
  }

  // Debounced text inputs, like the course search field.
  const [q, setQ] = React.useState(get('q'))
  const [min, setMin] = React.useState(get('prijsMin'))
  const [max, setMax] = React.useState(get('prijsMax'))
  React.useEffect(() => setQ(get('q')), [params]) // eslint-disable-line react-hooks/exhaustive-deps
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const later = (fn: () => void) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(fn, 400)
  }

  // Long checkbox groups (e.g. ~100 specialisaties) show 8 options plus the chosen ones until expanded.
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})
  const keys = ['q', 'prijsMin', 'prijsMax', ...groups.map((g) => g.key)]
  const hasActive = keys.some((k) => params.get(k))
  const count = (g: string, v: string) => facets[g]?.[v] ?? 0

  const labelStyle: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-strong)', marginBottom: 12, display: 'block' }
  const selectStyle: React.CSSProperties = { height: 40, fontSize: 13, width: '100%' }
  const box: React.CSSProperties = { height: 40, width: '100%', padding: '0 12px', border: '0.5px solid var(--neutral-200)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-strong)' }

  return (
    <aside className="bl-filter-panel" style={{ position: 'sticky', top: 88, alignSelf: 'start', zIndex: 1, background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '28px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 20, color: 'var(--text-brand)' }}>Filters</span>
        {hasActive ? (
          <button type="button" onClick={() => { setQ(''); setMin(''); setMax(''); router.push(pathname, { scroll: false }) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-accent)' }}>
            Wissen
          </button>
        ) : null}
      </div>

      {searchPlaceholder ? (
        <div style={{ marginBottom: 26 }}>
          <label htmlFor="bl-group-search" style={labelStyle}>Zoeken</label>
          <div style={{ position: 'relative' }}>
            <i className="ti ti-search" aria-hidden="true" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: 'var(--text-meta)', pointerEvents: 'none' }} />
            <input id="bl-group-search" type="search" value={q} placeholder={searchPlaceholder} onChange={(e) => { const v = e.target.value; setQ(v); later(() => push({ q: v.trim() || null })) }} className="bl-select" style={{ ...selectStyle, paddingLeft: 38, backgroundImage: 'none', cursor: 'text' }} />
          </div>
        </div>
      ) : null}

      {groups.map((g) => {
        if (!g.options.length) return null
        const value = get(g.key)
        return (
          <div key={g.key} style={{ marginBottom: 26 }}>
            <span style={labelStyle}>{g.name}</span>
            {g.multi ? (
              <div style={{ display: 'grid', gap: 9 }}>
                {(g.options.length > 12 && !expanded[g.key] ? g.options.filter((o, i) => i < 8 || value.split(',').includes(o.value)) : g.options).map((o, i, shown) => {
                  const on = value.split(',').includes(o.value)
                  const heading = o.group && o.group !== shown[i - 1]?.group ? <div style={{ ...labelStyle, fontSize: 10, margin: i ? '6px 0 0' : 0, color: 'var(--text-meta)' }}>{o.group}</div> : null
                  return (
                    <React.Fragment key={o.value}>
                      {heading}
                      <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-body)' }}>
                        <input type="checkbox" checked={on} onChange={() => toggle(g, o.value)} />
                        <span style={{ flex: 1 }}>{o.label}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-strong)' }}>{count(g.key, o.value)}</span>
                      </label>
                    </React.Fragment>
                  )
                })}
                {g.options.length > 12 ? (
                  <button type="button" onClick={() => setExpanded((x) => ({ ...x, [g.key]: !x[g.key] }))} className="bl-textlink" style={{ justifySelf: 'start', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, padding: 0 }}>
                    {expanded[g.key] ? 'Toon minder' : `Toon alle (${g.options.length})`}
                  </button>
                ) : null}
              </div>
            ) : (
              <select className="bl-select" value={value} onChange={(e) => push({ [g.key]: e.target.value || null }, g.clears)} style={selectStyle} aria-label={g.name}>
                <option value="">Alle</option>
                {Array.from(new Set(g.options.map((o) => o.group || ''))).map((grp) => {
                  const opts = g.options.filter((o) => (o.group || '') === grp)
                  const items = opts.map((o) => <option key={o.value} value={o.value}>{o.label} ({count(g.key, o.value)})</option>)
                  return grp ? <optgroup key={grp} label={grp}>{items}</optgroup> : <React.Fragment key="all">{items}</React.Fragment>
                })}
              </select>
            )}
          </div>
        )
      })}

      {priceRange ? (
        <div>
          <span style={labelStyle}>Huurprijs (€, excl. btw)</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
            <input type="number" min={0} inputMode="decimal" placeholder="Min" aria-label="Minimumprijs" value={min} onChange={(e) => { const v = e.target.value; setMin(v); later(() => push({ prijsMin: v.trim() || null })) }} style={box} />
            <span style={{ color: 'var(--text-meta)' }}>–</span>
            <input type="number" min={0} inputMode="decimal" placeholder="Max" aria-label="Maximumprijs" value={max} onChange={(e) => { const v = e.target.value; setMax(v); later(() => push({ prijsMax: v.trim() || null })) }} style={box} />
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, lineHeight: 1.5, color: 'var(--text-strong)', margin: '8px 0 0' }}>Combineer met &quot;Huurprijs per&quot; om prijzen per dag of per maand te vergelijken.</p>
        </div>
      ) : null}
    </aside>
  )
}
