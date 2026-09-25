/** Belgian cities/regions used for category+city SEO landing pages. */
export const CITIES: Record<string, string> = {
  antwerpen: 'Antwerpen',
  gent: 'Gent',
  brussel: 'Brussel',
  brugge: 'Brugge',
  leuven: 'Leuven',
  limburg: 'Limburg',
  hasselt: 'Hasselt',
  mechelen: 'Mechelen',
  kortrijk: 'Kortrijk',
  'west-vlaanderen': 'West-Vlaanderen',
}

export const CITY_SLUGS = Object.keys(CITIES)

/**
 * Canonical location options for the search/filter dropdowns. The live list is
 * built from cities that actually have published courses, which stays sparse
 * early on; this curated set of the main Belgian cities (plus Online) keeps the
 * "Locatie" dropdown usefully full (client feedback #1: expand the locations).
 * `mergeLocations` unions it with the live cities, de-duplicates, sorts nl-BE
 * and always pins "Online" last.
 */
export const LOCATION_OPTIONS: string[] = [
  'Antwerpen',
  'Gent',
  'Brussel',
  'Brugge',
  'Leuven',
  'Mechelen',
  'Hasselt',
  'Genk',
  'Kortrijk',
  'Oostende',
  'Aalst',
  'Sint-Niklaas',
  'Roeselare',
  'Turnhout',
  'Dendermonde',
  'Lokeren',
  'Vilvoorde',
  'Online',
]

export function mergeLocations(live: string[] = []): string[] {
  const set = new Set<string>()
  for (const c of [...LOCATION_OPTIONS, ...live]) {
    if (c && c.trim()) set.add(c.trim())
  }
  const all = Array.from(set)
  const online = all.filter((c) => c.toLowerCase() === 'online')
  const rest = all
    .filter((c) => c.toLowerCase() !== 'online')
    .sort((a, b) => a.localeCompare(b, 'nl-BE'))
  return [...rest, ...online]
}

export function isCitySlug(slug: string): boolean {
  return slug.toLowerCase() in CITIES
}

export function cityName(slug: string): string | null {
  return CITIES[slug.toLowerCase()] || null
}

/** Priority category/city combos to pre-render at build (from the copy doc). */
export const PRIORITY_CITY_COMBOS: { category: string; city: string }[] = [
  { category: 'massage', city: 'antwerpen' },
  { category: 'massage', city: 'gent' },
  { category: 'massage', city: 'brussel' },
  { category: 'nagelstyliste', city: 'antwerpen' },
  { category: 'nagelstyliste', city: 'gent' },
  { category: 'nagelstyliste', city: 'limburg' },
  { category: 'voetreflexologie', city: 'antwerpen' },
  { category: 'yoga', city: 'brussel' },
]
