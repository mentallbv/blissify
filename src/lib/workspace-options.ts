/**
 * Werkruimtes (werkplek verhuren): option lists from the spec
 * (notes/blissify uitbreiding - OFF-2.pdf, "Werkplek verhuren").
 * Shared by the collection, the dashboard form, the filters and the page.
 */
type Opt = { value: string; label: string }

export const SALON_TYPES: Opt[] = [
  { value: 'kapsalon', label: 'Kapsalon' },
  { value: 'barbershop', label: 'Barbershop' },
  { value: 'nagelstudio', label: 'Nagelstudio' },
  { value: 'schoonheidssalon', label: 'Schoonheidssalon' },
  { value: 'wenkbrauwstudio', label: 'Wenkbrauwstudio' },
  { value: 'wimperstudio', label: 'Wimperstudio' },
  { value: 'massagesalon', label: 'Massagesalon' },
  { value: 'wellness-spa', label: 'Wellness / spa' },
  { value: 'pedicure', label: 'Pedicure / voetverzorging' },
  { value: 'tattoo-piercing', label: 'Tattoo- of piercingstudio' },
  { value: 'therapiepraktijk', label: 'Therapiepraktijk' },
  { value: 'medisch-esthetisch', label: 'Medisch-esthetische praktijk' },
  { value: 'overig', label: 'Overig' },
]

export const WORKPLACE_TYPES: Opt[] = [
  { value: 'werkstoel', label: 'Werkstoel / werkstation' },
  { value: 'behandelruimte', label: 'Afzonderlijke behandelruimte' },
  { value: 'volledig-salon', label: 'Volledig salon / volledige praktijkruimte' },
  { value: 'gedeelde-ruimte', label: 'Gedeelde open werkruimte' },
  { value: 'overig', label: 'Overig' },
]

export const USAGE_OPTIONS: Opt[] = [
  { value: 'exclusief', label: 'Exclusief gebruik door de huurder' },
  { value: 'gedeeld', label: 'Gedeeld gebruik met andere professionals' },
  { value: 'beide', label: 'Beide mogelijkheden bespreekbaar' },
]

export const ACCESS_OPTIONS: Opt[] = [
  { value: 'afgesproken', label: 'Alleen tijdens afgesproken dagen en uren' },
  { value: 'zelfstandig', label: 'Zelfstandige toegang, ook buiten de openingsuren' },
  { value: 'in-overleg', label: 'In overleg' },
]

export const RENT_FORMULAS: Opt[] = [
  { value: 'vast', label: 'Vaste huurprijs' },
  { value: 'percentage', label: 'Percentage van de omzet' },
  { value: 'vast-percentage', label: 'Vaste huurprijs + percentage van de omzet' },
  { value: 'in-overleg', label: 'In overleg' },
]

export const RENT_UNITS: Opt[] = [
  { value: 'uur', label: 'Uur' },
  { value: 'dagdeel', label: 'Dagdeel' },
  { value: 'dag', label: 'Dag' },
  { value: 'week', label: 'Week' },
  { value: 'maand', label: 'Maand' },
]

export const DEPOSIT_OPTIONS: Opt[] = [
  { value: 'geen', label: 'Geen waarborg' },
  { value: 'bedrag', label: 'Waarborgbedrag' },
  { value: 'in-overleg', label: 'In overleg' },
]

export const FACILITY_UNITS: Opt[] = [
  { value: 'uur', label: 'Per uur' },
  { value: 'dag', label: 'Per dag' },
  { value: 'week', label: 'Per week' },
  { value: 'maand', label: 'Per maand' },
  { value: 'gebruik', label: 'Per gebruik' },
  { value: 'behandeling', label: 'Per behandeling' },
  { value: 'eenmalig', label: 'Eenmalig' },
]

/**
 * Facility categories. `priced` (6.2–6.7): each item is "inbegrepen" or
 * "tegen meerprijs" with an optional price and unit. The others (6.1, 6.8)
 * are plain checkboxes.
 */
