/** Authoritative pricing tiers from the final design templates. */
export type Tier = {
  key: 'basis' | 'medium' | 'premium'
  name: string
  tagline: string
  monthlyPrice: number
  annualPrice: number
  price: string
  desc: string
  features: string[]
  recommended?: boolean
}

export const TIERS: Tier[] = [
  {
    key: 'basis',
    name: 'Lite',
    tagline: 'Voor starters en kleine opleiders',
    monthlyPrice: 19,
    annualPrice: 180,
    price: '€ 180',
    desc: 'Een professionele basis voor zichtbaarheid met één actieve opleiding.',
    features: ['Professioneel opleiderprofiel', '1 actieve opleiding', 'Eigen opleidingspagina', 'Vindbaar via zoeken en filters', 'Website-, inschrijf- en socialmedia-links'],
  },
  {
    key: 'medium',
    name: 'Premium',
    tagline: 'Voor actieve opleiders met meerdere opleidingen',
    monthlyPrice: 45,
    annualPrice: 420,
    price: '€ 420',
    desc: 'Presenteer meerdere opleidingen en volg hun bereik met basisstatistieken.',
    features: ['Alles uit Lite', 'Tot 5 actieve opleidingen', 'Basisstatistieken', 'Profiel- en opleidingsweergaven', 'Websiteklikken en populairste opleidingen'],
    recommended: true,
  },
  {
    key: 'premium',
    name: 'Ultimate',
    tagline: 'Voor gevestigde opleiders en academies',
    monthlyPrice: 79,
    annualPrice: 708,
    price: '€ 708',
    desc: 'Onbeperkt publiceren met diepe inzichten en exclusieve zichtbaarheid.',
    features: ['Alles uit Premium', 'Onbeperkt actieve opleidingen', 'Geavanceerde statistieken per opleiding', 'Vergelijking, evolutie en CTR', 'Prioritaire ranking en homepage-rotatie', 'Ultimate badge'],
  },
]

export const COMPARE_ROWS: { feature: string; basis: string; medium: string; premium: string }[] = [
  { feature: 'Aantal opleidingen', basis: '1', medium: 'Tot 5', premium: 'Onbeperkt' },
  { feature: 'Professioneel opleiderprofiel', basis: 'Ja', medium: 'Ja', premium: 'Ja' },
  { feature: 'Basisstatistieken', basis: '–', medium: 'Ja', premium: 'Ja' },
  { feature: 'Geavanceerde statistieken', basis: '–', medium: '–', premium: 'Ja' },
  { feature: 'Prioriteit in zoekresultaten', basis: '–', medium: '–', premium: 'Ja' },
  { feature: 'Homepage exposure', basis: '–', medium: '–', premium: 'Rotatie' },
  { feature: 'Ultimate badge', basis: '–', medium: '–', premium: 'Ja' },
]

export type PricingData = {
  audience?: 'opleiders' | 'brands'
  intro: { eyebrow: string; title: string; subtitle: string }
  tiers: {
    key: string
    name: string
    tagline: string
    annualPrice?: number
    monthlyPrice?: number
    price: string
    period: string
    desc: string
    recommended: boolean
    features: string[]
  }[]
  comparison: { col1: string; col2: string; col3: string; rows: { feature: string; v1: string; v2: string; v3: string }[] }
  bottomCta: { title: string; body: string; buttonLabel: string; buttonUrl: string }
}

export type BillingSettings = {
  trialEnabled: boolean
  trialDays: number
  monthlyEnabled: boolean
  monthlyMarkupPercent: number
  monthlyCommitment: 'annual' | 'cancel_anytime'
}

export type PricingCatalog = {
  billing: BillingSettings
  opleiders: PricingData
  brands: PricingData
}

export const BILLING_FALLBACK: BillingSettings = {
  trialEnabled: false,
  trialDays: 0,
  monthlyEnabled: true,
  monthlyMarkupPercent: 20,
  monthlyCommitment: 'cancel_anytime',
}

/** Fallback used when the Pricing global is empty or the DB is unreachable. */
export const PRICING_FALLBACK: PricingData = {
  audience: 'opleiders',
  intro: {
    eyebrow: 'Prijzen voor opleiders',
    title: 'Eenvoudige, eerlijke prijzen.',
    subtitle: 'Maandelijks opzegbaar, of minder per maand bij jaarlijkse betaling. Prijzen exclusief btw.',
  },
  tiers: TIERS.map((t) => ({
    key: t.key,
    name: t.name,
    tagline: t.tagline,
    annualPrice: t.annualPrice,
    monthlyPrice: t.monthlyPrice,
    price: t.price,
    period: '/jaar',
    desc: t.desc,
    recommended: Boolean(t.recommended),
    features: t.features,
  })),
  comparison: {
    col1: 'Lite',
    col2: 'Premium',
    col3: 'Ultimate',
    rows: COMPARE_ROWS.map((r) => ({ feature: r.feature, v1: r.basis, v2: r.medium, v3: r.premium })),
  },
  bottomCta: {
    title: 'Jouw praktijk begint hier.',
    body: 'Sluit je aan bij 124 opleiders die hun bereik uitbreiden via Blissify.',
    buttonLabel: 'Bied mijn opleidingen aan',
    buttonUrl: '/inloggen',
  },
}

