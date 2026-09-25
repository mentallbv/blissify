'use client'

import React from 'react'
import type { MerkenOption } from '@/lib/merken-filters'

/**
 * Scalable category picker used inside the filter bar's "mega" groups. A flat
 * category list stops being usable well before the full taxonomy (~93 items) is
 * in play, so this panel adds a search box and an A-Z jump index on top of a
 * scrollable, multi-select list. Each option can carry a `group` (its main
 * category) shown as muted context. Works for any list size.
 */
export type PickerOption = MerkenOption & { group?: string }

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const firstLetter = (label: string): string => {
  const c = (label.trim()[0] || '#').toUpperCase()
  return LETTERS.includes(c) ? c : '#'
}

export function CategoryPickerMenu({
  options,
  selected,
  counts,
  multi,
  onToggle,
}: {
  options: PickerOption[]
  selected: string[]
  counts?: Record<string, number>
  multi: boolean
  onToggle: (value: string) => void
}) {
  const [query, setQuery] = React.useState('')
  const [letter, setLetter] = React.useState<string | null>(null)

  const availableLetters = React.useMemo(() => {
    const s = new Set<string>()
    options.forEach((o) => s.add(firstLetter(o.label)))
    return s
  }, [options])

  const q = query.trim().toLowerCase()
  const filtered = React.useMemo(() => {
    return options
      .filter((o) => (!q || o.label.toLowerCase().includes(q) || (o.group ? o.group.toLowerCase().includes(q) : false)))
      .filter((o) => (!letter || firstLetter(o.label) === letter))
      .sort((a, b) => a.label.localeCompare(b.label, 'nl-BE'))
  }, [options, q, letter])

  const showDividers = !q && !letter
  let lastLetter = ''

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 38,
    padding: '0 12px 0 34px',
    borderRadius: 'var(--radius-sm)',
    border: '0.5px solid var(--border-strong)',
    background: 'var(--surface-card)',
    fontFamily: 'var(--font-ui)',
    fontSize: 13,
    color: 'var(--text-strong)',
    outline: 'none',
  }

  return (
    <div style={{ width: 340, maxWidth: '86vw' }}>
      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <i className="ti ti-search" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: 'var(--text-meta)' }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek een categorie…"
          style={inputStyle}
          autoFocus
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Wis zoekopdracht"
            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-meta)' }}
          >
            <i className="ti ti-x" style={{ fontSize: 15 }} />
          </button>
        ) : null}
      </div>

      {/* A-Z index */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 10 }}>
        <button
          type="button"
          onClick={() => setLetter(null)}
          style={azChip(letter === null, true)}
        >
          Alle
        </button>
        {LETTERS.map((l) => {
          const has = availableLetters.has(l)
          return (
            <button
              key={l}
              type="button"
              disabled={!has}
              onClick={() => setLetter(letter === l ? null : l)}
              style={azChip(letter === l, has)}
            >
              {l}
            </button>
          )
        })}
      </div>

      {/* List */}
      <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1, paddingRight: 4 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '16px 10px', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)' }}>
            Geen categorieën gevonden.
          </div>
        ) : (
          filtered.map((o) => {
            const fl = firstLetter(o.label)
            const divider = showDividers && fl !== lastLetter
            if (divider) lastLetter = fl
            const on = selected.includes(o.value)
            const n = counts ? counts[o.value] ?? 0 : undefined
            // Dim categories with no available results so users focus on what
            // exists (kept selectable/visible, just lower opacity).
            const empty = n === 0
            return (
              <React.Fragment key={o.value}>
                {divider ? (
                  <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--text-meta)', padding: '10px 10px 4px' }}>
                    {fl}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => onToggle(o.value)}
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
                    opacity: empty && !on ? 0.4 : 1,
                  }}
                >
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      flex: 'none',
                      borderRadius: multi ? 4 : '50%',
                      border: '0.5px solid ' + (on ? 'var(--blissify-forest)' : 'var(--border-strong)'),
                      background: on ? 'var(--blissify-forest)' : 'transparent',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {on ? <i className="ti ti-check" style={{ fontSize: 11, color: 'var(--blissify-chalk)' }} /> : null}
                  </span>
                  <span style={{ flex: 1, display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
                    <span>{o.label}</span>
                    {o.group ? <span style={{ fontSize: 11, color: 'var(--text-meta)' }}>{o.group}</span> : null}
                  </span>
                  {n !== undefined ? <span style={{ color: 'var(--text-meta)', fontSize: 12 }}>({n})</span> : null}
                </button>
              </React.Fragment>
            )
          })
        )}
      </div>
    </div>
  )
}

function azChip(active: boolean, enabled: boolean): React.CSSProperties {
  return {
    minWidth: 22,
    height: 22,
    padding: '0 5px',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    background: active ? 'var(--blissify-forest)' : 'transparent',
    color: active ? 'var(--blissify-chalk)' : enabled ? 'var(--text-body)' : 'var(--border-strong)',
    fontFamily: 'var(--font-ui)',
    fontSize: 11.5,
    fontWeight: 'var(--fw-ui-medium)',
    cursor: enabled ? 'pointer' : 'default',
  }
}
