/**
 * "Merkidentiteit & waarden" (client round 3 #3): one list for the brand
 * collection, the brand profile form, the profile API and the /merken filter.
 * Stored in the brand's `tags` field.
 */
export const BRAND_VALUES = [
  { value: 'natuurlijk', label: 'Natuurlijk' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'dierproefvrij', label: 'Dierproefvrij' },
  { value: 'duurzaam', label: 'Duurzaam' },
  { value: 'holistisch', label: 'Holistisch' },
  { value: 'biologisch', label: 'Biologisch' },
  { value: 'clean-beauty', label: 'Clean beauty' },
  { value: 'luxe-exclusiviteit', label: 'Luxe & exclusiviteit' },
  { value: 'innovatie-technologie', label: 'Innovatie & technologie' },
] as const

export const BRAND_VALUE_SET: ReadonlySet<string> = new Set(BRAND_VALUES.map((o) => o.value))