export const FACILITY_CATEGORIES: { key: string; label: string; priced: boolean; items: Opt[] }[] = [{"key": "ligging", "label": "Ligging, toegankelijkheid & comfort", "priced": false, "items": [{"value": "gratis-parking-beschikbaar", "label": "Gratis parking beschikbaar"}, {"value": "betaalparking-beschikbaar", "label": "Betaalparking beschikbaar"}, {"value": "parking-voor-de-deur", "label": "Parking voor de deur"}, {"value": "dicht-bij-openbaar-vervoer", "label": "Dicht bij openbaar vervoer"}, {"value": "rolstoeltoegankelijk", "label": "Rolstoeltoegankelijk"}, {"value": "gelijkvloerse-toegang", "label": "Gelijkvloerse toegang"}, {"value": "lift-aanwezig", "label": "Lift aanwezig"}, {"value": "eigen-ingang", "label": "Eigen ingang"}, {"value": "natuurlijk-daglicht", "label": "Natuurlijk daglicht"}, {"value": "mogelijkheid-tot-verduisteren", "label": "Mogelijkheid tot verduisteren"}, {"value": "airconditioning", "label": "Airconditioning"}, {"value": "verwarming", "label": "Verwarming"}, {"value": "ventilatie", "label": "Ventilatie"}, {"value": "24-7-toegang-mogelijk", "label": "24/7 toegang mogelijk"}, {"value": "toegang-tijdens-vaste-openingsuren", "label": "Toegang tijdens vaste openingsuren"}, {"value": "afzonderlijk-afsluitbare-werkruimte", "label": "Afzonderlijk afsluitbare werkruimte"}]}, {"key": "algemeen", "label": "Algemene voorzieningen & kosten", "priced": true, "items": [{"value": "wifi", "label": "Wifi"}, {"value": "muziekinstallatie", "label": "Muziekinstallatie"}, {"value": "schoonmaakservice", "label": "Schoonmaakservice"}, {"value": "elektriciteitsverbruik", "label": "Elektriciteitsverbruik"}, {"value": "waterverbruik", "label": "Waterverbruik"}, {"value": "verwarmings-en-energiekosten", "label": "Verwarmings- en energiekosten"}, {"value": "afvalverwerking", "label": "Afvalverwerking"}, {"value": "was-en-droogservice", "label": "Was- en droogservice"}]}, {"key": "gemeenschappelijk", "label": "Gemeenschappelijke ruimtes & faciliteiten", "priced": true, "items": [{"value": "ontvangstruimte-wachtruimte", "label": "Ontvangstruimte / wachtruimte"}, {"value": "receptie-balie", "label": "Receptie / balie"}, {"value": "keuken-kitchenette", "label": "Keuken / kitchenette"}, {"value": "toilet", "label": "Toilet"}, {"value": "douche", "label": "Douche"}, {"value": "kleedruimte", "label": "Kleedruimte"}, {"value": "gemeenschappelijke-opslagruimte", "label": "Gemeenschappelijke opslagruimte"}, {"value": "eigen-afsluitbare-opbergruimte", "label": "Eigen afsluitbare opbergruimte"}, {"value": "koffie-thee", "label": "Koffie / thee"}, {"value": "drankjes-voor-klanten", "label": "Drankjes voor klanten"}, {"value": "koelkast", "label": "Koelkast"}, {"value": "microgolfoven", "label": "Microgolfoven"}, {"value": "wasmachine", "label": "Wasmachine"}, {"value": "droogkast", "label": "Droogkast"}]}, {"key": "meubilair", "label": "Meubilair & werkplekken", "priced": true, "items": [{"value": "behandelbank-massagetafel", "label": "Behandelbank / massagetafel"}, {"value": "elektrisch-verstelbare-behandelbank", "label": "Elektrisch verstelbare behandelbank"}, {"value": "behandelstoel", "label": "Behandelstoel"}, {"value": "werkstoel", "label": "Werkstoel"}, {"value": "zadelkruk", "label": "Zadelkruk"}, {"value": "kapstoel-met-spiegel", "label": "Kapstoel met spiegel"}, {"value": "barberstoel", "label": "Barberstoel"}, {"value": "pedicurestoel", "label": "Pedicurestoel"}, {"value": "nageltafel-met-afzuiging", "label": "Nageltafel met afzuiging"}, {"value": "nageltafel-zonder-afzuiging", "label": "Nageltafel zonder afzuiging"}, {"value": "spiegel-werkstation", "label": "Spiegel / werkstation"}, {"value": "make-upspiegel-met-verlichting", "label": "Make-upspiegel met verlichting"}, {"value": "opbergkast-trolley", "label": "Opbergkast / trolley"}, {"value": "bureau-werktafel", "label": "Bureau / werktafel"}, {"value": "handdoek-of-linnenkast", "label": "Handdoek- of linnenkast"}]}, {"key": "apparatuur", "label": "Apparatuur & professionele benodigdheden", "priced": true, "items": [{"value": "wasbak-wateraansluiting", "label": "Wasbak / wateraansluiting"}, {"value": "haarwasbak", "label": "Haarwasbak"}, {"value": "droogkap-climazon", "label": "Droogkap / climazon"}, {"value": "kleurbar-mengruimte", "label": "Kleurbar / mengruimte"}, {"value": "half-moon-lamp", "label": "Half moon lamp"}, {"value": "ringlamp", "label": "Ringlamp"}, {"value": "loeplamp", "label": "Loeplamp"}, {"value": "handdoekverwarmer", "label": "Handdoekverwarmer"}, {"value": "harsverwarmer", "label": "Harsverwarmer"}, {"value": "sterilisator-autoclaaf", "label": "Sterilisator / autoclaaf"}, {"value": "ultrasoon-reiniger", "label": "Ultrasoon reiniger"}, {"value": "uv-led-nagellamp", "label": "UV/LED-nagellamp"}, {"value": "vapozone-gezichtsstomer", "label": "Vapozone / gezichtsstomer"}, {"value": "voetenbad", "label": "Voetenbad"}, {"value": "elektrische-nagelfrees", "label": "Elektrische nagelfrees"}, {"value": "stofafzuiging-voor-nagelbehandelingen", "label": "Stofafzuiging voor nagelbehandelingen"}, {"value": "afzuiging-ventilatie-voor-chemische-producten", "label": "Afzuiging / ventilatie voor chemische producten"}, {"value": "warmhoudapparaat-voor-massageolie", "label": "Warmhoudapparaat voor massageolie"}, {"value": "hotstoneverwarmer", "label": "Hotstoneverwarmer"}, {"value": "vergrootspiegel", "label": "Vergrootspiegel"}, {"value": "professionele-huidanalyseapparatuur", "label": "Professionele huidanalyseapparatuur"}]}, {"key": "producten", "label": "Producten & verbruiksmaterialen", "priced": true, "items": [{"value": "professionele-behandelproducten", "label": "Professionele behandelproducten"}, {"value": "wegwerpmaterialen", "label": "Wegwerpmaterialen"}, {"value": "handdoeken", "label": "Handdoeken"}, {"value": "lakens-behandellinnen", "label": "Lakens / behandellinnen"}, {"value": "beschermhoezen-voor-behandelbank", "label": "Beschermhoezen voor behandelbank"}, {"value": "reinigings-en-desinfectiemiddelen", "label": "Reinigings- en desinfectiemiddelen"}, {"value": "handschoenen", "label": "Handschoenen"}, {"value": "watjes-tissues-wegwerpdoekjes", "label": "Watjes / tissues / wegwerpdoekjes"}, {"value": "shampoo-en-haarverzorgingsproducten", "label": "Shampoo en haarverzorgingsproducten"}, {"value": "nagelproducten", "label": "Nagelproducten"}, {"value": "wax-harsproducten", "label": "Wax / harsproducten"}]}, {"key": "administratie", "label": "Administratie & betalingen", "priced": true, "items": [{"value": "kassasysteem", "label": "Kassasysteem"}, {"value": "online-agendasysteem-boekingssysteem", "label": "Online agendasysteem / boekingssysteem"}, {"value": "betaalterminal", "label": "Betaalterminal"}, {"value": "klantenregistratiesysteem", "label": "Klantenregistratiesysteem"}, {"value": "printer", "label": "Printer"}, {"value": "computer-tablet", "label": "Computer / tablet"}]}, {"key": "voorwaarden", "label": "Aanvullende mogelijkheden & voorwaarden", "priced": false, "items": [{"value": "eigen-materiaal-meebrengen-toegestaan", "label": "Eigen materiaal meebrengen toegestaan"}, {"value": "eigen-producten-gebruiken-toegestaan", "label": "Eigen producten gebruiken toegestaan"}, {"value": "eigen-producten-gebruiken-verplicht", "label": "Eigen producten gebruiken verplicht"}, {"value": "eigen-klanten-ontvangen-toegestaan", "label": "Eigen klanten ontvangen toegestaan"}, {"value": "ruimte-delen-met-andere-professionals-mogelijk", "label": "Ruimte delen met andere professionals mogelijk"}, {"value": "vaste-werkplek-mogelijk", "label": "Vaste werkplek mogelijk"}, {"value": "flexibele-werkplek-mogelijk", "label": "Flexibele werkplek mogelijk"}, {"value": "persoonlijke-sleutel-toegang-mogelijk", "label": "Persoonlijke sleutel / toegang mogelijk"}, {"value": "producten-ter-plaatse-verkopen-toegestaan", "label": "Producten ter plaatse verkopen toegestaan"}, {"value": "eigen-branding-logo-in-de-ruimte-toegestaan", "label": "Eigen branding / logo in de ruimte toegestaan"}, {"value": "ruimte-geschikt-voor-opleidingen-of-workshops", "label": "Ruimte geschikt voor opleidingen of workshops"}, {"value": "ruimte-geschikt-voor-groepsactiviteiten", "label": "Ruimte geschikt voor groepsactiviteiten"}, {"value": "ruimte-geschikt-voor-individuele-behandelingen", "label": "Ruimte geschikt voor individuele behandelingen"}]}]

