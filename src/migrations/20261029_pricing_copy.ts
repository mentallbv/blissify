import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-vercel-postgres'

/**
 * Plan tables from the copy (10/2026): Lite / Premium / Ultimate for salons &
 * professionals and Partner Lite / Premium / Ultimate for merken &
 * leveranciers, with the vacancy and workspace limits. Tier keys and prices
 * are unchanged (Mollie and tier-features depend on them). Pricing copy is
 * CMS data, so this is a data migration; afterwards it stays editable in the
 * admin (Globals -> Pricing).
 */
const f = (...items: string[]) => items.map((feature) => ({ feature }))
const row = (feature: string, v1: string, v2: string, v3: string) => ({ feature, v1, v2, v3 })
const ALL = (feature: string) => row(feature, '✓', '✓', '✓')

const opleiders = {
  intro: {
    eyebrow: 'Abonnementen & tarieven',
    title: 'Abonnementen voor salons & professionals',
    subtitle:
      'Voor salons, zelfstandige beauty- en wellnessprofessionals, opleiders en academies die hun professionele aanbod willen publiceren. Maandelijks of jaarlijks, met twee maanden gratis bij jaarlijkse betaling. Alle prijzen zijn exclusief btw.',
  },
  tiers: [
    {
      key: 'basis', name: 'Lite', monthlyPrice: 15, annualPrice: 150, recommended: false,
      tagline: 'Voor starters en zelfstandige professionals',
      desc: 'Voor starters en zelfstandige professionals',
      features: f('Eigen bedrijfsprofiel met logo, foto’s en specialisaties', 'Website- en socialmedialinks', '1 opleiding, 1 vacature en 1 werkruimte', 'Samenwerkingsverzoeken van Ultimate-partners accepteren', 'Vindbaar via zoekfunctie en filters'),
    },
    {
      key: 'medium', name: 'Premium', monthlyPrice: 49, annualPrice: 490, recommended: true,
      tagline: 'Voor salons en opleiders met een breder aanbod',
      desc: 'Voor salons en opleiders met een breder aanbod',
      features: f('Alles uit Lite', 'Tot 5 opleidingen, 2 vacatures en 2 werkruimtes', 'Statistieken: weergaven, aanvragen en klikken', 'Conversieratio en grafiek van de laatste 12 maanden'),
    },
    {
      key: 'premium', name: 'Ultimate', monthlyPrice: 97, annualPrice: 970, recommended: false,
      tagline: 'Voor gevestigde salons, academies en opleiders',
      desc: 'Voor gevestigde salons, academies en opleiders',
      features: f('Alles uit Premium', 'Onbeperkt opleidingen, vacatures en werkruimtes', 'Uitgebreide statistieken, CTR en trends per publicatie', 'Prioritaire positie in zoekresultaten', 'Uitgelicht op de homepage via rotatie', 'Ultimate-badge op je bedrijfsprofiel'),
    },
  ],
  comparison: {
    col1: 'Lite', col2: 'Premium', col3: 'Ultimate',
    rows: [
      row('Jaarvoordeel', '2 maanden gratis', '2 maanden gratis', '2 maanden gratis'),
      ALL("Eigen profiel met logo, foto's, bedrijfsinformatie en specialisaties"),
      ALL('Website- en socialmedialinks'),
      ALL('Vindbaar via zoekfunctie en filters'),
      row('Opleidingen publiceren', '1', '5', 'Onbeperkt'),
      ALL("Eigen pagina per opleiding of workshop, met informatie, foto's en inschrijvingslink"),
      ALL('Verzoeken van Ultimate-partners accepteren'),
      ALL('Goedgekeurde samenwerkingen tonen op je profiel en bij je opleidingen'),
      row('Vacatures plaatsen', '1', '2', 'Onbeperkt'),
      ALL('Eigen vacaturepagina met rechtstreeks contact met kandidaten'),
      row('Werkruimtes aanbieden', '1', '2', 'Onbeperkt'),
      ALL('Eigen pagina met foto’s, locatie, huurprijs en voorzieningen'),
      row('Statistieken', '—', 'Basis', 'Uitgebreid'),
      row('Weergaven van profiel, opleidingen, vacatures en werkruimtes', '—', '✓', '✓'),
      row('Contactacties, aanvragen en klikken naar website en socials', '—', '✓', '✓'),
      row('Conversieratio en grafiek met profielweergaven van de laatste 12 maanden', '—', '✓', '✓'),
      row('Statistieken, klikratio (CTR) en trends per publicatie, en publicaties onderling vergelijken', '—', '—', '✓'),
      row('Prioritaire positie in zoekresultaten', '—', '—', '✓'),
      row('Uitgelicht op de homepage via rotatie', '—', '—', '✓'),
      row('Ultimate-badge op je bedrijfsprofiel', '—', '—', '✓'),
    ],
  },
  bottomCta: {
    title: 'Jouw groei begint hier.',
    body: 'Maak jouw aanbod zichtbaar voor beauty- en wellnessprofessionals in België en Nederland.',
    buttonLabel: 'Word aanbieder',
    buttonUrl: '/registreren',
  },
}

