/**
 * Plan comparison tables, laid out as Lonne specified (feedback round 4, 10.1).
 * Values were checked against tier-features.ts (10.2): limits, statistics and
 * extras match what the code enforces. 'Y' renders a check, '-' a dash.
 */
export type CompareRow = { label: string; v: [string, string, string] }
export type CompareGroup = { title: string; rows: CompareRow[] }
export type PlanCompare = { cols: [string, string, string]; prices: CompareRow[]; groups: CompareGroup[] }

const Y = 'Y'
const N = '-'
const all = (label: string): CompareRow => ({ label, v: [Y, Y, Y] })
const notLite = (label: string): CompareRow => ({ label, v: [N, Y, Y] })
const onlyTop = (label: string): CompareRow => ({ label, v: [N, N, Y] })
const YEAR_BONUS: CompareRow = { label: 'Jaarvoordeel', v: ['2 maanden gratis', '2 maanden gratis', '2 maanden gratis'] }

const stats: CompareGroup = {
  title: 'Statistieken & inzichten',
  rows: [
    { label: 'Statistieken', v: [N, 'Basis', 'Uitgebreid'] },
    notLite('Profielweergaven'),
    notLite('Opleidingsweergaven'),
    notLite('Vacatureweergaven'),
    notLite('Werkruimteweergaven'),
    notLite('Contactacties en aanvragen'),
    notLite('Website- en socialmediaklikken'),
    notLite('Conversieratio'),
    notLite('Grafiek met profielweergaven over de laatste 12 maanden'),
    onlyTop('Statistieken per afzonderlijke opleiding, vacature of werkruimte'),
    onlyTop('Opleidingen, vacatures en werkruimtes onderling vergelijken'),
    onlyTop('Doorklikpercentage (CTR) per publicatie'),
    onlyTop('Trends per publicatie'),
  ],
}

const visibility = (profile: string): CompareGroup => ({
  title: 'Extra zichtbaarheid',
  rows: [onlyTop('Prioritaire positie in zoekresultaten'), onlyTop('Uitgelicht op de homepage via rotatie'), onlyTop(`Ultimate-badge op het ${profile}`)],
})

export const SALON_COMPARE: PlanCompare = {
  cols: ['Lite', 'Premium', 'Ultimate'],
  prices: [
    { label: 'Prijs per maand', v: ['€15', '€49', '€97'] },
    { label: 'Prijs per jaar', v: ['€150', '€490', '€970'] },
    YEAR_BONUS,
  ],
  groups: [
    {
      title: 'Professioneel bedrijfsprofiel',
      rows: [all("Eigen bedrijfsprofiel met logo, foto's, bedrijfsinformatie en specialisaties"), all('Website- en socialmedialinks'), all('Vindbaar via zoekfunctie en filters')],
    },
    {
      title: 'Opleidingen',
      rows: [
        { label: 'Opleidingen publiceren', v: ['1', '5', 'Onbeperkt'] },
        all('Eigen informatiepagina per opleiding of workshop'),
        all("Opleiding voorstellen met informatie, foto's en een inschrijvingslink"),
        all('Vindbaar via categorieën en zoekfilters'),
      ],
    },
    {
      title: 'Samenwerkingen met merken & partners',
      rows: [all('Samenwerkingsverzoeken van Ultimate-partners accepteren'), all('Goedgekeurde samenwerkingen tonen op het profiel en bij opleidingen')],
    },
    {
      title: 'Vacatures',
      rows: [
        { label: 'Vacatures plaatsen', v: ['1', '2', 'Onbeperkt'] },
        all('Eigen vacaturepagina met functieomschrijving, locatie en voorwaarden'),
        all('Vindbaar via zoekfilters en rechtstreeks contact met kandidaten'),
      ],
    },
    {
      title: 'Werkruimtes',
      rows: [
        { label: 'Werkruimtes aanbieden', v: ['1', '2', 'Onbeperkt'] },
        all("Eigen advertentiepagina met foto's, locatie, huurprijs en voorzieningen"),
        all('Vindbaar via zoekfilters en rechtstreeks contact met geïnteresseerden'),
      ],
    },
    stats,
    visibility('bedrijfsprofiel'),
  ],
}

export const BRAND_COMPARE: PlanCompare = {
  cols: ['Partner Lite', 'Partner Premium', 'Partner Ultimate'],
  prices: [
    { label: 'Prijs per maand', v: ['€49', '€89', '€149'] },
    { label: 'Prijs per jaar', v: ['€490', '€890', '€1.490'] },
    YEAR_BONUS,
  ],
  groups: [
    {
      title: 'Professioneel merkprofiel',
      rows: [
        all("Eigen merkprofiel met logo, foto's, bedrijfsinformatie en productaanbod"),
        all('Website- en socialmedialinks'),
        all('Vindbaar via zoekfunctie en filters'),
        { label: 'Categorieën en specialisaties', v: ['1', '3', 'Onbeperkt'] },
      ],
    },
    {
      title: 'Opleidingen & events',
      rows: [
        { label: 'Opleidingen en events publiceren', v: [N, '5', 'Onbeperkt'] },
        notLite('Eigen informatiepagina per opleiding, workshop of event'),
        notLite("Aanbod voorstellen met informatie, foto's en een inschrijvingslink"),
        notLite('Vindbaar via categorieën en zoekfilters'),
      ],
    },
    {
      title: 'Samenwerkingen met opleiders',
      rows: [onlyTop('Samenwerkingen met opleiders initiëren'), onlyTop('Goedgekeurde samenwerkingen tonen op het merkprofiel en bij opleidingen')],
    },
    {
      title: 'Vacatures',
      rows: [
        { label: 'Vacatures plaatsen', v: [N, '2', 'Onbeperkt'] },
        notLite('Eigen vacaturepagina met functieomschrijving, locatie en voorwaarden'),
        notLite('Vindbaar via zoekfilters en rechtstreeks contact met kandidaten'),
      ],
    },
    {
      title: 'Werkruimtes',
      rows: [
        { label: 'Werkruimtes aanbieden', v: [N, '2', 'Onbeperkt'] },
        notLite("Eigen advertentiepagina met foto's, locatie, huurprijs en voorzieningen"),
        notLite('Vindbaar via zoekfilters en rechtstreeks contact met geïnteresseerden'),
      ],
    },
    stats,
    visibility('merkprofiel'),
  ],
}
