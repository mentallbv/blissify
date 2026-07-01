'use client'

import React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { CourseFilterOptions } from '@/lib/data'

const FORMATS = [
  { value: 'fysiek', label: 'In-persoon' },
  { value: 'online', label: 'Online' },
  { value: 'hybride', label: 'Hybride' },
]

/**
 * Course filter rail. All state lives in the URL query string, so results are
 * server-rendered, shareable and bookmarkable. `lockCategory` hides the category
 * group on a category landing page (the slug is already fixed by the route).
 */
export function FilterSidebar({ options, lockCategory = false }: { options: CourseFilterOptions; lockCategory?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const current = {
    categorie: params.get('categorie') || '',
    locatie: params.get('locatie') || '',
    format: params.get('format') || '',
    erkend: params.get('erkend') === 'true',
    prijsMax: params.get('prijsMax') || '',
  }

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString())
    if (value === null || value === '') next.delete(key)
    else next.set(key, value)
    next.delete('page')
    router.push(`${pathname}?${next.toString()}`, { scroll: false })
  }

  // Debounce the price slider so dragging doesn't fire a request per pixel.
  const [price, setPrice] = React.useState(current.prijsMax || String(options.priceMax))
  React.useEffect(() => {
    setPrice(current.prijsMax || String(options.priceMax))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.prijsMax, options.priceMax])
  const priceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const onPrice = (v: string) => {
    setPrice(v)
    if (priceTimer.current) clearTimeout(priceTimer.current)
    priceTimer.current = setTimeout(() => update('prijsMax', Number(v) >= options.priceMax ? null : v), 350)
  }

  const hasActive = Boolean(current.categorie || current.locatie || current.format || current.erkend || current.prijsMax)

  const labelStyle: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-strong)', marginBottom: 12 }
  const selectStyle: React.CSSProperties = { height: 40, fontSize: 13 }

  return (
    <aside style={{ position: 'sticky', top: 68, alignSelf: 'start', background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '28px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 20, color: 'var(--text-brand)' }}>Filters</span>
        {hasActive ? (
          <button type="button" onClick={() => router.push(pathname, { scroll: false })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-accent)' }}>
            Wissen
          </button>
        ) : null}
      </div>

      {!lockCategory ? (
        <div style={{ marginBottom: 26 }}>
          <div style={labelStyle}>Categorie</div>
          <select className="bl-select" value={current.categorie} onChange={(e) => update('categorie', e.target.value)} style={selectStyle}>
            <option value="">Alle categorieën</option>
            {options.categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
      ) : null}

      <div style={{ marginBottom: 26 }}>
        <div style={labelStyle}>Locatie</div>
        <select className="bl-select" value={current.locatie} onChange={(e) => update('locatie', e.target.value)} style={selectStyle}>
          <option value="">Overal in België</option>
          {options.cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 26 }}>
        <div style={labelStyle}>Type</div>
        <select className="bl-select" value={current.format} onChange={(e) => update('format', e.target.value)} style={selectStyle}>
          <option value="">Alle types</option>
          {FORMATS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 26 }}>
        <div style={labelStyle}>Prijs (tot {Number(price).toLocaleString('nl-BE')} €)</div>
        <input
          type="range"
          min={options.priceMin}
          max={options.priceMax}
          step={50}
          value={Number(price)}
          onChange={(e) => onPrice(e.target.value)}
          style={{ width: '100%', accentColor: 'var(--blissify-forest)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-meta)' }}>
          <span>€ {options.priceMin.toLocaleString('nl-BE')}</span>
          <span>€ {options.priceMax.toLocaleString('nl-BE')}</span>
        </div>
      </div>

      <div>
        <div style={labelStyle}>Erkenning</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <button
            type="button"
            role="switch"
            aria-checked={current.erkend}
            onClick={() => update('erkend', current.erkend ? null : 'true')}
            style={{ width: 34, height: 20, borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer', background: current.erkend ? 'var(--blissify-forest)' : 'var(--neutral-200)', position: 'relative', flex: 'none' }}
          >
            <span style={{ position: 'absolute', top: 2, left: current.erkend ? 16 : 2, width: 16, height: 16, borderRadius: '50%', background: 'var(--blissify-chalk)', transition: 'left .15s ease' }} />
          </button>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 13, color: 'var(--text-body)' }}>Alleen met certificaat</span>
        </label>
      </div>
    </aside>
  )
}
