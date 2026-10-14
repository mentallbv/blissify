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
  className = 'bl-select',
  style,
  ...rest
}: { cities: CitiesByCountry } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={className} style={style} {...rest}>
      <option value="">Overal (België &amp; Nederland)</option>
      <option value="land:be">Heel België</option>
      <option value="land:nl">Heel Nederland</option>
      <optgroup label="België">
        {cities.be.map((c) => (
          <option key={`be:${c}`} value={`be:${c}`}>
            {c}
          </option>
        ))}
      </optgroup>
      <optgroup label="Nederland">
        {cities.nl.map((c) => (
          <option key={`nl:${c}`} value={`nl:${c}`}>
            {c}
          </option>
        ))}
      </optgroup>
      <option value="Online">Online</option>
    </select>
  )
}
