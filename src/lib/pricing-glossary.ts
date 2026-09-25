/**
 * Plain-language explanations for subscription/pricing line items. The client
 * asked for optional (i) tooltips on "some" items that aren't always self-
 * evident. Matching is by keyword so it works against the free-text feature
 * strings in pricing.ts (and any CMS-edited variants) without a data-model
 * change: the first entry whose `match` appears in the feature label wins.
 */
type GlossaryEntry = { match: RegExp; text: string }

const ENTRIES: GlossaryEntry[] = [
  {
    match: /prioritaire ranking|homepage-rotatie|prioriteit in zoekresultaten/i,
    text: 'Je profiel en opleidingen verschijnen hoger in de zoekresultaten en rouleren mee in de uitgelichte secties op de homepagina.',
  },
  {
    match: /ultimate badge/i,
    text: 'Een zichtbaar kwaliteitslabel op je profiel en opleidingen dat aangeeft dat je het hoogste abonnement hebt.',
  },
  {
    match: /geavanceerde statistieken|vergelijking, evolutie en ctr/i,
    text: 'Diepere cijfers per opleiding: evolutie over tijd, onderlinge vergelijking en doorklikratio (CTR) van weergave naar actie.',
  },
  {
    match: /basisstatistieken/i,
    text: 'Kerncijfers over je profiel: aantal weergaven, websiteklikken en je populairste opleidingen.',
  },
  {
    match: /profiel- en opleidingsweergaven|inzicht in views/i,
    text: 'Hoeveel keer je profiel en je opleidingen bekeken werden door bezoekers.',
  },
  {
    match: /co-branded opleidingen/i,
    text: 'Bied opleidingen aan in samenwerking met een erkend merk, met een zichtbare koppeling tussen beide profielen.',
  },
  {
    match: /categorie(ën)? of specialisatie/i,
    text: 'De categorieën waaronder je gevonden wordt in de filters. Je abonnement bepaalt hoeveel je er kunt kiezen.',
  },
  {
    match: /productlanceringen extra uitlichten/i,
    text: 'Nieuwe producten of apparatuur krijgen een extra uitgelichte plek op je merkpagina.',
  },
  {
    match: /vindbaar via (zoeken en filters|uitgebreide filters)/i,
    text: 'Je verschijnt in de zoekfunctie en kunt via de filters (categorie, locatie, type, …) teruggevonden worden.',
  },
]

/** Returns the explanation for a feature label, or null when none applies. */
export function glossaryFor(feature: string): string | null {
  const entry = ENTRIES.find((e) => e.match.test(feature))
  return entry ? entry.text : null
}
