import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-vercel-postgres'
import { tierForUser } from '@/lib/tier-features'
import { uniqueVacancySlug } from '@/lib/vacancy-form'
import { sectorsFor } from '@/lib/vacancy-options'

/**
 * Demo vacatures for testing (not real data). Spread over every plan that may
 * post vacancies, within each account's limit: Lite 1, Premium 2, Ultimate and
 * Partner Ultimate 2, Partner Premium 2; Partner Lite gets none. Each carries
 * the marker DEMO in seo.focusKeyphrase; `down` removes exactly those.
 */
const DEMO = 'demo-vacature'

type T = {
  title: string; functions: string[]; types: string[]; regimes: string[]; workdays?: string[]; start: string
  compensationTypes: string[]; compensationAmount?: string; experience: string; offers: string[]
  aboutCompany: string; whoWeSeek: string; whatWeOffer: string; apply: 'email' | 'link'
}

const TEMPLATES: T[] = [
  { title: 'Schoonheidsspecialiste (m/v) voor ons instituut', functions: ['schoonheidsspecialist'], types: ['loondienst'], regimes: ['voltijds'], start: 'onmiddellijk', compensationTypes: ['vast-loon'], experience: 'gewenst', offers: ['klantenbestand', 'producten', 'opleiding'], aboutCompany: 'Een rustig instituut met een vaste klantenkring en een warm team.', whoWeSeek: 'Een schoonheidsspecialiste die graag gelaatsverzorgingen en lichaamsbehandelingen doet.', whatWeOffer: 'Een vaste plek in het team, bijscholing en doorgroeimogelijkheden.', apply: 'email' },
  { title: 'Zelfstandige nagelstyliste gezocht', functions: ['nagelstylist'], types: ['zelfstandig', 'commissie'], regimes: ['enkele-dagen', 'flexibel'], workdays: ['wo', 'za'], start: 'in-overleg', compensationTypes: ['commissie'], compensationAmount: '50% van de omzet', experience: 'vereist', offers: ['werkplek', 'klantenbestand', 'receptie'], aboutCompany: 'Een druk bezocht salon in het centrum.', whoWeSeek: 'Een nagelstyliste met ervaring in gel en acryl die zelfstandig wil werken.', whatWeOffer: 'Een volledig ingerichte werkplek en klanten via ons boekingssysteem.', apply: 'email' },
  { title: 'Masseur of massagetherapeut (deeltijds)', functions: ['masseur'], types: ['loondienst', 'zelfstandig'], regimes: ['deeltijds'], workdays: ['do', 'vr', 'za'], start: 'datum', compensationTypes: ['uur'], compensationAmount: '€22 per uur', experience: 'gewenst', offers: ['materiaal', 'flexibele-uren'], aboutCompany: 'Een wellnesscentrum met sauna, hammam en vier behandelruimtes.', whoWeSeek: 'Een masseur die ontspanningsmassage en sportmassage beheerst.', whatWeOffer: 'Flexibele uren en een mooie werkomgeving.', apply: 'link' },
  { title: 'Pedicure voor onze praktijk', functions: ['pedicure', 'medisch-pedicure'], types: ['zelfstandig'], regimes: ['op-afspraak'], start: 'onmiddellijk', compensationTypes: ['per-behandeling'], experience: 'vereist', offers: ['werkplek', 'administratie'], aboutCompany: 'Een praktijk voor voetverzorging en podologie.', whoWeSeek: 'Een (medisch) pedicure die op afspraak wil werken.', whatWeOffer: 'Een eigen behandelruimte en administratieve ondersteuning.', apply: 'email' },
  { title: 'Stage schoonheidsspecialiste', functions: ['schoonheidsspecialist'], types: ['stage'], regimes: ['vaste-dagen'], workdays: ['ma', 'di'], start: 'datum', compensationTypes: ['in-overleg'], experience: 'geen', offers: ['opleiding'], aboutCompany: 'Een instituut dat graag starters begeleidt.', whoWeSeek: 'Een student schoonheidszorg op zoek naar een stageplaats.', whatWeOffer: 'Begeleiding door ervaren collega’s en een leerrijke stage.', apply: 'email' },
  { title: 'Kapper / haarstylist (voltijds)', functions: ['kapper'], types: ['loondienst'], regimes: ['voltijds'], start: 'onmiddellijk', compensationTypes: ['vast-loon'], experience: 'vereist', offers: ['producten', 'opleiding', 'doorgroei'], aboutCompany: 'Een kapsalon met een jong team en een eigen productlijn.', whoWeSeek: 'Een kapper met oog voor kleur en snit.', whatWeOffer: 'Een vast contract, opleidingen bij merken en een goed loon.', apply: 'link' },
  { title: 'Wimperstylist voor zaterdag', functions: ['wimperstylist', 'wenkbrauwstylist'], types: ['zelfstandig', 'bijberoep'], regimes: ['vaste-dagen'], workdays: ['za'], start: 'in-overleg', compensationTypes: ['per-behandeling'], experience: 'gewenst', offers: ['werkplek', 'klantenbestand'], aboutCompany: 'Een beautystudio gespecialiseerd in ogen en wenkbrauwen.', whoWeSeek: 'Een wimperstylist die op zaterdag wil werken, ook in bijberoep.', whatWeOffer: 'Een eigen werkplek en vaste klanten.', apply: 'email' },
  { title: 'Huidtherapeut voor esthetische praktijk', functions: ['huidtherapeut', 'medisch-esthetisch-specialist'], types: ['loondienst'], regimes: ['deeltijds'], start: 'onmiddellijk', compensationTypes: ['vast-loon'], experience: 'vereist', offers: ['materiaal', 'opleiding'], aboutCompany: 'Een medisch-esthetische praktijk met de nieuwste apparatuur.', whoWeSeek: 'Een huidtherapeut met ervaring in laser en peelings.', whatWeOffer: 'Werken met topapparatuur en een gemotiveerd team.', apply: 'link' },
  { title: 'Receptioniste voor wellnesscentrum', functions: ['receptionist'], types: ['loondienst'], regimes: ['deeltijds', 'flexibel'], start: 'onmiddellijk', compensationTypes: ['uur'], experience: 'starter', offers: ['flexibele-uren'], aboutCompany: 'Een groot wellnesscentrum met dagspa.', whoWeSeek: 'Een vriendelijke receptioniste die gasten ontvangt en afspraken beheert.', whatWeOffer: 'Een afwisselende job met flexibele uren.', apply: 'email' },
  { title: 'Make-upartist voor events', functions: ['make-upartist'], types: ['zelfstandig'], regimes: ['op-afspraak'], start: 'in-overleg', compensationTypes: ['per-behandeling'], experience: 'vereist', offers: ['marketing'], aboutCompany: 'Een bureau voor bruids- en eventmake-up.', whoWeSeek: 'Een make-upartist die op afspraak wil werken voor huwelijken en shoots.', whatWeOffer: 'Opdrachten via ons netwerk en marketingondersteuning.', apply: 'email' },
  { title: 'Salonmanager', functions: ['salonmanager'], types: ['loondienst'], regimes: ['voltijds'], start: 'datum', compensationTypes: ['vast-loon'], experience: 'vereist', offers: ['doorgroei', 'administratie'], aboutCompany: 'Een groeiende keten van beautysalons.', whoWeSeek: 'Een salonmanager die een team aanstuurt en de planning beheert.', whatWeOffer: 'Een leidinggevende rol met doorgroeimogelijkheden.', apply: 'link' },
  { title: 'Trainer productopleidingen huidverzorging', functions: ['opleider'], types: ['loondienst', 'zelfstandig'], regimes: ['flexibel'], start: 'in-overleg', compensationTypes: ['dag'], compensationAmount: '€350 per dag', experience: 'vereist', offers: ['producten', 'opleiding'], aboutCompany: 'Een professioneel huidverzorgingsmerk.', whoWeSeek: 'Een ervaren schoonheidsspecialiste die trainingen geeft aan salons.', whatWeOffer: 'Trainingsdagen in België en Nederland en een volledige productopleiding.', apply: 'email' },
  { title: 'Vertegenwoordiger salons Vlaanderen', functions: ['sales'], types: ['loondienst'], regimes: ['voltijds'], start: 'onmiddellijk', compensationTypes: ['vast-loon', 'commissie'], experience: 'gewenst', offers: ['producten', 'doorgroei'], aboutCompany: 'Een distributeur van professionele beautyproducten.', whoWeSeek: 'Een commercieel talent met kennis van de beautysector.', whatWeOffer: 'Een vast loon plus commissie en een bedrijfswagen.', apply: 'link' },
  { title: 'Wellnessmedewerker spa', functions: ['wellnessmedewerker', 'masseur'], types: ['loondienst'], regimes: ['deeltijds'], workdays: ['vr', 'za', 'zo'], start: 'onmiddellijk', compensationTypes: ['uur'], experience: 'starter', offers: ['opleiding', 'flexibele-uren'], aboutCompany: 'Een hotelspa met wellnessrituelen.', whoWeSeek: 'Een wellnessmedewerker die rituelen en massages uitvoert.', whatWeOffer: 'Een interne opleiding en weekendtoeslagen.', apply: 'email' },
  { title: 'Barber in loondienst', functions: ['barber'], types: ['loondienst'], regimes: ['voltijds'], start: 'onmiddellijk', compensationTypes: ['vast-loon'], experience: 'gewenst', offers: ['klantenbestand', 'producten'], aboutCompany: 'Een barbershop met een trouwe klantenkring.', whoWeSeek: 'Een barber met oog voor fades en baardverzorging.', whatWeOffer: 'Een vaste job in een gezellig team.', apply: 'email' },
  { title: 'PMU-specialist op commissiebasis', functions: ['pmu-specialist'], types: ['commissie'], regimes: ['enkele-dagen'], workdays: ['di', 'do'], start: 'in-overleg', compensationTypes: ['commissie'], compensationAmount: '45% van de omzet', experience: 'vereist', offers: ['werkplek', 'marketing'], aboutCompany: 'Een beautysalon met een groeiende vraag naar permanente make-up.', whoWeSeek: 'Een PMU-specialist met portfolio.', whatWeOffer: 'Een eigen behandelruimte en marketing via onze kanalen.', apply: 'email' },
  { title: 'Nagelstyliste in loondienst', functions: ['nagelstylist'], types: ['loondienst'], regimes: ['deeltijds'], start: 'onmiddellijk', compensationTypes: ['vast-loon'], experience: 'starter', offers: ['opleiding', 'producten'], aboutCompany: 'Een nagelstudio met drie werkplekken.', whoWeSeek: 'Een nagelstyliste, ook starters zijn welkom.', whatWeOffer: 'Een opleiding in nail art en een vast contract.', apply: 'link' },
  { title: 'Fysiotherapeut voor wellnesspraktijk', functions: ['fysiotherapeut'], types: ['zelfstandig'], regimes: ['enkele-dagen'], start: 'datum', compensationTypes: ['in-overleg'], experience: 'vereist', offers: ['werkplek', 'samenwerking'], aboutCompany: 'Een praktijk met massage, yoga en fysiotherapie.', whoWeSeek: 'Een fysiotherapeut die zelfstandig wil samenwerken.', whatWeOffer: 'Een ruimte in een multidisciplinaire praktijk.', apply: 'email' },
]