export const ALL_FACILITIES: (Opt & { category: string; priced: boolean })[] = FACILITY_CATEGORIES.flatMap((c) => c.items.map((i) => ({ ...i, category: c.key, priced: c.priced })))
export const PRICED_FACILITY_KEYS = new Set(ALL_FACILITIES.filter((f) => f.priced).map((f) => f.value))
export const FEATURE_KEYS = new Set(ALL_FACILITIES.filter((f) => !f.priced).map((f) => f.value))

/** Sectors double as the "Type salon / sector" filter (spec filters, 8 groups). */
export const WORKSPACE_SECTORS: Opt[] = [
  { value: 'haar-barber', label: 'Haar & barber' },
  { value: 'beauty-huid', label: 'Beauty & huidverzorging' },
  { value: 'nagels-voeten', label: 'Nagels & voeten' },
  { value: 'massage-wellness', label: 'Massage, wellness & therapie' },
  { value: 'medisch-esthetisch', label: 'Medisch & esthetisch' },
  { value: 'tattoo-piercing', label: 'Tattoo & piercing' },
  { value: 'coaching', label: 'Coaching & consultaties' },
  { value: 'overige', label: 'Overige' },
]

export const WORKSPACE_ACTIVITIES: (Opt & { sector: string })[] = [{"sector": "haar-barber", "value": "kapper-haarverzorging", "label": "Kapper / haarverzorging"}, {"sector": "haar-barber", "value": "barber", "label": "Barber"}, {"sector": "haar-barber", "value": "headspa", "label": "Headspa"}, {"sector": "beauty-huid", "value": "schoonheidsbehandelingen-gelaatsverzorging", "label": "Schoonheidsbehandelingen / gelaatsverzorging"}, {"sector": "beauty-huid", "value": "huidtherapie", "label": "Huidtherapie"}, {"sector": "beauty-huid", "value": "lichaamsbehandelingen", "label": "Lichaamsbehandelingen"}, {"sector": "beauty-huid", "value": "laserbehandelingen-definitieve-ontharing", "label": "Laserbehandelingen / definitieve ontharing"}, {"sector": "beauty-huid", "value": "waxen-harsen", "label": "Waxen / harsen"}, {"sector": "beauty-huid", "value": "make-up-visagie", "label": "Make-up / visagie"}, {"sector": "beauty-huid", "value": "permanente-make-up-pmu", "label": "Permanente make-up (PMU)"}, {"sector": "beauty-huid", "value": "wimperbehandelingen", "label": "Wimperbehandelingen"}, {"sector": "beauty-huid", "value": "wenkbrauwbehandelingen", "label": "Wenkbrauwbehandelingen"}, {"sector": "nagels-voeten", "value": "manicure-nagelbehandelingen", "label": "Manicure / nagelbehandelingen"}, {"sector": "nagels-voeten", "value": "pedicure-voetverzorging", "label": "Pedicure / voetverzorging"}, {"sector": "nagels-voeten", "value": "medische-pedicure", "label": "Medische pedicure"}, {"sector": "nagels-voeten", "value": "podotherapie", "label": "Podotherapie"}, {"sector": "massage-wellness", "value": "massage", "label": "Massage"}, {"sector": "massage-wellness", "value": "wellnessbehandelingen", "label": "Wellnessbehandelingen"}, {"sector": "massage-wellness", "value": "acupunctuur", "label": "Acupunctuur"}, {"sector": "massage-wellness", "value": "energetische-therapie", "label": "Energetische therapie"}, {"sector": "massage-wellness", "value": "lichaamstherapie", "label": "Lichaamstherapie"}, {"sector": "massage-wellness", "value": "manuele-therapie", "label": "Manuele therapie"}, {"sector": "massage-wellness", "value": "fysiotherapie", "label": "Fysiotherapie"}, {"sector": "medisch-esthetisch", "value": "medisch-esthetische-behandelingen", "label": "Medisch-esthetische behandelingen"}, {"sector": "medisch-esthetisch", "value": "mondhygiene", "label": "Mondhygiëne"}, {"sector": "tattoo-piercing", "value": "tattoo", "label": "Tattoo"}, {"sector": "tattoo-piercing", "value": "piercing", "label": "Piercing"}, {"sector": "coaching", "value": "coaching", "label": "Coaching"}, {"sector": "coaching", "value": "consultaties-adviesgesprekken", "label": "Consultaties / adviesgesprekken"}, {"sector": "overige", "value": "overig", "label": "Overig"}]

