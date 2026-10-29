/**
 * Vacatures & samenwerkingen: option lists from the spec (notes/blissify
 * uitbreiding - OFF-2.pdf). One source for the collection, the dashboard
 * form, the public filters and the detail page.
 */
type Opt = { value: string; label: string }

export const VACANCY_TYPES: Opt[] = [
  { value: 'loondienst', label: 'Werknemer in loondienst' },
  { value: 'zelfstandig', label: 'Zelfstandige / freelancer' },
  { value: 'bijberoep', label: 'Zelfstandige in bijberoep' },
  { value: 'commissie', label: 'Samenwerking op commissiebasis' },
  { value: 'stage', label: 'Stage / leerwerkplek' },
  { value: 'andere', label: 'Andere samenwerking' },
]

/** Sectors double as the filter groups for functions. */
export const VACANCY_SECTORS: Opt[] = [
  { value: 'haar-barber', label: 'Haar & barber' },
  { value: 'beauty-huid', label: 'Beauty & huidverzorging' },
  { value: 'nagels-voeten', label: 'Nagels & voeten' },
  { value: 'massage-wellness', label: 'Massage, wellness & therapie' },
  { value: 'medisch-esthetisch', label: 'Medisch & esthetisch' },
  { value: 'tattoo-piercing', label: 'Tattoo & piercing' },
  { value: 'overige', label: 'Overige' },
]

export const VACANCY_FUNCTIONS: (Opt & { sector: string })[] = [
  { sector: 'haar-barber', value: 'kapper', label: 'Kapper / haarstylist' },
  { sector: 'haar-barber', value: 'barber', label: 'Barber' },
  { sector: 'haar-barber', value: 'headspa', label: 'Headspa-specialist' },
  { sector: 'beauty-huid', value: 'schoonheidsspecialist', label: 'Schoonheidsspecialist' },
  { sector: 'beauty-huid', value: 'huidtherapeut', label: 'Huidtherapeut' },
  { sector: 'beauty-huid', value: 'wimperstylist', label: 'Wimperstylist' },
  { sector: 'beauty-huid', value: 'wenkbrauwstylist', label: 'Wenkbrauwstylist' },
  { sector: 'beauty-huid', value: 'make-upartist', label: 'Make-upartist' },
  { sector: 'beauty-huid', value: 'pmu-specialist', label: 'PMU-specialist' },
  { sector: 'beauty-huid', value: 'ontharingsspecialist', label: 'Ontharingsspecialist' },
  { sector: 'nagels-voeten', value: 'nagelstylist', label: 'Nagelstylist' },
  { sector: 'nagels-voeten', value: 'pedicure', label: 'Pedicure' },
  { sector: 'nagels-voeten', value: 'medisch-pedicure', label: 'Medisch pedicure' },
  { sector: 'nagels-voeten', value: 'podotherapeut', label: 'Podotherapeut' },
  { sector: 'massage-wellness', value: 'masseur', label: 'Masseur / massagetherapeut' },
  { sector: 'massage-wellness', value: 'wellnessmedewerker', label: 'Wellnessmedewerker' },
  { sector: 'massage-wellness', value: 'fysiotherapeut', label: 'Fysiotherapeut' },
  { sector: 'massage-wellness', value: 'andere-therapeut', label: 'Andere therapeut' },
  { sector: 'medisch-esthetisch', value: 'medisch-esthetisch-specialist', label: 'Medisch-esthetisch specialist' },
  { sector: 'medisch-esthetisch', value: 'paramedisch', label: 'Andere medische of paramedische professional' },
  { sector: 'tattoo-piercing', value: 'tattooartist', label: 'Tattooartist' },
  { sector: 'tattoo-piercing', value: 'piercer', label: 'Piercer' },
  { sector: 'overige', value: 'receptionist', label: 'Receptionist / baliemedewerker' },
  { sector: 'overige', value: 'salonmanager', label: 'Salonmanager' },
  { sector: 'overige', value: 'opleider', label: 'Opleider / trainer' },
  { sector: 'overige', value: 'sales', label: 'Sales / vertegenwoordiger' },
  { sector: 'overige', value: 'marketing-administratie', label: 'Marketing / administratie' },
  { sector: 'overige', value: 'overig', label: 'Overig' },
]

