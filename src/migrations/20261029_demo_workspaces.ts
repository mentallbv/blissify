import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-vercel-postgres'
import { tierForUser } from '@/lib/tier-features'
import { uniqueWorkspaceSlug } from '@/lib/workspace-form'
import { deriveAvailability, sectorsForActivities } from '@/lib/workspace-options'

/**
 * Demo werkruimtes for testing (not real data), spread over every plan that
 * may offer workspaces within its limit, like the demo vacatures. Marked with
 * seo.focusKeyphrase = DEMO; `down` removes exactly those.
 */
const DEMO = 'demo-werkruimte'

type B = [string, string, string]
type F = [string, 'inbegrepen' | 'meerprijs', number?, string?]
type T = {
  title: string; salonTypes: string[]; workplaceTypes: string[]; usage: string; access: string
  rentFormula: string; rentAmount?: number; rentUnit?: string; rentPercentage?: number; deposit: string; depositAmount?: number
  features: string[]; facilities: F[]; activities: string[]; schedule: B[]; negotiable: boolean; availableFrom: string; description: string
}

const TEMPLATES: T[] = [
  { title: 'Kappersstoel te huur', salonTypes: ['kapsalon'], workplaceTypes: ['werkstoel'], usage: 'gedeeld', access: 'afgesproken', rentFormula: 'vast', rentAmount: 60, rentUnit: 'dag', deposit: 'geen', features: ['dicht-bij-openbaar-vervoer', 'natuurlijk-daglicht', 'eigen-klanten-ontvangen-toegestaan'], facilities: [['wifi', 'inbegrepen'], ['kapstoel-met-spiegel', 'inbegrepen'], ['haarwasbak', 'inbegrepen'], ['shampoo-en-haarverzorgingsproducten', 'meerprijs', 3, 'behandeling']], activities: ['kapper-haarverzorging'], schedule: [['di', '09:00', '18:00'], ['wo', '09:00', '18:00'], ['vr', '09:00', '20:00']], negotiable: true, availableFrom: 'onmiddellijk', description: 'Een stoel in een gezellig kapsalon in het centrum, met eigen spiegel en haarwasbak.' },
  { title: 'Behandelruimte voor massage', salonTypes: ['massagesalon', 'wellness-spa'], workplaceTypes: ['behandelruimte'], usage: 'exclusief', access: 'afgesproken', rentFormula: 'vast', rentAmount: 35, rentUnit: 'dagdeel', deposit: 'bedrag', depositAmount: 150, features: ['gratis-parking-beschikbaar', 'mogelijkheid-tot-verduisteren', 'afzonderlijk-afsluitbare-werkruimte'], facilities: [['wifi', 'inbegrepen'], ['behandelbank-massagetafel', 'inbegrepen'], ['handdoeken', 'meerprijs', 5, 'dag'], ['warmhoudapparaat-voor-massageolie', 'inbegrepen']], activities: ['massage', 'wellnessbehandelingen'], schedule: [['ma', '18:00', '22:00'], ['do', '18:00', '22:00'], ['za', '09:00', '13:00']], negotiable: true, availableFrom: 'onmiddellijk', description: 'Rustige, verduisterbare ruimte met elektrische massagetafel. Ideaal voor masseurs die avonden of zaterdag willen werken.' },
  { title: 'Nageltafel in beautysalon', salonTypes: ['nagelstudio', 'schoonheidssalon'], workplaceTypes: ['werkstoel', 'gedeelde-ruimte'], usage: 'gedeeld', access: 'afgesproken', rentFormula: 'percentage', rentPercentage: 40, deposit: 'geen', features: ['eigen-materiaal-meebrengen-toegestaan', 'eigen-klanten-ontvangen-toegestaan'], facilities: [['nageltafel-met-afzuiging', 'inbegrepen'], ['uv-led-nagellamp', 'inbegrepen'], ['nagelproducten', 'meerprijs'], ['online-agendasysteem-boekingssysteem', 'inbegrepen']], activities: ['manicure-nagelbehandelingen'], schedule: [['wo', '10:00', '18:00'], ['za', '09:00', '17:00']], negotiable: false, availableFrom: 'onmiddellijk', description: 'Een nageltafel met afzuiging in een druk bezocht beautysalon. Klanten via ons boekingssysteem mogelijk.' },
  { title: 'Volledig ingerichte praktijkruimte', salonTypes: ['therapiepraktijk'], workplaceTypes: ['volledig-salon'], usage: 'exclusief', access: 'zelfstandig', rentFormula: 'vast', rentAmount: 650, rentUnit: 'maand', deposit: 'bedrag', depositAmount: 1300, features: ['rolstoeltoegankelijk', 'eigen-ingang', '24-7-toegang-mogelijk', 'persoonlijke-sleutel-toegang-mogelijk'], facilities: [['wifi', 'inbegrepen'], ['elektriciteitsverbruik', 'inbegrepen'], ['waterverbruik', 'inbegrepen'], ['ontvangstruimte-wachtruimte', 'inbegrepen'], ['schoonmaakservice', 'meerprijs', 40, 'maand']], activities: ['coaching', 'consultaties-adviesgesprekken', 'lichaamstherapie'], schedule: [['ma', '08:00', '20:00'], ['di', '08:00', '20:00'], ['wo', '08:00', '20:00'], ['do', '08:00', '20:00'], ['vr', '08:00', '20:00']], negotiable: true, availableFrom: 'datum', description: 'Een volledige praktijkruimte met eigen ingang en wachtruimte, voor therapeuten en coaches.' },
  { title: 'Pedicureruimte op vaste dagen', salonTypes: ['pedicure'], workplaceTypes: ['behandelruimte'], usage: 'exclusief', access: 'afgesproken', rentFormula: 'vast', rentAmount: 25, rentUnit: 'uur', deposit: 'in-overleg', features: ['gelijkvloerse-toegang', 'parking-voor-de-deur'], facilities: [['pedicurestoel', 'inbegrepen'], ['elektrische-nagelfrees', 'inbegrepen'], ['sterilisator-autoclaaf', 'inbegrepen'], ['wegwerpmaterialen', 'meerprijs', 2, 'behandeling']], activities: ['pedicure-voetverzorging', 'medische-pedicure'], schedule: [['di', '09:00', '12:00'], ['di', '13:00', '17:00'], ['vr', '09:00', '17:00']], negotiable: false, availableFrom: 'onmiddellijk', description: 'Een volledig uitgeruste pedicureruimte op dinsdag en vrijdag.' },
  { title: 'Wimper- en browstudio delen', salonTypes: ['wimperstudio', 'wenkbrauwstudio'], workplaceTypes: ['behandelruimte'], usage: 'beide', access: 'in-overleg', rentFormula: 'vast-percentage', rentAmount: 200, rentUnit: 'maand', rentPercentage: 15, deposit: 'geen', features: ['natuurlijk-daglicht', 'eigen-branding-logo-in-de-ruimte-toegestaan'], facilities: [['behandelbank-massagetafel', 'inbegrepen'], ['loeplamp', 'inbegrepen'], ['koffie-thee', 'inbegrepen']], activities: ['wimperbehandelingen', 'wenkbrauwbehandelingen', 'permanente-make-up-pmu'], schedule: [['ma', '10:00', '18:00'], ['zo', '10:00', '16:00']], negotiable: true, availableFrom: 'in-overleg', description: 'Een lichte studio voor wimpers, brows en PMU. Exclusief of gedeeld te gebruiken.' },
  { title: 'Ruimte voor workshops en opleidingen', salonTypes: ['schoonheidssalon', 'wellness-spa'], workplaceTypes: ['gedeelde-ruimte'], usage: 'exclusief', access: 'afgesproken', rentFormula: 'vast', rentAmount: 180, rentUnit: 'dag', deposit: 'geen', features: ['ruimte-geschikt-voor-opleidingen-of-workshops', 'ruimte-geschikt-voor-groepsactiviteiten', 'airconditioning'], facilities: [['wifi', 'inbegrepen'], ['keuken-kitchenette', 'inbegrepen'], ['bureau-werktafel', 'inbegrepen'], ['koffie-thee', 'meerprijs', 4, 'gebruik']], activities: ['schoonheidsbehandelingen-gelaatsverzorging', 'make-up-visagie'], schedule: [['za', '09:00', '17:00'], ['zo', '09:00', '17:00']], negotiable: true, availableFrom: 'onmiddellijk', description: 'Een ruime zaal voor productopleidingen, workshops en demo’s, ook in het weekend.' },
  { title: 'Barberstoel in barbershop', salonTypes: ['barbershop'], workplaceTypes: ['werkstoel'], usage: 'gedeeld', access: 'afgesproken', rentFormula: 'vast', rentAmount: 120, rentUnit: 'week', deposit: 'geen', features: ['eigen-materiaal-meebrengen-toegestaan', 'producten-ter-plaatse-verkopen-toegestaan'], facilities: [['barberstoel', 'inbegrepen'], ['muziekinstallatie', 'inbegrepen'], ['kassasysteem', 'inbegrepen']], activities: ['barber'], schedule: [['do', '12:00', '20:00'], ['vr', '12:00', '20:00'], ['za', '09:00', '18:00']], negotiable: false, availableFrom: 'onmiddellijk', description: 'Een barberstoel in een drukke barbershop met vaste klanten.' },
  { title: 'Esthetische behandelkamer', salonTypes: ['medisch-esthetisch'], workplaceTypes: ['behandelruimte'], usage: 'exclusief', access: 'afgesproken', rentFormula: 'in-overleg', deposit: 'in-overleg', features: ['airconditioning', 'afzonderlijk-afsluitbare-werkruimte'], facilities: [['elektrisch-verstelbare-behandelbank', 'inbegrepen'], ['professionele-huidanalyseapparatuur', 'meerprijs', 15, 'behandeling'], ['reinigings-en-desinfectiemiddelen', 'inbegrepen']], activities: ['huidtherapie', 'laserbehandelingen-definitieve-ontharing', 'medisch-esthetische-behandelingen'], schedule: [['wo', '09:00', '17:00']], negotiable: true, availableFrom: 'onmiddellijk', description: 'Een behandelkamer met topapparatuur voor huidtherapie en esthetische behandelingen.' },
  { title: 'Kabine in wellnesscentrum', salonTypes: ['wellness-spa'], workplaceTypes: ['behandelruimte'], usage: 'gedeeld', access: 'afgesproken', rentFormula: 'vast', rentAmount: 90, rentUnit: 'dag', deposit: 'geen', features: ['ventilatie', 'mogelijkheid-tot-verduisteren'], facilities: [['douche', 'inbegrepen'], ['kleedruimte', 'inbegrepen'], ['lakens-behandellinnen', 'meerprijs', 6, 'dag'], ['hotstoneverwarmer', 'inbegrepen']], activities: ['massage', 'wellnessbehandelingen', 'energetische-therapie'], schedule: [['vr', '14:00', '22:00'], ['za', '10:00', '22:00'], ['zo', '10:00', '18:00']], negotiable: true, availableFrom: 'onmiddellijk', description: 'Een kabine in een groot wellnesscentrum met sauna en hammam.' },
]

