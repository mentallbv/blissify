'use client'

import React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { CourseFilterOptions } from '@/lib/data'
import { CategoryPickerMenu } from './CategoryPickerMenu'

const FORMATS = [
  { value: 'fysiek', label: 'In-persoon' },
  { value: 'online', label: 'Online' },
  { value: 'hybride', label: 'Hybride' },
]
const AUDIENCES = [
  { value: 'beginner-friendly', label: 'Beginner friendly' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert-advanced', label: 'Expert / Advanced' },
  { value: 'professional-only', label: 'Professional only' },
  { value: 'startende-ondernemer', label: 'Startende ondernemer' },
]
const PRACTICAL = [
  { value: 'online', label: 'Online' },
  { value: 'praktijkopleiding', label: 'Praktijkopleiding' },
  { value: 'een-dag', label: '1-daagse opleiding' },
  { value: 'meerdere-dagen', label: 'Meerdere dagen' },
  { value: 'op-locatie', label: 'Op locatie' },
  { value: 'kleine-groepen', label: 'Kleine groepen (<12)' },
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
const CERTIFICATIONS = [
  { value: 'certificate-included', label: 'Certificaat inbegrepen' },
  { value: 'diploma-possible', label: 'Diploma mogelijk' },
  { value: 'accredited-recognized', label: 'Geaccrediteerd / Erkend' },
  { value: 'industry-recognized', label: 'Branche-erkend (ANBOS / ProBeauty)' },
  { value: 'mbo-recognized', label: 'MBO-erkend (Nederland)' },
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
    aanbieder: params.get('aanbieder') || '',
    doelgroep: params.get('doelgroep') || '',
    praktisch: params.get('praktisch') || '',
    focus: params.get('focus') || '',
    certificering: params.get('certificering') || '',
    erkend: params.get('erkend') === 'true',
    nieuw: params.get('nieuw') === 'true',
    populair: params.get('populair') === 'true',
    gratis: params.get('gratis') === 'true',
    prijsMax: params.get('prijsMax') || '',
  }

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString())
    if (value === null || value === '') next.delete(key)
    else next.set(key, value)
    next.delete('page')
    router.push(`${pathname}?${next.toString()}`, { scroll: false })
  }
  const toggleCsv = (key: 'doelgroep' | 'praktisch' | 'focus' | 'certificering', value: string) => {
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

  const hasAdvanced = Boolean(current.praktisch || current.focus || current.certificering || current.erkend || current.nieuw || current.populair || current.gratis || current.prijsMax)
  const [moreOpen, setMoreOpen] = React.useState(hasAdvanced)
  const hasActive = Boolean(current.categorie || current.locatie || current.format || current.aanbieder || current.doelgroep || hasAdvanced)

  // Category picker (search + A-Z), shared with /opleiders and /merken. Single-
  // select here: the course `categorie` param is one slug (a main includes its
  // subs via the query layer). Options carry the full taxonomy with each sub's
  // main as `group`.
  const catNameBySlug = React.useMemo(() => new Map(options.categories.map((c) => [c.slug, c.name])), [options.categories])
  const pickerOptions = React.useMemo(
    () => options.categories.map((c) => ({ value: c.slug, label: c.name, group: c.parentSlug ? catNameBySlug.get(c.parentSlug) : undefined })),
    [options.categories, catNameBySlug],
  )
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
    <aside style={{ position: 'sticky', top: 68, alignSelf: 'start', zIndex: catOpen ? 40 : 1, background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '28px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 20, color: 'var(--text-brand)' }}>Filters</span>
        {hasActive ? (
          <button type="button" onClick={() => router.push(pathname, { scroll: false })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-accent)' }}>
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
            <div style={{ position: 'absolute', top: 72, left: 0, zIndex: 50, background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', boxShadow: '0 12px 34px rgba(26,46,37,0.12)', padding: 16 }}>
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
        <div style={labelStyle}>Niveau &amp; doelgroep</div>
        <CheckOptions options={AUDIENCES} selected={current.doelgroep} onToggle={(value) => toggleCsv('doelgroep', value)} />
      </div>

      <div style={{ marginBottom: 26 }}>
        <div style={labelStyle}>Locatie</div>
        <select className="bl-select" value={current.locatie} onChange={(e) => update('locatie', e.target.value)} style={selectStyle}>
          <option value="">Overal in België</option>
          {options.cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={labelStyle}>Type</div>
        <select className="bl-select" value={current.format} onChange={(e) => update('format', e.target.value)} style={selectStyle}>
          <option value="">Alle types</option>
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
        <div style={labelStyle}>Certificaat</div>
        <CheckOptions options={CERTIFICATIONS} selected={current.certificering} onToggle={(value) => toggleCsv('certificering', value)} />
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
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 13, color: 'var(--text-body)' }}>Certificaat verstrekt</span>
        </label>
      </div>
      <div style={{ display: 'grid', gap: 10, marginTop: 22 }}>
        {[
          ['nieuw', 'Nieuwe opleiding', current.nieuw],
          ['populair', 'Trending / populair', current.populair],
          ['gratis', 'Gratis', current.gratis],
        ].map(([key, label, active]) => (
          <label key={String(key)} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-body)' }}>
            <input type="checkbox" checked={Boolean(active)} onChange={() => update(String(key), active ? null : 'true')} />
            {String(label)}
          </label>
        ))}
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