// Brands get roles a brand or supplier would hire for; salons and
// professionals the salon roles.
const BRAND_PICKS = [11, 12, 7, 9, 10, 8]
const POOLS = {
  brand: BRAND_PICKS.map((i) => TEMPLATES[i]),
  trainer: TEMPLATES.filter((_, i) => !BRAND_PICKS.includes(i)),
}

// How many demo vacancies each plan gets per account, and how many accounts.
const PLAN: Record<string, { per: number; accounts: number }> = {
  basis: { per: 1, accounts: 4 },
  medium: { per: 2, accounts: 2 },
  premium: { per: 2, accounts: 2 },
  partner_professional: { per: 2, accounts: 1 },
  partner_premium: { per: 2, accounts: 2 },
}

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const existing = await payload.count({ collection: 'vacancies', where: { 'seo.focusKeyphrase': { equals: DEMO } } as never, overrideAccess: true })
  if (existing.totalDocs) return // already seeded

  const nextDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString()
  }
  for (const role of ['trainer', 'brand'] as const) {
    const collection = role === 'brand' ? 'brands' : 'trainers'
    const profiles = await payload.find({ collection, depth: 1, limit: 200, sort: 'slug', overrideAccess: true })
    const used: Record<string, number> = {}
    const pool = POOLS[role]
    let t = 0
    for (const profile of profiles.docs as Record<string, any>[]) {
      const owner = profile.owner && typeof profile.owner === 'object' ? profile.owner : null
      if (!owner) continue
      const tier = tierForUser({ ...owner, role }).tier
      const plan = PLAN[tier]
      if (!plan || (used[tier] || 0) >= plan.accounts) continue
      // Stay within the plan: skip accounts that already have vacancies online.
      const own = await payload.count({ collection: 'vacancies', where: { and: [{ status: { equals: 'published' } }, { [role]: { equals: profile.id } }] } as never, overrideAccess: true })
      if (own.totalDocs) continue
      used[tier] = (used[tier] || 0) + 1
      const city = profile.location?.city || 'Antwerpen'
      for (let i = 0; i < plan.per && t < pool.length; i++) {
        const tpl = pool[t++]
        await payload.create({
          collection: 'vacancies',
          overrideAccess: true,
          data: {
            title: tpl.title,
            slug: await uniqueVacancySlug(payload, tpl.title, city),
            status: 'published',
            [role]: profile.id,
            companyName: profile.name || profile.displayName || 'Demo salon',
            country: profile.location?.country === 'nl' ? 'nl' : 'be',
            city,
            website: profile.website || '',
            types: tpl.types,
            functions: tpl.functions,
            sectors: sectorsFor(tpl.functions),
            regimes: tpl.regimes,
            workdays: tpl.workdays || [],
            start: tpl.start,
            startDate: tpl.start === 'datum' ? nextDate() : null,
            compensationTypes: tpl.compensationTypes,
            compensationAmount: tpl.compensationAmount || '',
            experience: tpl.experience,
            offers: tpl.offers,
            aboutCompany: tpl.aboutCompany,
            whoWeSeek: tpl.whoWeSeek,
            whatWeOffer: tpl.whatWeOffer,
            applyMethod: tpl.apply,
            applyUrl: tpl.apply === 'link' ? profile.website || 'https://example.com/vacatures' : '',
            contactName: owner.name || profile.name || 'Contactpersoon',
            contactEmail: owner.email,
            seo: { focusKeyphrase: DEMO },
          } as never,
        })
      }
    }
  }
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.delete({ collection: 'vacancies', where: { 'seo.focusKeyphrase': { equals: DEMO } } as never, overrideAccess: true })
}