const brands = {
  intro: {
    eyebrow: 'Abonnementen & tarieven',
    title: 'Abonnementen voor merken & leveranciers',
    subtitle:
      'Voor professionele beauty- en wellnessmerken, leveranciers, distributeurs en groothandels die hun merk en aanbod onder de aandacht willen brengen van de juiste professionals. Alle prijzen zijn exclusief btw.',
  },
  tiers: [
    {
      key: 'partner_listing', name: 'Partner Lite', monthlyPrice: 49, annualPrice: 490, recommended: false,
      tagline: 'Voor professionele merkzichtbaarheid',
      desc: 'Voor professionele merkzichtbaarheid',
      features: f('Eigen merkprofiel met logo, foto’s en productaanbod', 'Website- en socialmedialinks', '1 categorie of specialisatie', 'Vindbaar via zoekfunctie en filters'),
    },
    {
      key: 'partner_professional', name: 'Partner Premium', monthlyPrice: 89, annualPrice: 890, recommended: true,
      tagline: 'Voor merken met een breder aanbod',
      desc: 'Voor merken met een breder aanbod',
      features: f('Alles uit Partner Lite', 'Tot 3 categorieën of specialisaties', 'Tot 5 opleidingen en events', '2 vacatures en 2 werkruimtes', 'Statistieken: weergaven, aanvragen en klikken'),
    },
    {
      key: 'partner_premium', name: 'Partner Ultimate', monthlyPrice: 149, annualPrice: 1490, recommended: false,
      tagline: 'Voor maximale zichtbaarheid',
      desc: 'Voor maximale zichtbaarheid',
      features: f('Alles uit Partner Premium', 'Onbeperkt categorieën, opleidingen, vacatures en werkruimtes', 'Samenwerkingen met opleiders initiëren', 'Uitgebreide statistieken, CTR en trends per publicatie', 'Prioritaire positie en homepage-rotatie', 'Ultimate-badge op je merkprofiel'),
    },
  ],
  comparison: {
    col1: 'Partner Lite', col2: 'Partner Premium', col3: 'Partner Ultimate',
    rows: [
      row('Jaarvoordeel', '2 maanden gratis', '2 maanden gratis', '2 maanden gratis'),
      ALL("Eigen profiel met logo, foto's, bedrijfsinformatie en productaanbod"),
      ALL('Website- en socialmedialinks'),
      ALL('Vindbaar via zoekfunctie en filters'),
      row('Categorieën en specialisaties', '1', '3', 'Onbeperkt'),
      row('Opleidingen en events publiceren', '—', '5', 'Onbeperkt'),
      row('Samenwerkingen met opleiders initiëren', '—', '—', '✓'),
      row('Goedgekeurde samenwerkingen tonen op je merkprofiel en bij opleidingen', '—', '—', '✓'),
      row('Vacatures plaatsen', '—', '2', 'Onbeperkt'),
      row('Werkruimtes aanbieden', '—', '2', 'Onbeperkt'),
      row('Statistieken', '—', 'Basis', 'Uitgebreid'),
      row('Weergaven van profiel, opleidingen, vacatures en werkruimtes', '—', '✓', '✓'),
      row('Contactacties, aanvragen en klikken naar website en socials', '—', '✓', '✓'),
      row('Conversieratio en grafiek met profielweergaven van de laatste 12 maanden', '—', '✓', '✓'),
      row('Statistieken, klikratio (CTR) en trends per publicatie, en publicaties onderling vergelijken', '—', '—', '✓'),
      row('Prioritaire positie in zoekresultaten', '—', '—', '✓'),
      row('Uitgelicht op de homepage via rotatie', '—', '—', '✓'),
      row('Ultimate-badge op je merkprofiel', '—', '—', '✓'),
    ],
  },
  bottomCta: {
    title: 'Jouw groei begint hier.',
    body: 'Maak jouw merk en aanbod zichtbaar voor beauty- en wellnessprofessionals in België en Nederland.',
    buttonLabel: 'Word aanbieder',
    buttonUrl: '/registreren?type=brand',
  },
}

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.updateGlobal({ slug: 'pricing' as never, data: { opleiders, brands } as never })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // Copy change only; restore earlier texts from a version in the admin if needed.
}