export const AVAILABLE_FROM: Opt[] = [
  { value: 'onmiddellijk', label: 'Onmiddellijk' },
  { value: 'datum', label: 'Vanaf een specifieke datum' },
  { value: 'in-overleg', label: 'In overleg' },
]

export const DAYS: Opt[] = [
  { value: 'ma', label: 'Maandag' },
  { value: 'di', label: 'Dinsdag' },
  { value: 'wo', label: 'Woensdag' },
  { value: 'do', label: 'Donderdag' },
  { value: 'vr', label: 'Vrijdag' },
  { value: 'za', label: 'Zaterdag' },
  { value: 'zo', label: 'Zondag' },
]

/** Filter dayparts, derived from the time blocks (spec: 06–12 / 12–18 / 18–24, weekend). */
export const DAYPARTS: Opt[] = [
  { value: 'ochtend', label: 'Ochtend' },
  { value: 'middag', label: 'Middag' },
  { value: 'avond', label: 'Avond' },
  { value: 'weekend', label: 'Weekend' },
]

/** Applicant status in the application form (like flexsalon.be). */
export const APPLICANT_STATUS: Opt[] = [
  { value: 'onbekend', label: 'Niet opgegeven' },
  { value: 'zelfstandig', label: 'Geregistreerd als zelfstandige' },
  { value: 'starter', label: 'Ik start als zelfstandige' },
  { value: 'niet', label: 'Nog niet geregistreerd' },
]

