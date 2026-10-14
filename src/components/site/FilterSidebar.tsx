'use client'

import React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { CourseFilterOptions } from '@/lib/data'
import { CategoryPickerMenu } from './CategoryPickerMenu'
import { CERTIFICATION_OPTIONS } from '@/lib/certifications'
import { LocationSelect, encodeLocation, decodeLocation } from './LocationSelect'
import { COURSE_TYPES } from '@/lib/course-types'

// Client round 2 #2.9 / #3.7: every type the form offers, plus where it takes
// place (a "Beide" course counts for both).
const FORMATS = [
  { value: 'fysiek', label: 'Op locatie' },
  { value: 'online', label: 'Online' },
]
const AUDIENCES = [
  { value: 'beginner-friendly', label: 'Beginner friendly' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert-advanced', label: 'Expert / Advanced' },
]
// Client round 2 #3.9.
const LANGUAGES = [
  { value: 'nl', label: 'Nederlands' },
  { value: 'fr', label: 'Frans' },
  { value: 'en', label: 'Engels' },
]
// Client round 2 #3.8: Online/Praktijkopleiding are covered by Type; the last
// two options come from the course's model and participants fields.
const PRACTICAL = [
  { value: 'een-dag', label: '1-daagse opleiding' },
  { value: 'meerdere-dagen', label: 'Meerdere dagen' },
  { value: 'op-locatie', label: 'Op locatie' },
  { value: 'geen-model', label: 'Geen eigen model nodig' },
  { value: 'prive', label: 'Privé – één-op-één' },
]
const FOCUS = [
  { value: 'huidverbeterend', label: 'Huidverbeterend' },
  { value: 'medisch-esthetisch', label: 'Medisch-esthetisch' },
  { value: 'holistisch', label: 'Holistisch' },
  { value: 'ontspannend', label: 'Ontspannend' },
  { value: 'cosmetisch', label: 'Cosmetisch' },
  { value: 'therapeutisch', label: 'Therapeutisch' },
  { value: 'energetisch', label: 'Energetisch' },
]
// Same options as the course form (client round 2, section 6).
const CERTIFICATIONS = CERTIFICATION_OPTIONS.map((o) => ({ value: o.value as string, label: o.label as string }))

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
    land: params.get('land') || '',
    format: params.get('format') || '',
    type: params.get('type') || '',
    aanbieder: params.get('aanbieder') || '',
    doelgroep: params.get('doelgroep') || '',
    taal: params.get('taal') || '',
    praktisch: params.get('praktisch') || '',
    focus: params.get('focus') || '',
    certificering: params.get('certificering') || '',
    gratis: params.get('gratis') === 'true',
    prijsMax: params.get('prijsMax') || '',
  }

  // Client round 2 #3.2: when a filter leaves fewer results the page gets
  // shorter, the browser pulls the scroll position back and the sticky panel
  // jumped with it. Moving the page to where the results start first keeps the
  // panel exactly where it is on screen (it is already pinned under the header
  // there); only the results restart at the top.
  const keepPanelInPlace = () => {
    const grid = document.querySelector('.bl-listing-grid')
    if (!grid || !window.matchMedia('(min-width: 861px)').matches) return
    const pinnedAt = grid.getBoundingClientRect().top + window.scrollY - 88
    if (window.scrollY > pinnedAt) window.scrollTo({ top: pinnedAt })
  }

  const updateMany = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString())
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === '') next.delete(key)
      else next.set(key, value)
    }
    next.delete('page')
    keepPanelInPlace()
    router.push(`${pathname}?${next.toString()}`, { scroll: false })
  }
  const update = (key: string, value: string | null) => updateMany({ [key]: value })
  const toggleCsv = (key: 'doelgroep' | 'taal' | 'praktisch' | 'focus' | 'certificering', value: string) => {
    const selected = current[key].split(',').filter(Boolean)
    const next = selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]
    update(key, next.length ? next.join(',') : null)
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

  const hasAdvanced = Boolean(current.praktisch || current.focus || current.certificering || current.gratis || current.prijsMax)
  const [moreOpen, setMoreOpen] = React.useState(hasAdvanced)
  const hasActive = Boolean(current.categorie || current.locatie || current.land || current.format || current.type || current.aanbieder || current.doelgroep || current.taal || hasAdvanced)

  // Category picker (search + A-Z), shared with /opleiders and /merken. Single-
  // select here: the course `categorie` param is one slug (a main includes its
  // subs via the query layer). Options carry the full taxonomy with each sub's
  // main as `group`.
  const catNameBySlug = React.useMemo(() => new Map(options.categories.map((c) => [c.slug, c.name])), [options.categories])
  // Client round 2 #3.3: main categories are no longer selectable; each sub
  // already shows its main in small text. A main without subs stays selectable.
  const pickerOptions = React.useMemo(() => {
    const hasSubs = new Set(options.categories.map((c) => c.parentSlug).filter(Boolean))
    return options.categories
      .filter((c) => c.parentSlug || !hasSubs.has(c.slug))
      .map((c) => ({ value: c.slug, label: c.name, group: c.parentSlug ? catNameBySlug.get(c.parentSlug) : undefined }))
  }, [options.categories, catNameBySlug])
  const selectedCatLabel = current.categorie ? catNameBySlug.get(current.categorie) || 'Categorie' : 'Alle categorieën'
  const [catOpen, setCatOpen] = React.useState(false)
  const catRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (!catOpen) return
    const onDoc = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [catOpen])

  const labelStyle: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-strong)', marginBottom: 12 }
  const selectStyle: React.CSSProperties = { height: 40, fontSize: 13 }

  return (
    <aside className={'bl-filter-panel' + (catOpen ? ' is-cat-open' : '')} style={{ position: 'sticky', top: 88, alignSelf: 'start', zIndex: catOpen ? 40 : 1, background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '28px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 20, color: 'var(--text-brand)' }}>Filters</span>
        {hasActive ? (
          <button type="button" onClick={() => {
            keepPanelInPlace()
            router.push(pathname, { scroll: false })
          }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-accent)' }}>
            Wissen
          </button>
        ) : null}
      </div>

      {!lockCategory ? (
        <div style={{ marginBottom: 26, position: 'relative' }} ref={catRef}>
          <div style={labelStyle}>Categorie</div>
          <button
            type="button"
            onClick={() => setCatOpen((o) => !o)}
            className="bl-select"
            style={{ ...selectStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', textAlign: 'left', cursor: 'pointer', background: 'var(--surface-card)' }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: current.categorie ? 'var(--text-strong)' : 'var(--text-meta)' }}>{selectedCatLabel}</span>
            <i className={`ti ti-chevron-${catOpen ? 'up' : 'down'}`} style={{ fontSize: 15, flex: 'none', color: 'var(--text-meta)' }} />
          </button>
          {catOpen ? (
            <div style={{ position: 'absolute', top: 72, left: 0, zIndex: 50, background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', boxShadow: '0 12px 34px rgba(90, 105, 124,0.12)', padding: 16 }}>
              <CategoryPickerMenu
                options={pickerOptions}
                selected={current.categorie ? [current.categorie] : []}
                multi={false}
                counts={options.categoryCounts}
                onToggle={(v) => {
                  update('categorie', v === current.categorie ? null : v)
                  setCatOpen(false)
                }}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      <div style={{ marginBottom: 26 }}>
        <div style={labelStyle}>Type aanbieder</div>
        <select className="bl-select" value={current.aanbieder} onChange={(e) => update('aanbieder', e.target.value)} style={selectStyle}>
          <option value="">Alle aanbieders</option>
          <option value="trainer">Onafhankelijke Opleiders</option>
          <option value="brand">Merken &amp; Partners</option>
        </select>
      </div>

      <div style={{ marginBottom: 26 }}>
        <div style={labelStyle}>Niveau</div>
        <CheckOptions options={AUDIENCES} selected={current.doelgroep} onToggle={(value) => toggleCsv('doelgroep', value)} />
      </div>

      <div style={{ marginBottom: 26 }}>
        <div style={labelStyle}>Taal van de opleiding</div>
        <CheckOptions options={LANGUAGES} selected={current.taal} onToggle={(value) => toggleCsv('taal', value)} />
      </div>

      <div style={{ marginBottom: 26 }}>
        <div style={labelStyle}>Locatie</div>
        <LocationSelect
          cities={options.citiesByCountry}
          value={encodeLocation(current.locatie, current.land)}
          onChange={(e) => updateMany(decodeLocation(e.target.value))}
          style={selectStyle}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={labelStyle}>Type opleiding</div>
        <select className="bl-select" value={current.type} onChange={(e) => update('type', e.target.value)} style={selectStyle}>
          <option value="">Alle types</option>
          {COURSE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={labelStyle}>Online of op locatie</div>
        <select className="bl-select" value={current.format} onChange={(e) => update('format', e.target.value)} style={selectStyle}>
          <option value="">Beide</option>
          {FORMATS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      <button type="button" onClick={() => setMoreOpen((open) => !open)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 0, borderTop: '0.5px solid var(--border-hairline)', background: 'none', padding: '18px 0', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 13, color: 'var(--text-strong)' }}>
        Meer filters
        <i className={`ti ti-chevron-${moreOpen ? 'up' : 'down'}`} />
      </button>

      {moreOpen ? <>
      <div style={{ marginBottom: 26 }}>
        <div style={labelStyle}>Praktisch</div>
        <CheckOptions options={PRACTICAL} selected={current.praktisch} onToggle={(value) => toggleCsv('praktisch', value)} />
      </div>

      <div style={{ marginBottom: 26 }}>
        <div style={labelStyle}>Focus &amp; filosofie</div>
        <CheckOptions options={FOCUS} selected={current.focus} onToggle={(value) => toggleCsv('focus', value)} />
      </div>

      <div style={{ marginBottom: 26 }}>
        {/* Client round 2 #3.10/#3.12: Gratis belongs with the price, and course prices are incl. btw. */}
        <div style={labelStyle}>
          Prijs incl. btw ({Number(price) >= options.priceMax ? 'alle prijzen' : `tot € ${Number(price).toLocaleString('nl-BE')}`})
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-body)', marginBottom: 12 }}>
          <input type="checkbox" checked={current.gratis} onChange={() => update('gratis', current.gratis ? null : 'true')} />
          Enkel gratis opleidingen
        </label>
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
          <span>€ {options.priceMax.toLocaleString('nl-BE')}+</span>
        </div>
      </div>

      <div>
        <div style={labelStyle}>Certificaten, diploma&apos;s &amp; erkenningen</div>
        <CheckOptions options={CERTIFICATIONS} selected={current.certificering} onToggle={(value) => toggleCsv('certificering', value)} />
      </div>
      </> : null}
    </aside>
  )
}

function CheckOptions({
  options,
  selected,
  onToggle,
}: {
  options: { value: string; label: string }[]
  selected: string
  onToggle: (value: string) => void
}) {
  const active = selected.split(',').filter(Boolean)
  return (
    <div style={{ display: 'grid', gap: 9 }}>
      {options.map((option) => (
        <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-body)' }}>
          <input type="checkbox" checked={active.includes(option.value)} onChange={() => onToggle(option.value)} />
          {option.label}
        </label>
      ))}
    </div>
  )
}
