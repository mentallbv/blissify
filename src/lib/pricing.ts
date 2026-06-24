/** Authoritative pricing tiers from the final design templates. */
export type Tier = {
  key: 'basis' | 'medium' | 'premium'
  name: string
  tagline: string
  price: string
  desc: string
  features: string[]
  recommended?: boolean
}

export const TIERS: Tier[] = [
  {
    key: 'basis',
    name: 'Basis',
    tagline: 'Voor wie start',
    price: '€ 99',
    desc: 'Voor wie start: één opleiding en een professioneel profiel.',
    features: ['1 opleiding', 'Opleider profiel', 'Aanvraagbeheer', 'Geen analytics'],
  },
  {
    key: 'medium',
    name: 'Medium',
    tagline: 'Voor groeiende opleiders',
    price: '€ 290',
    desc: 'Voor groeiende opleiders die meer bereik en inzicht willen.',
    features: ['Tot 5 opleidingen', 'Opleider profiel', 'Aanvraagbeheer', 'Analytisch dashboard', 'Nieuwsbrief-vermelding'],
    recommended: true,
  },
  {
    key: 'premium',
    name: 'Premium',
    tagline: 'Voor maximale zichtbaarheid',
    price: '€ 690',
    desc: 'Voor maximale zichtbaarheid met toppositie en support.',
    features: ['Onbeperkte opleidingen', 'Toppositie in resultaten', 'Premium badge', 'Featured plaatsing', 'Prioriteitssupport', 'Nieuwsbrief-vermelding'],
  },
]

export const COMPARE_ROWS: { feature: string; basis: string; medium: string; premium: string }[] = [
  { feature: 'Aantal opleidingen', basis: '1', medium: 'Tot 5', premium: 'Onbeperkt' },
  { feature: 'Opleider profiel', basis: 'Ja', medium: 'Ja', premium: 'Ja' },
  { feature: 'Aanvraagbeheer', basis: 'Ja', medium: 'Ja', premium: 'Ja' },
  { feature: 'Analytisch dashboard', basis: '–', medium: 'Ja', premium: 'Ja' },
  { feature: 'Nieuwsbrief-vermelding', basis: '–', medium: 'Ja', premium: 'Ja' },
  { feature: 'Featured plaatsing', basis: '–', medium: '–', premium: 'Ja' },
  { feature: 'Prioriteitssupport', basis: '–', medium: '–', premium: 'Ja' },
]

export const FAQ_HOME = [
  { q: 'Wat is Blissify?', a: 'Blissify is een Belgisch platform dat cursisten verbindt met geverifieerde, professionele wellness- en beauty-opleiders. Je vindt er een gecureerd overzicht van erkende opleidingen.' },
  { q: 'Hoe weet ik dat een opleider betrouwbaar is?', a: 'Elke opleider wordt handmatig gecontroleerd op identiteit, kwalificaties, programma-inhoud en erkenning voordat die op Blissify verschijnt.' },
  { q: 'Kost het iets om een opleiding te zoeken?', a: 'Nee. Zoeken en vergelijken is volledig gratis voor cursisten. Je vraagt informatie rechtstreeks aan bij de opleider, zonder tussenpersoon.' },
  { q: 'Wat betekent een erkend certificaat?', a: 'Een erkende opleiding voldoet aan de kwaliteits- en urenstandaarden van een beroepsfederatie of onderwijsinstelling. Filter op Erkend certificaat om enkel die programma’s te zien.' },
]