export const labelOf = (list: Opt[], value?: string | null) => list.find((o) => o.value === value)?.label || value || ''

const toMin = (hhmm: string) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || '')
  return m ? Number(m[1]) * 60 + Number(m[2]) : null
}

/** Days and dayparts covered by the time blocks, for the availability filters. */
export function deriveAvailability(schedule: { day?: string | null; from?: string | null; to?: string | null }[] = []) {
  const days = new Set<string>()
  const parts = new Set<string>()
  for (const b of schedule) {
    const from = toMin(b.from || '')
    const to = toMin(b.to || '')
    if (!b.day || from == null || to == null || to <= from) continue
    days.add(b.day)
    if (b.day === 'za' || b.day === 'zo') parts.add('weekend')
    // A block counts for a daypart when it overlaps it.
    if (from < 12 * 60 && to > 6 * 60) parts.add('ochtend')
    if (from < 18 * 60 && to > 12 * 60) parts.add('middag')
    if (to > 18 * 60) parts.add('avond')
  }
  return { days: Array.from(days), parts: Array.from(parts) }
}

export function sectorsForActivities(activities: string[] = []): string[] {
  return Array.from(new Set(activities.map((a) => WORKSPACE_ACTIVITIES.find((o) => o.value === a)?.sector).filter((s): s is string => Boolean(s))))
}
