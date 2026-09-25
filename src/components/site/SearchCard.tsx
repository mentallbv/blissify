'use client'

import React from 'react'
import { Input, Select, Button } from '@/components/ui'

/**
 * Hero search card - Option A (client feedback #1): one broadened search with a
 * top-level toggle that lets the visitor choose what they are looking for -
 * Opleidingen, Merken & leveranciers, or Alles. The title, keyword field,
 * placeholder, location field and button all adapt to the chosen mode, and each
 * mode routes to the right directory with the query params that page expects.
 *
 *  - opleidingen -> /opleidingen (reads `keyword` + `locatie`); this catalogus
 *    already bundles both independent and brand/leverancier opleidingen.
 *  - merken      -> /merken (reads `q`; filters by herkomst, not stad, so the
 *    location field is hidden here).
 *  - alles       -> /opleidingen with the keyword, the broadest catalogus, plus
 *    a shortcut to browse Merken & leveranciers.
 */

type Mode = 'opleidingen' | 'merken' | 'alles'

/**
 * Brands/leveranciers have no city - their geographic dimension is `herkomst`
 * (land van herkomst), which is exactly what /merken filters on. So in the
 * merken mode we show a "Land van herkomst" selector instead of the city one.
 */
const HERKOMST_OPTIONS: { value: string; label: string }[] = [
  { value: 'belgisch', label: 'Belgisch' },
  { value: 'nederlands', label: 'Nederlands' },
  { value: 'europees', label: 'Europees' },
  { value: 'internationaal', label: 'Internationaal' },
]

const MODES: Record<
  Mode,
  {
    label: string
    title: string
    fieldLabel: string
    placeholders: string[]
    button: string
    path: string
    keywordParam: 'keyword' | 'q'
    showLocation: boolean
    showHerkomst?: boolean
  }
> = {
  opleidingen: {
    label: 'Opleidingen',
    title: 'Vind jouw opleiding',
    fieldLabel: 'Wat wil je leren?',
    placeholders: ['massage...', 'nagelstyliste...', 'yoga...', 'aromatherapie...', 'reflexologie...'],
    button: 'Zoek opleidingen',
    path: '/opleidingen',
    keywordParam: 'keyword',
    showLocation: true,
  },
  merken: {
    label: 'Merken & leveranciers',
    title: 'Vind een merk of leverancier',
    fieldLabel: 'Welk merk, product of apparaat zoek je?',
    placeholders: ['huidverzorging...', 'apparatuur...', 'nagelproducten...', 'groothandel...', 'massageolie...'],
    button: 'Zoek merken & leveranciers',
    path: '/merken',
    keywordParam: 'q',
    showLocation: false,
    showHerkomst: true,
  },
  alles: {
    label: 'Alles',
    title: 'Zoek op Blissify',
    fieldLabel: 'Wat of wie zoek je?',
    placeholders: ['opleiding, merk of leverancier...', 'massage...', 'huidverzorging...', 'apparatuur...'],
    button: 'Zoeken',
    path: '/opleidingen',
    keywordParam: 'keyword',
    showLocation: true,
  },
}

const MODE_ORDER: Mode[] = ['opleidingen', 'merken', 'alles']

export function SearchCard({
  cities,
  counts,
}: {
  categories?: { slug: string; name: string }[]
  cities: string[]
  counts: { courses: number; opleiders: number; merken: number }
}) {
  const [mode, setMode] = React.useState<Mode>('opleidingen')
  const cfg = MODES[mode]

  const [idx, setIdx] = React.useState(0)
  React.useEffect(() => {
    setIdx(0)
  }, [mode])
  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % cfg.placeholders.length), 2200)
    return () => clearInterval(t)
  }, [cfg.placeholders.length])

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const keyword = String(fd.get('keyword') || '').trim()
    const locatie = String(fd.get('locatie') || '').trim()
    const herkomst = String(fd.get('herkomst') || '').trim()
    const params = new URLSearchParams()
    if (keyword) params.set(cfg.keywordParam, keyword)
    if (cfg.showLocation && locatie) params.set('locatie', locatie)
    if (cfg.showHerkomst && herkomst) params.set('herkomst', herkomst)
    const qs = params.toString()
    window.location.assign(qs ? `${cfg.path}?${qs}` : cfg.path)
  }

  const nf = (n: number) => n.toLocaleString('nl-BE')

  return (
    <form
      onSubmit={onSubmit}
      action={cfg.path}
      method="get"
      style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-lg)', padding: 24 }}
    >
      {/* Top-level toggle: what are you looking for? */}
      <div
        role="tablist"
        aria-label="Wat zoek je?"
        style={{ display: 'flex', gap: 6, background: 'var(--surface-page, rgba(26,46,37,0.04))', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-pill)', padding: 4, marginBottom: 18, flexWrap: 'wrap' }}
      >
        {MODE_ORDER.map((m) => {
          const active = m === mode
          return (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(m)}
              style={{
                flex: '1 1 auto',
                minWidth: 0,
                whiteSpace: 'nowrap',
                border: 0,
                cursor: 'pointer',
                borderRadius: 'var(--radius-pill)',
                background: active ? 'var(--surface-dark)' : 'transparent',
                color: active ? 'var(--blissify-chalk)' : 'var(--text-body)',
                padding: '9px 12px',
                fontFamily: 'var(--font-ui)',
                fontWeight: 'var(--fw-ui-medium)',
                fontSize: 12.5,
                transition: 'background 0.14s ease, color 0.14s ease',
              }}
            >
              {MODES[m].label}
            </button>
          )
        })}
      </div>

      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)', marginBottom: 18 }}>
        {cfg.title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input name="keyword" label={cfg.fieldLabel} icon={<i className="ti ti-search" />} placeholder={cfg.placeholders[idx]} />
        {cfg.showLocation ? (
          <Select name="locatie" label="Locatie" placeholder="Overal in België" options={cities} />
        ) : null}
        {cfg.showHerkomst ? (
          <Select name="herkomst" label="Land van herkomst" placeholder="Alle landen" options={HERKOMST_OPTIONS} />
        ) : null}
        <div style={{ marginTop: 4 }}>
          <Button variant="accent" fullWidth type="submit">
            {cfg.button}
          </Button>
        </div>
        {mode === 'alles' ? (
          <div style={{ textAlign: 'center', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 12, color: 'var(--text-meta)', marginTop: 2 }}>
            Op zoek naar een merk of leverancier?{' '}
            <a href="/merken" className="bl-textlink">Blader door Merken &amp; Leveranciers</a>
          </div>
        ) : null}
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 12, color: 'var(--text-meta)', marginTop: 2 }}>
          {nf(counts.courses)} opleidingen · {nf(counts.opleiders)} opleiders · {nf(counts.merken)} Merken
        </div>
      </div>
    </form>
  )
}
