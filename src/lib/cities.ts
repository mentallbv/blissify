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
