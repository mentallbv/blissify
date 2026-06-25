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

export type PricingData = {
  intro: { eyebrow: string; title: string; subtitle: string }
  tiers: {
    key: string
    name: string
    tagline: string
    price: string
    period: string
    desc: string
    recommended: boolean
    features: string[]
  }[]
  comparison: { col1: string; col2: string; col3: string; rows: { feature: string; v1: string; v2: string; v3: string }[] }
  bottomCta: { title: string; body: string; buttonLabel: string; buttonUrl: string }
}

/** Fallback used when the Pricing global is empty or the DB is unreachable. */
export const PRICING_FALLBACK: PricingData = {
  intro: {
    eyebrow: 'Prijzen voor opleiders',
    title: 'Eenvoudige, eerlijke prijzen.',
    subtitle: 'Eén jaarlijks abonnement. Directe leads. Geen commissie per aanvraag.',
  },
  tiers: TIERS.map((t) => ({
    key: t.key,
    name: t.name,
    tagline: t.tagline,
    price: t.price,
    period: '/jaar',
    desc: t.desc,
    recommended: Boolean(t.recommended),
    features: t.features,
  })),
  comparison: {
    col1: 'Basis',
    col2: 'Medium',
    col3: 'Premium',
    rows: COMPARE_ROWS.map((r) => ({ feature: r.feature, v1: r.basis, v2: r.medium, v3: r.premium })),
  },
  bottomCta: {
    title: 'Jouw praktijk begint hier.',
    body: 'Sluit je aan bij 124 geverifieerde opleiders die hun bereik uitbreiden via Blissify.',
    buttonLabel: 'Bied mijn opleidingen aan',
    buttonUrl: '/inloggen',
  },
}

export const FAQ_HOME = [
  { q: 'Wat is Blissify?', a: 'Blissify is een Belgisch platform dat cursisten verbindt met geverifieerde, professionele wellness- en beauty-opleiders. Je vindt er een gecureerd overzicht van erkende opleidingen.' },
  { q: 'Hoe weet ik dat een opleider betrouwbaar is?', a: 'Elke opleider wordt handmatig gecontroleerd op identiteit, kwalificaties, programma-inhoud en erkenning voordat die op Blissify verschijnt.' },
  { q: 'Kost het iets om een opleiding te zoeken?', a: 'Nee. Zoeken en vergelijken is volledig gratis voor cursisten. Je vraagt informatie rechtstreeks aan bij de opleider, zonder tussenpersoon.' },
  { q: 'Wat betekent een erkend certificaat?', a: 'Een erkende opleiding voldoet aan de kwaliteits- en urenstandaarden van een beroepsfederatie of onderwijsinstelling. Filter op Erkend certificaat om enkel die programma’s te zien.' },
]
