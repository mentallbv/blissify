import React from 'react'
import type { CitiesByCountry } from '@/lib/cities'

/**
 * Locatie dropdown covering België and Nederland (client round 2 #3.6 / #1.1):
 * "Overal" (both countries), a whole country, a city grouped under its
 * country, or Online. One select encodes two URL params, `land` and `locatie`;
 * `encodeLocation` / `decodeLocation` translate between the two.
 */
export function encodeLocation(locatie: string, land: string): string {
  if (locatie) return locatie.toLowerCase() === 'online' ? 'Online' : `${land === 'nl' ? 'nl' : 'be'}:${locatie}`
  if (land === 'be' || land === 'nl') return `land:${land}`
  return ''
}

export function decodeLocation(value: string): { locatie: string | null; land: 'be' | 'nl' | null } {
  if (!value) return { locatie: null, land: null }
  if (value === 'Online') return { locatie: 'Online', land: null }
  const [prefix, ...rest] = value.split(':')
  const land = prefix === 'nl' ? 'nl' : prefix === 'be' ? 'be' : null
  if (value.startsWith('land:')) return { locatie: null, land: rest[0] === 'nl' ? 'nl' : 'be' }
  return { locatie: rest.join(':') || null, land }
}

export function LocationSelect({
  cities,
  counts,
  className = 'bl-select',
  style,
  ...rest
}: {
  cities: CitiesByCountry
  /**
   * Results per option value. When given (directory filters, round 5 #5.1),
   * only places with results are listed, each with its count, like the
   * aanbieders, vacatures and werkruimtes filters. The selected value always stays.
   */
  counts?: Record<string, number>
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const selected = typeof rest.value === 'string' ? rest.value : ''
  const show = (v: string) => !counts || (counts[v] || 0) > 0 || v === selected
  const label = (text: string, v: string) => (counts ? `${text} (${counts[v] || 0})` : text)
  const be = cities.be.filter((c) => show(`be:${c}`))
  const nl = cities.nl.filter((c) => show(`nl:${c}`))
  return (
    <select className={className} style={style} {...rest}>
      <option value="">Overal (België &amp; Nederland)</option>
      {show('land:be') ? <option value="land:be">{label('Heel België', 'land:be')}</option> : null}
      {show('land:nl') ? <option value="land:nl">{label('Heel Nederland', 'land:nl')}</option> : null}
      {be.length ? (
        <optgroup label="België">
          {be.map((c) => (
            <option key={`be:${c}`} value={`be:${c}`}>
              {label(c, `be:${c}`)}
            </option>
          ))}
        </optgroup>
      ) : null}
      {nl.length ? (
        <optgroup label="Nederland">
          {nl.map((c) => (
            <option key={`nl:${c}`} value={`nl:${c}`}>
              {label(c, `nl:${c}`)}
            </option>
          ))}
        </optgroup>
      ) : null}
      {show('Online') ? <option value="Online">{label('Online', 'Online')}</option> : null}
    </select>
  )
}