export const VACANCY_REGIMES: Opt[] = [
  { value: 'voltijds', label: 'Voltijds' },
  { value: 'deeltijds', label: 'Deeltijds' },
  { value: 'enkele-dagen', label: 'Enkele dagen per week' },
  { value: 'vaste-dagen', label: 'Vaste dagen' },
  { value: 'flexibel', label: 'Flexibele uren' },
  { value: 'op-afspraak', label: 'Op afspraak / volgens boekingen' },
  { value: 'in-overleg', label: 'In overleg' },
]

/** The simplified "Werkregime" filter groups the regimes (spec: filters bewust eenvoudig). */
export const VACANCY_REGIME_FILTER: (Opt & { regimes: string[] })[] = [
  { value: 'voltijds', label: 'Voltijds', regimes: ['voltijds'] },
  { value: 'deeltijds', label: 'Deeltijds', regimes: ['deeltijds'] },
  { value: 'flexibel', label: 'Flexibel / enkele dagen per week', regimes: ['enkele-dagen', 'vaste-dagen', 'flexibel'] },
  { value: 'op-afspraak', label: 'Op afspraak / per opdracht', regimes: ['op-afspraak'] },
]

/** The simplified "Type samenwerking" filter. */
export const VACANCY_TYPE_FILTER: (Opt & { types: string[] })[] = [
  { value: 'loondienst', label: 'Loondienst', types: ['loondienst'] },
  { value: 'zelfstandig', label: 'Zelfstandig / freelance', types: ['zelfstandig', 'bijberoep'] },
  { value: 'commissie', label: 'Commissiebasis', types: ['commissie'] },
  { value: 'stage', label: 'Stage / leerwerkplek', types: ['stage'] },
  { value: 'overige', label: 'Overigen', types: ['andere'] },
]

export const WEEKDAYS: Opt[] = [
  { value: 'ma', label: 'Maandag' },
  { value: 'di', label: 'Dinsdag' },
  { value: 'wo', label: 'Woensdag' },
  { value: 'do', label: 'Donderdag' },
  { value: 'vr', label: 'Vrijdag' },
  { value: 'za', label: 'Zaterdag' },
  { value: 'zo', label: 'Zondag' },
]

export const START_OPTIONS: Opt[] = [
  { value: 'onmiddellijk', label: 'Onmiddellijk' },
  { value: 'datum', label: 'Vanaf een specifieke datum' },
  { value: 'in-overleg', label: 'In overleg' },
]

export const COMPENSATION_TYPES: Opt[] = [
  { value: 'vast-loon', label: 'Vast loon' },
  { value: 'uur', label: 'Uurvergoeding' },
  { value: 'dag', label: 'Dagvergoeding' },
  { value: 'commissie', label: 'Percentage van de omzet / commissie' },
  { value: 'per-behandeling', label: 'Vergoeding per behandeling of opdracht' },
  { value: 'in-overleg', label: 'In overleg' },
]

export const EXPERIENCE_LEVELS: Opt[] = [
  { value: 'geen', label: 'Geen ervaring vereist' },
  { value: 'starter', label: 'Starter welkom' },
  { value: 'gewenst', label: 'Ervaring gewenst' },
  { value: 'vereist', label: 'Ervaring vereist' },
]

export const VACANCY_OFFERS: Opt[] = [
  { value: 'klantenbestand', label: 'Bestaand klantenbestand / klantenaanvoer' },
  { value: 'werkplek', label: 'Eigen werkplek' },
  { value: 'materiaal', label: 'Gebruik van professioneel materiaal' },
  { value: 'producten', label: 'Gebruik van producten' },
  { value: 'flexibele-uren', label: 'Flexibele werkuren' },
  { value: 'opleiding', label: 'Opleidingsmogelijkheden' },
  { value: 'doorgroei', label: 'Doorgroeimogelijkheden' },
  { value: 'marketing', label: 'Marketingondersteuning' },
  { value: 'administratie', label: 'Administratieve ondersteuning' },
  { value: 'receptie', label: 'Receptie / afsprakenbeheer' },
  { value: 'samenwerking', label: 'Samenwerking met andere professionals' },
  { value: 'overig', label: 'Overig' },
]

export const labelOf = (list: Opt[], value?: string | null) => list.find((o) => o.value === value)?.label || value || ''

/** Sectors covered by a set of functions (for the sector filter). */
export function sectorsFor(functions: string[] = []): string[] {
  return Array.from(new Set(functions.map((f) => VACANCY_FUNCTIONS.find((o) => o.value === f)?.sector).filter((s): s is string => Boolean(s))))
}
