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
    price: '€ 249',
    desc: 'Voor groeiende opleiders die meer bereik en inzicht willen.',
    features: ['Tot 5 opleidingen', 'Professioneel opleiderprofiel', 'Uitgebreide statistieken', 'Prioriteit in zoekresultaten', 'Eigen branding (logo + kleuren)'],
    recommended: true,
  },
  {
    key: 'premium',
    name: 'Premium',
    tagline: 'Voor maximale zichtbaarheid',
    price: '€ 549',
    desc: 'Voor maximale zichtbaarheid met toppositie en support.',
    features: ['Onbeperkte opleidingen', 'Toppositie in zoekresultaten', 'Premium badge', 'Homepage exposure (rotatie)', 'Prioriteitssupport', 'Geavanceerde analytics + leadrapportage'],
  },
]

export const COMPARE_ROWS: { feature: string; basis: string; medium: string; premium: string }[] = [
  { feature: 'Aantal opleidingen', basis: '1', medium: 'Tot 5', premium: 'Onbeperkt' },
  { feature: 'Opleider profiel', basis: 'Ja', medium: 'Ja', premium: 'Ja' },
  { feature: 'Aanvraagbeheer', basis: 'Ja', medium: 'Ja', premium: 'Ja' },
  { feature: 'Uitgebreide statistieken', basis: '–', medium: 'Ja', premium: 'Ja' },
  { feature: 'Prioriteit in zoekresultaten', basis: '–', medium: 'Ja', premium: 'Toppositie' },
  { feature: 'Eigen branding', basis: '–', medium: 'Ja', premium: 'Ja' },
  { feature: 'Homepage exposure', basis: '–', medium: '–', premium: 'Rotatie' },
  { feature: 'Premium badge', basis: '–', medium: '–', premium: 'Ja' },
  { feature: 'Prioriteitssupport', basis: '–', medium: '–', premium: 'Ja' },
]

export type PricingData = {
  audience?: 'opleiders' | 'brands'
  intro: { eyebrow: string; title: string; subtitle: string }
  tiers: {
    key: string
    name: string
    tagline: string
    annualPrice?: number
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
  trialEnabled: true,
  trialDays: 7,
  monthlyEnabled: true,
  monthlyMarkupPercent: 10,
  monthlyCommitment: 'annual',
}

/** Fallback used when the Pricing global is empty or the DB is unreachable. */
export const PRICING_FALLBACK: PricingData = {
  audience: 'opleiders',
  intro: {
    eyebrow: 'Prijzen voor opleiders',
    title: 'Eenvoudige, eerlijke prijzen.',
    subtitle: 'Eén jaarlijks abonnement. Directe leads. Geen commissie per aanvraag.',
  },
  tiers: TIERS.map((t) => ({
    key: t.key,
    name: t.name,
    tagline: t.tagline,
    annualPrice: Number(t.price.replace(/[^\d]/g, '')),
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
      name: 'Partner Listing',
      tagline: 'Voor een professionele aanwezigheid',
      annualPrice: 490,
      price: '€ 490',
      period: '/jaar',
      desc: 'Presenteer je merk of aanbod aan professionals op Blissify.',
      recommended: false,
      features: ['Featured badge op het merkprofiel', 'Eigen brandpagina', 'Logo, coverfoto en bedrijfsomschrijving', 'Website en sociale kanalen', 'Uitgebreide merkfilters', 'Basisstatistieken', 'Geen opleidingen publiceren'],
    },
    {
      key: 'partner_professional',
      name: 'Partner Professional',
      tagline: 'Voor merken die opleidingen aanbieden',
      annualPrice: 890,
      price: '€ 890',
      period: '/jaar',
      desc: 'Combineer je merkprofiel met opleidingen en directe inschrijvingen.',
      recommended: true,
      features: ['Alles uit Partner Listing', 'Tot 10 opleidingen per jaar', 'In-platform inschrijvingen', 'Topranking binnen de categorie', 'Maandelijkse homepage exposure', 'Uitgebreide analytics'],
    },
    {
      key: 'partner_premium',
      name: 'Partner Premium',
      tagline: 'Voor maximale zichtbaarheid',
      annualPrice: 1490,
      price: '€ 1.490',
      period: '/jaar',
      desc: 'Maximale zichtbaarheid, onbeperkt publiceren en prioritaire ondersteuning.',
      recommended: false,
      features: ['Alles uit Partner Professional', 'Onbeperkte opleidingen, workshops en events', 'Premium badge', 'Prioriteit ranking en extra homepage exposure', 'Co-branded opleidingen', 'Geavanceerde analytics en lead-export'],
    },
  ],
  comparison: {
    col1: 'Partner Listing',
    col2: 'Partner Professional',
    col3: 'Partner Premium',
    rows: [
      { feature: 'Merk- of leveranciersprofiel', v1: 'Ja', v2: 'Ja', v3: 'Ja' },
      { feature: 'Aantal opleidingen', v1: '–', v2: 'Tot 10', v3: 'Onbeperkt' },
      { feature: 'In-platform inschrijvingen', v1: '–', v2: 'Ja', v3: 'Ja' },
      { feature: 'Analytisch dashboard', v1: 'Basis', v2: 'Uitgebreid', v3: 'Geavanceerd + export' },
      { feature: 'Ranking', v1: 'Standaard', v2: 'Topranking', v3: 'Prioriteit' },
      { feature: 'Homepage-uitlichting', v1: '–', v2: 'Maandelijkse rotatie', v3: 'Extra exposure' },
      { feature: 'Premium badge', v1: '–', v2: '–', v3: 'Ja' },
      { feature: 'Prioriteitssupport', v1: '–', v2: '–', v3: 'Ja' },
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

export function monthlyPrice(annualPrice: number, markupPercent: number): number {
  return Math.round((annualPrice * (1 + markupPercent / 100) / 12) * 100) / 100
}

export const FAQ_HOME = [
  { q: 'Wat is Blissify?', a: 'Blissify is een Belgisch platform dat cursisten verbindt met professionele wellness- en beauty-opleiders. Je vindt er een overzicht van opleidingen en aanbieders.' },
  { q: 'Hoe kies ik de juiste opleiding?', a: 'Vergelijk de informatie die aanbieders zelf publiceren, zoals prijs, duur, locatie, programma, certificaatinformatie, reviews, website en sociale kanalen. Zo bepaal je zelf welke opleiding het beste bij je past.' },
  { q: 'Kost het iets om een opleiding te zoeken?', a: 'Nee. Zoeken en vergelijken is volledig gratis voor cursisten. Je vraagt informatie rechtstreeks aan bij de opleider, zonder tussenpersoon.' },
  { q: 'Wie verstrekt het certificaat?', a: 'Een eventueel certificaat wordt verstrekt door de opleider of het merk. Blissify controleert of erkent certificaten niet. Vraag de aanbieder naar de inhoud, voorwaarden en eventuele aansluiting bij een beroepsorganisatie.' },
]