export const BRAND_PRICING_FALLBACK: PricingData = {
  audience: 'brands',
  intro: {
    eyebrow: 'Prijzen voor Merken & Leveranciers',
    title: 'Kies de zichtbaarheid die bij je merk past.',
    subtitle: 'Een professioneel merkprofiel, opleidingen en gerichte zichtbaarheid binnen de beauty- en wellnesssector.',
  },
  tiers: [
    {
      key: 'partner_listing',
      name: 'Partner Lite',
      tagline: 'Voor professionele merkzichtbaarheid',
      monthlyPrice: 29,
      annualPrice: 276,
      price: '€ 276',
      period: '/jaar',
      desc: 'Presenteer je merk of aanbod aan professionals op Blissify.',
      recommended: false,
      features: ['Professionele merkpagina', 'Logo, cover en bedrijfsomschrijving', 'Website- en socialmedia-links', 'Vindbaar via uitgebreide filters', '1 categorie of specialisatie', 'Geen opleidingen of statistieken'],
    },
    {
      key: 'partner_professional',
      name: 'Partner Premium',
      tagline: 'Voor merken met een breder aanbod',
      monthlyPrice: 59,
      annualPrice: 540,
      price: '€ 540',
      period: '/jaar',
      desc: 'Combineer je merkprofiel met opleidingen en directe inschrijvingen.',
      recommended: true,
      features: ['Alles uit Partner Lite', 'Tot 3 categorieën of specialisaties', 'Tot 5 actieve opleidingen', 'Eigen opleidingspagina’s', 'Basisstatistieken', 'Inzicht in views en website-/socialklikken'],
    },
    {
      key: 'partner_premium',
      name: 'Partner Ultimate',
      tagline: 'Voor maximale zichtbaarheid en merkbeleving',
      monthlyPrice: 99,
      annualPrice: 948,
      price: '€ 948',
      period: '/jaar',
      desc: 'Maximale zichtbaarheid, onbeperkt publiceren en prioritaire ondersteuning.',
      recommended: false,
      features: ['Alles uit Partner Premium', 'Onbeperkte categorieën en opleidingen', 'Geavanceerde statistieken', 'Prioritaire ranking en homepage-rotatie', 'Ultimate badge', 'Co-branded opleidingen'],
    },
  ],
  comparison: {
    col1: 'Partner Lite',
    col2: 'Partner Premium',
    col3: 'Partner Ultimate',
    rows: [
      { feature: 'Merk- of leveranciersprofiel', v1: 'Ja', v2: 'Ja', v3: 'Ja' },
      { feature: 'Categorieën of specialisaties', v1: '1', v2: 'Tot 3', v3: 'Onbeperkt' },
      { feature: 'Aantal opleidingen', v1: '–', v2: 'Tot 5', v3: 'Onbeperkt' },
      { feature: 'Basisstatistieken', v1: '–', v2: 'Ja', v3: 'Ja' },
      { feature: 'Geavanceerde statistieken', v1: '–', v2: '–', v3: 'Ja' },
      { feature: 'Prioritaire ranking', v1: '–', v2: '–', v3: 'Ja' },
      { feature: 'Homepage-uitlichting', v1: '–', v2: '–', v3: 'Rotatie' },
      { feature: 'Ultimate badge', v1: '–', v2: '–', v3: 'Ja' },
      { feature: 'Co-branded opleidingen', v1: '–', v2: '–', v3: 'Ja' },
    ],
  },
  bottomCta: {
    title: 'Zet je merk in de kijker.',
    body: 'Bereik opleiders en professionals die actief zoeken naar producten, apparatuur en opleidingen.',
    buttonLabel: 'Registreer als merk of leverancier',
    buttonUrl: '/registreren?type=brand',
  },
}

export const PRICING_CATALOG_FALLBACK: PricingCatalog = {
  billing: BILLING_FALLBACK,
  opleiders: PRICING_FALLBACK,
  brands: BRAND_PRICING_FALLBACK,
}

/** Price per month as shown on the site: the monthly price, or the yearly invoice spread over 12 months (Lonne, Nov 2026). */
export function perMonth(tier: { monthlyPrice?: number; annualPrice?: number }, cycle: 'yearly' | 'monthly'): number {
  const annual = tier.annualPrice || 0
  return cycle === 'monthly' ? tier.monthlyPrice || Math.round(annual / 10) : Math.round((annual / 12) * 100) / 100
}

/** What paying yearly saves compared with 12 monthly payments. */
export function yearlySaving(tier: { monthlyPrice?: number; annualPrice?: number }): number {
  return tier.monthlyPrice && tier.annualPrice ? Math.max(0, tier.monthlyPrice * 12 - tier.annualPrice) : 0
}

/** Euro amount without decimals when whole, nl-BE style. */
export const euro = (n: number) => `€${n.toLocaleString('nl-BE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

export function monthlyPrice(annualPrice: number, markupPercent: number): number {
  return Math.round((annualPrice * (1 + markupPercent / 100) / 12) * 100) / 100
}

export const FAQ_HOME = [
  { q: 'Wat is Blissify?', a: 'Blissify is een Belgisch platform dat cursisten verbindt met professionele wellness- en beauty-opleiders. Je vindt er een overzicht van opleidingen en aanbieders.' },
  { q: 'Hoe kies ik de juiste opleiding?', a: 'Vergelijk de informatie die aanbieders zelf publiceren, zoals prijs, duur, locatie, programma, certificaatinformatie, reviews, website en sociale kanalen. Zo bepaal je zelf welke opleiding het beste bij je past.' },
  { q: 'Kost het iets om een opleiding te zoeken?', a: 'Nee. Zoeken en vergelijken is volledig gratis voor cursisten. Je vraagt informatie rechtstreeks aan bij de opleider, zonder tussenpersoon.' },
  { q: 'Wie verstrekt het certificaat?', a: 'Een eventueel certificaat wordt verstrekt door de opleider of het merk. Blissify controleert of erkent certificaten niet. Vraag de aanbieder naar de inhoud, voorwaarden en eventuele aansluiting bij een beroepsorganisatie.' },
]
