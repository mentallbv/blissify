'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MERKEN_GROUPS, type MerkenFacets, type MerkenGroup } from '@/lib/merken-filters'

/**
 * Envato-style filter bar for Merken & Leveranciers. A horizontal row of
 * collapsed pills: simple groups open a small dropdown, the Categorie/Producttype
 * group opens a multi-column mega-menu with checkboxes. URL-driven and reused on
 * both the homepage (quick access, navigates to /merken) and the /merken page.
 * The whole bar can be collapsed since not everyone needs the filters.
 */
export function MerkenFilterBar({ facets, basePath = '/merken' }: { facets: MerkenFacets; basePath?: string }) {
  const router = useRouter()
  const sp = useSearchParams()
  const [openKey, setOpenKey] = React.useState<string | null>(null)
  const [collapsed, setCollapsed] = React.useState(false)

  const getVals = (key: string): string[] => {
    const v = sp.get(key)
    return v ? v.split(',').filter(Boolean) : []
  }

  const pushKey = (key: string, vals: string[]) => {
    const next = new URLSearchParams(Array.from(sp.entries()))
    if (vals.length) next.set(key, vals.join(','))
    else next.delete(key)
    const qs = next.toString()
    router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false })
  }

  const toggle = (group: MerkenGroup, value: string) => {
    const cur = getVals(group.key)
    if (group.multi) {
      pushKey(group.key, cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value])
    } else {
      pushKey(group.key, cur.includes(value) ? [] : [value])
      setOpenKey(null)
    }
  }

  const clearAll = () => {
    const next = new URLSearchParams(Array.from(sp.entries()))
    MERKEN_GROUPS.forEach((g) => next.delete(g.key))
    const qs = next.toString()
    router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false })
    setOpenKey(null)
  }

  const totalActive = MERKEN_GROUPS.reduce((n, g) => n + getVals(g.key).length, 0)
  const count = (group: string, value: string) => facets[group]?.[value] ?? 0

  if (collapsed) {
    return (
      <button type="button" onClick={() => setCollapsed(false)} className="bl-btn bl-btn--ghost bl-btn--sm">
        <i className="ti ti-filter" style={{ fontSize: 16 }} /> Toon filters{totalActive ? ` (${totalActive})` : ''}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      {MERKEN_GROUPS.map((g) => {
        const active = getVals(g.key)
        const open = openKey === g.key
        const isMega = g.ui === 'mega'
        return (
          <div key={g.key} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setOpenKey(open ? null : g.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                height: 40,
                padding: '0 14px',
                borderRadius: 'var(--radius-pill)',
                border: '0.5px solid ' + (active.length ? 'var(--blissify-forest)' : 'var(--border-strong)'),
                background: active.length ? 'var(--blissify-forest)' : 'var(--surface-card)',
                color: active.length ? 'var(--blissify-chalk)' : 'var(--text-strong)',
                fontFamily: 'var(--font-ui)',
                fontWeight: 'var(--fw-ui-medium)',
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {g.name}
              {active.length ? <span style={{ opacity: 0.85 }}>({active.length})</span> : null}
              <i className={`ti ti-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: 15 }} />
            </button>

            {open ? (
              <div
                style={{
                  position: 'absolute',
                  top: 46,
                  left: 0,
                  zIndex: 50,
                  background: 'var(--surface-card)',
                  border: '0.5px solid var(--border-hairline)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 12px 34px rgba(26,46,37,0.12)',
                  padding: isMega ? 20 : 8,
                  width: isMega ? 520 : 240,
                }}
              >
                <div style={isMega ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px' } : undefined}>
                  {g.options.map((o) => {
                    const on = active.includes(o.value)
                    const n = count(g.key, o.value)
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => toggle(g, o.value)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          width: '100%',
                          textAlign: 'left',
                          padding: '9px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: 'none',
                          background: on ? 'var(--surface-page)' : 'transparent',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-ui)',
                          fontSize: 13,
                          color: 'var(--text-strong)',
                        }}
                      >
                        <span
                          style={{
                            width: 16,
                            height: 16,
                            flex: 'none',
                            borderRadius: g.multi ? 4 : '50%',
                            border: '0.5px solid ' + (on ? 'var(--blissify-forest)' : 'var(--border-strong)'),
                            background: on ? 'var(--blissify-forest)' : 'transparent',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {on ? <i className="ti ti-check" style={{ fontSize: 11, color: 'var(--blissify-chalk)' }} /> : null}
                        </span>
                        <span style={{ flex: 1 }}>{o.label}</span>
                        <span style={{ color: 'var(--text-meta)', fontSize: 12 }}>({n})</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
        )
      })}

      {totalActive ? (
        <button type="button" onClick={clearAll} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-accent)' }}>
          Wis filters
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => setCollapsed(true)}
        style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        <i className="ti ti-eye-off" style={{ fontSize: 15 }} /> Verberg filters
      </button>
    </div>
  )
}
