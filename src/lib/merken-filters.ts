/**
 * Single source of truth for the Merken & Leveranciers filter groups.
 * Shared by the data layer (facet counts + query building) and the reusable
 * MerkenFilterBar UI so options and URL keys never drift.
 */

export type MerkenOption = { value: string; label: string; group?: string }
export type MerkenGroup = {
  key: string // URL param key
  name: string // pill label
  ui: 'mega' | 'dropdown'
  multi: boolean
  options: MerkenOption[]
}

export const MERKEN_GROUPS: MerkenGroup[] = [
  {
    key: 'producttype',
    name: 'Categorie / Producttype',
    ui: 'mega',
    multi: true,
    options: [
      { value: 'skincare-huidverbetering', label: 'Skincare & Huidverbetering' },
      { value: 'esthetische-technologie', label: 'Esthetische Technologie & Apparatuur' },
      { value: 'make-up-pmu', label: 'Make-up & PMU' },
      { value: 'wenkbrauwen-wimpers', label: 'Wenkbrauwen & Wimpers' },
      { value: 'manicure', label: 'Manicure' },
      { value: 'pedicure', label: 'Pedicure' },
      { value: 'haarverzorging-scalp', label: 'Haarverzorging & Scalp' },
      { value: 'massage-body', label: 'Massage & Body' },
      { value: 'waxing-ontharing', label: 'Waxing & Ontharing' },
      { value: 'wellness-holistisch', label: 'Wellness & Holistisch' },
      { value: 'aromatherapie', label: 'Aromatherapie' },
      { value: 'praktijkinrichting-meubilair', label: 'Praktijkinrichting & Meubilair' },
      { value: 'praktijkbenodigdheden-instrumenten', label: 'Praktijkbenodigdheden & Instrumenten' },
      { value: 'hygiene-desinfectie', label: 'Hygiëne & Desinfectie' },
      { value: 'textiel-accessoires', label: 'Textiel & Accessoires' },
      { value: 'business-salon', label: 'Business & Salon Benodigdheden' },
    ],
  },
  {
    key: 'typePartner',
    name: 'Type Partner',
    ui: 'dropdown',
    multi: false,
    options: [
      { value: 'productmerken', label: 'Productmerken' },
      { value: 'apparatuurmerken', label: 'Apparatuurmerken' },
      { value: 'groothandels_distributeurs', label: 'Groothandels / Distributeurs' },
      { value: 'leveranciers', label: 'Leveranciers' },
    ],
  },
  {
    key: 'herkomst',
    name: 'Herkomst',
    ui: 'dropdown',
    multi: false,
    options: [
      { value: 'belgisch', label: 'Belgisch' },
      { value: 'nederlands', label: 'Nederlands' },
      { value: 'europees', label: 'Europees' },
      { value: 'internationaal', label: 'Internationaal' },
    ],
  },
  {
    key: 'positionering',
    name: 'Positionering',
    ui: 'dropdown',
    multi: false,
    options: [
      { value: 'starter-friendly', label: 'Starter friendly' },
      { value: 'premium-luxe', label: 'Premium / Luxe' },
      { value: 'professioneel-salon', label: 'Professioneel / Salon exclusief' },
      { value: 'medisch-esthetisch', label: 'Medisch-esthetisch' },
    ],
  },
  {
    key: 'filosofie',
    name: 'Filosofie & Waarden',
    ui: 'dropdown',
    multi: true,
    options: [
      { value: 'natuurlijk', label: 'Natuurlijk' },
      { value: 'vegan', label: 'Vegan' },
      { value: 'cruelty-free', label: 'Cruelty-free' },
      { value: 'duurzaam', label: 'Duurzaam' },
      { value: 'holistisch', label: 'Holistisch' },
    ],
  },
  {
    key: 'extra',
    name: 'Extra filters',
    ui: 'dropdown',
    multi: true,
    options: [
      { value: 'met-opleidingen', label: 'Alleen met opleidingen' },
      { value: 'nieuw', label: 'Nieuw op Blissify' },
      { value: 'top-beoordeeld', label: 'Top beoordeeld' },
    ],
  },
]

export type MerkenFacets = Record<string, Record<string, number>>
export type MerkenSelection = Record<string, string[]> & { q?: string[] }