// Lite 1, Premium 2, Ultimate 2 per account; Partner Premium 2, Partner Ultimate 2.
const PLAN: Record<string, { per: number; accounts: number }> = {
  basis: { per: 1, accounts: 2 },
  medium: { per: 2, accounts: 1 },
  premium: { per: 2, accounts: 1 },
  partner_professional: { per: 1, accounts: 1 },
  partner_premium: { per: 2, accounts: 1 },
}

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const existing = await payload.count({ collection: 'workspaces', where: { 'seo.focusKeyphrase': { equals: DEMO } } as never, overrideAccess: true })
  if (existing.totalDocs) return
  const inTwoWeeks = new Date(Date.now() + 14 * 86400000).toISOString()
  let t = 0
  for (const role of ['trainer', 'brand'] as const) {
    const collection = role === 'brand' ? 'brands' : 'trainers'
    const profiles = await payload.find({ collection, depth: 1, limit: 200, sort: '-slug', overrideAccess: true })
    const used: Record<string, number> = {}
    for (const profile of profiles.docs as Record<string, any>[]) {
      const owner = profile.owner && typeof profile.owner === 'object' ? profile.owner : null
      if (!owner) continue
      const tier = tierForUser({ ...owner, role }).tier
      const plan = PLAN[tier]
      if (!plan || (used[tier] || 0) >= plan.accounts) continue
      const own = await payload.count({ collection: 'workspaces', where: { and: [{ status: { equals: 'published' } }, { [role]: { equals: profile.id } }] } as never, overrideAccess: true })
      if (own.totalDocs) continue
      used[tier] = (used[tier] || 0) + 1
      const city = profile.location?.city || 'Gent'
      for (let i = 0; i < plan.per && t < TEMPLATES.length; i++) {
        const tpl = TEMPLATES[t++]
        const schedule = tpl.schedule.map(([day, from, to]) => ({ day, from, to }))
        const { days, parts } = deriveAvailability(schedule)
        await payload.create({
          collection: 'workspaces',
          overrideAccess: true,
          data: {
            title: `${tpl.title} in ${city}`,
            slug: await uniqueWorkspaceSlug(payload, `${tpl.title} in ${city}`, city),
            status: 'published',
            [role]: profile.id,
            companyName: profile.name || profile.displayName || 'Demo salon',
            country: profile.location?.country === 'nl' ? 'nl' : 'be',
            city,
            website: profile.website || '',
            salonTypes: tpl.salonTypes,
            workplaceTypes: tpl.workplaceTypes,
            usage: tpl.usage,
            access: tpl.access,
            rentFormula: tpl.rentFormula,
            rentAmount: tpl.rentAmount ?? null,
            rentUnit: tpl.rentUnit ?? null,
            rentPercentage: tpl.rentPercentage ?? null,
            deposit: tpl.deposit,
            depositAmount: tpl.depositAmount ?? null,
            features: tpl.features,
            facilities: tpl.facilities.map(([key, mode, price, unit]) => ({ key, mode, price: price ?? null, unit: unit ?? null })),
            activities: tpl.activities,
            sectors: sectorsForActivities(tpl.activities),
            availableFrom: tpl.availableFrom,
            availableDate: tpl.availableFrom === 'datum' ? inTwoWeeks : null,
            schedule,
            availableDays: days,
            dayparts: parts,
            otherTimesNegotiable: tpl.negotiable,
            description: tpl.description,
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
  await payload.delete({ collection: 'workspaces', where: { 'seo.focusKeyphrase': { equals: DEMO } } as never, overrideAccess: true })
}
