import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-vercel-postgres'

/**
 * Sync the category taxonomy to the client's authoritative list (feedback #3).
 * Production still had the old 41-category taxonomy while the new 93-category
 * list only existed in dev. This migration makes any DB match the client list:
 *  - upsert the 13 main categories + 80 subcategories by slug (reparenting the
 *    handful of slugs that overlap the old set, e.g. aromatherapie/sportmassage);
 *  - remap every course on a now-removed ("legacy") category to the best-fit new
 *    category (out-of-scope courses — yoga/voeding/personal development — go to
 *    Holistische & Energetische Therapieën per the client decision);
 *  - delete the legacy categories.
 * Idempotent: on a DB already on the new list, everything is a no-op.
 */

const MAINS: [string, string][] = [
  ['gelaatsverzorging-skincare', 'Gelaatsverzorging & Skincare'],
  ['esthetische-huidtechnieken', 'Esthetische huidtechnieken'],
  ['ontharing-laserbehandelingen', 'Ontharing & Laserbehandelingen'],
  ['waxing-manuele-ontharing', 'Waxing & Manuele Ontharing'],
  ['make-up-visagie', 'Make-up & Visagie'],
  ['wenkbrauwen-wimpers', 'Wenkbrauwen & Wimpers'],
  ['nagels-hand-voetverzorging', 'Nagels & Hand/Voetverzorging'],
  ['massage-lichaamsbehandelingen', 'Massage & Lichaamsbehandelingen'],
  ['haar-scalp-treatments', 'Haar & Scalp Treatments'],
  ['beleving-klantenervaring', 'Beleving & Klantenervaring'],
  ['holistische-energetische-therapieen', 'Holistische & Energetische Therapieën'],
  ['business-salon-groei', 'Business & Salon Groei'],
  ['product-merk-opleidingen', 'Product & Merk Opleidingen'],
]

const SUBS: [string, string, string][] = [
  // slug, name, parentSlug
  ['klassieke-facials', 'Klassieke facials', 'gelaatsverzorging-skincare'],
  ['deep-cleansing', 'Deep cleansing', 'gelaatsverzorging-skincare'],
  ['huidanalyse', 'Huidanalyse', 'gelaatsverzorging-skincare'],
  ['skin-expert', 'Skin expert', 'gelaatsverzorging-skincare'],
  ['acne-expert', 'Acne expert', 'gelaatsverzorging-skincare'],
  ['producttrainingen', 'Producttrainingen', 'gelaatsverzorging-skincare'],
  ['gezichtsmassages', 'Gezichtsmassages', 'gelaatsverzorging-skincare'],
  ['microneedling', 'Microneedling', 'esthetische-huidtechnieken'],
  ['dermaplaning', 'Dermaplaning', 'esthetische-huidtechnieken'],
  ['chemische-peelings', 'Chemische peelings', 'esthetische-huidtechnieken'],
  ['huidverbetering', 'Huidverbetering', 'esthetische-huidtechnieken'],
  ['anti-aging-technieken', 'Anti-aging technieken', 'esthetische-huidtechnieken'],
  ['mesotherapie', 'Mesotherapie', 'esthetische-huidtechnieken'],
  ['led-therapie', 'LED-therapie', 'esthetische-huidtechnieken'],
  ['laser-ontharing', 'Laser ontharing', 'ontharing-laserbehandelingen'],
  ['ipl-ontharing', 'IPL ontharing', 'ontharing-laserbehandelingen'],
  ['lasertypes', 'Diode / Alexandrite / Nd:YAG laser', 'ontharing-laserbehandelingen'],
  ['ontharingstechnieken', 'Ontharingstechnieken', 'ontharing-laserbehandelingen'],
  ['veilige-laserbehandeling', 'Veilige laserbehandeling', 'ontharing-laserbehandelingen'],
  ['nazorg-parameters', 'Nazorg & parameters', 'ontharing-laserbehandelingen'],
  ['body-waxing', 'Body waxing', 'waxing-manuele-ontharing'],
  ['facial-waxing', 'Facial waxing', 'waxing-manuele-ontharing'],
  ['sugaring', 'Sugaring', 'waxing-manuele-ontharing'],
  ['threading', 'Threading', 'waxing-manuele-ontharing'],
  ['ontharingsproducten-technieken', 'Ontharingsproducten & technieken', 'waxing-manuele-ontharing'],
  ['basis-make-up', 'Basis make-up', 'make-up-visagie'],
  ['bridal-make-up', 'Bridal make-up', 'make-up-visagie'],
  ['editorial-fashion', 'Editorial & Fashion', 'make-up-visagie'],
  ['color-theory', 'Color theory', 'make-up-visagie'],
  ['professioneel-advies-verkoop', 'Professioneel advies & verkoop', 'make-up-visagie'],
  ['airbrush-make-up', 'Airbrush make-up', 'make-up-visagie'],
  ['brow-shaping-design', 'Brow shaping & design', 'wenkbrauwen-wimpers'],
  ['brow-lamination', 'Brow lamination', 'wenkbrauwen-wimpers'],
  ['lash-lift', 'Lash lift', 'wenkbrauwen-wimpers'],
  ['lash-extensions', 'Lash extensions', 'wenkbrauwen-wimpers'],
  ['tinting-kleuring', 'Tinting & kleuring', 'wenkbrauwen-wimpers'],
  ['henna-brows', 'Henna brows', 'wenkbrauwen-wimpers'],
  ['manicure-pedicure', 'Manicure & Pedicure', 'nagels-hand-voetverzorging'],
  ['nail-art', 'Nail art', 'nagels-hand-voetverzorging'],
  ['gel-acryl', 'Gel & Acryl', 'nagels-hand-voetverzorging'],
  ['medische-pedicure', 'Medische pedicure', 'nagels-hand-voetverzorging'],
  ['hand-voetmassages', 'Hand- & voetmassages', 'nagels-hand-voetverzorging'],
  ['nagelprothesen', 'Nagelprothesen', 'nagels-hand-voetverzorging'],
  ['ontspanningsmassage', 'Ontspanningsmassage', 'massage-lichaamsbehandelingen'],
  ['deep-tissue', 'Deep tissue', 'massage-lichaamsbehandelingen'],
  ['lymfedrainage', 'Lymfedrainage', 'massage-lichaamsbehandelingen'],
  ['hot-stone', 'Hot stone', 'massage-lichaamsbehandelingen'],
  ['kruidenstempels', 'Kruidenstempels', 'massage-lichaamsbehandelingen'],
  ['sportmassage', 'Sportmassage', 'massage-lichaamsbehandelingen'],
  ['body-rituals-scrubs', 'Body rituals & scrubs', 'massage-lichaamsbehandelingen'],
  ['scalp-care', 'Scalp care', 'haar-scalp-treatments'],
  ['headspa', 'Headspa', 'haar-scalp-treatments'],
  ['hoofdhuidmassages', 'Hoofdhuidmassages', 'haar-scalp-treatments'],
  ['haarrituelen', 'Haarrituelen', 'haar-scalp-treatments'],
  ['hair-treatments', 'Hair treatments', 'haar-scalp-treatments'],
  ['belevingsfacials', 'Belevingsfacials', 'beleving-klantenervaring'],
  ['handdoek-vouwtechnieken', 'Handdoektechnieken & vouwtechnieken', 'beleving-klantenervaring'],
  ['sensorische-behandelingen', 'Sensorische behandelingen', 'beleving-klantenervaring'],
  ['klantenbeleving-hospitality', 'Klantenbeleving & hospitality', 'beleving-klantenervaring'],
  ['salon-transformatie-interieur', 'Salon transformatie & interieur', 'beleving-klantenervaring'],
  ['ritual-ceremony', 'Ritual & ceremony behandelingen', 'beleving-klantenervaring'],
  ['luxe-belevingsconcepten', 'Luxe belevingsconcepten', 'beleving-klantenervaring'],
  ['sound-healing', 'Sound healing', 'holistische-energetische-therapieen'],
  ['reiki', 'Reiki', 'holistische-energetische-therapieen'],
  ['aromatherapie', 'Aromatherapie', 'holistische-energetische-therapieen'],
  ['energetische-healing', 'Energetische healing', 'holistische-energetische-therapieen'],
  ['ademwerk', 'Ademwerk', 'holistische-energetische-therapieen'],
  ['meditatie-mindfulness', 'Meditatie & mindfulness', 'holistische-energetische-therapieen'],
  ['social-media-marketing', 'Social media marketing', 'business-salon-groei'],
  ['klantenwerving', 'Klantenwerving', 'business-salon-groei'],
  ['pricing-verkoop', 'Pricing & verkoop', 'business-salon-groei'],
  ['klantenbeleving', 'Klantenbeleving', 'business-salon-groei'],
  ['branding', 'Branding', 'business-salon-groei'],
  ['salon-management', 'Salon management', 'business-salon-groei'],
  ['fotografie-content', 'Fotografie & content', 'business-salon-groei'],
  ['merktrainingen', 'Merktrainingen', 'product-merk-opleidingen'],
  ['productkennis', 'Productkennis', 'product-merk-opleidingen'],
  ['sales-training', 'Sales training', 'product-merk-opleidingen'],
  ['distributeurstraining', 'Distributeurstraining', 'product-merk-opleidingen'],
  ['brand-academies', 'Brand academies', 'product-merk-opleidingen'],
]

// Legacy (old-taxonomy) slug -> best-fit new slug for reassigning courses.
// Anything not listed falls back to DEFAULT_TARGET.
const DEFAULT_TARGET = 'holistische-energetische-therapieen'
const LEGACY_MAP: Record<string, string> = {
  schoonheidszorg: 'gelaatsverzorging-skincare',
  'schoonheid-verzorging': 'gelaatsverzorging-skincare',
  gezichtsbehandelingen: 'klassieke-facials',
  lichaamsverzorging: 'massage-lichaamsbehandelingen',
  massage: 'massage-lichaamsbehandelingen',
  'massage-lichaamswerk': 'massage-lichaamsbehandelingen',
  'klassieke-massage': 'ontspanningsmassage',
  'ayurvedische-massage': 'massage-lichaamsbehandelingen',
  voetreflexologie: 'massage-lichaamsbehandelingen',
  'hot-stone-massage': 'hot-stone',
  'make-up': 'make-up-visagie',
  nagelstyliste: 'nagels-hand-voetverzorging',
  haarverzorging: 'haar-scalp-treatments',
  'epilatie-ontharing': 'ontharing-laserbehandelingen',
  ayurveda: 'holistische-energetische-therapieen',
  kristaltherapie: 'holistische-energetische-therapieen',
  'wellness-holistische-therapie': 'holistische-energetische-therapieen',
  meditatie: 'meditatie-mindfulness',
  mindfulness: 'meditatie-mindfulness',
  yoga: 'holistische-energetische-therapieen',
  'beweging-yoga': 'holistische-energetische-therapieen',
  pilates: 'holistische-energetische-therapieen',
  'tai-chi-qi-gong': 'holistische-energetische-therapieen',
  'dans-beweging': 'holistische-energetische-therapieen',
  voeding: 'holistische-energetische-therapieen',
  'voeding-gezondheid': 'holistische-energetische-therapieen',
  voedingsadvies: 'holistische-energetische-therapieen',
  'orthomoleculaire-therapie': 'holistische-energetische-therapieen',
  'plantaardige-voeding': 'holistische-energetische-therapieen',
  darmgezondheid: 'holistische-energetische-therapieen',
  'persoonlijke-ontwikkeling': 'holistische-energetische-therapieen',
  'persoonlijke-ontwikkeling-hoofd': 'holistische-energetische-therapieen',
  coaching: 'holistische-energetische-therapieen',
  nlp: 'holistische-energetische-therapieen',
  stressmanagement: 'holistische-energetische-therapieen',
}

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const existing = await payload.find({ collection: 'categories' as never, limit: 500, depth: 0, overrideAccess: true })
  const bySlug = new Map<string, { id: number | string; slug: string }>()
  for (const d of existing.docs as unknown as { id: number | string; slug: string }[]) bySlug.set(d.slug, d)
  const idBySlug = new Map<string, number | string>()

  // 1. Upsert mains (parent = null)
  for (const [slug, name] of MAINS) {
    const ex = bySlug.get(slug)
    if (ex) {
      await payload.update({ collection: 'categories' as never, id: ex.id as never, data: { name, parent: null } as never, overrideAccess: true })
      idBySlug.set(slug, ex.id)
    } else {
      const created = await payload.create({ collection: 'categories' as never, data: { slug, name } as never, overrideAccess: true })
      idBySlug.set(slug, (created as { id: number | string }).id)
    }
  }

  // 2. Upsert subs (parent resolved from idBySlug)
  for (const [slug, name, parentSlug] of SUBS) {
    const parentId = idBySlug.get(parentSlug)
    const ex = bySlug.get(slug)
    if (ex) {
      await payload.update({ collection: 'categories' as never, id: ex.id as never, data: { name, parent: parentId } as never, overrideAccess: true })
      idBySlug.set(slug, ex.id)
    } else {
      const created = await payload.create({ collection: 'categories' as never, data: { slug, name, parent: parentId } as never, overrideAccess: true })
      idBySlug.set(slug, (created as { id: number | string }).id)
    }
  }

  // 3. Legacy = pre-existing categories whose slug is not in the new list.
  const desired = new Set<string>([...MAINS.map((m) => m[0]), ...SUBS.map((s) => s[0])])
  const legacy = (existing.docs as unknown as { id: number | string; slug: string }[]).filter((d) => !desired.has(d.slug))

  // 4. Remap courses off each legacy category to its best-fit new category.
  for (const lc of legacy) {
    const targetSlug = LEGACY_MAP[lc.slug] || DEFAULT_TARGET
    const targetId = idBySlug.get(targetSlug)
    if (!targetId) continue
    const courses = await payload.find({ collection: 'courses' as never, where: { category: { equals: lc.id } } as never, limit: 1000, depth: 0, overrideAccess: true })
    for (const co of courses.docs as unknown as { id: number | string }[]) {
      await payload.update({ collection: 'courses' as never, id: co.id as never, data: { category: targetId } as never, overrideAccess: true })
    }
  }

  // 5. Delete legacy categories — children (with a parent) first to avoid
  //    dangling self-references, then the roots.
  const withParentFirst = [...legacy].sort((a, b) => {
    const aRoot = !(a as { parent?: unknown }).parent
    const bRoot = !(b as { parent?: unknown }).parent
    return aRoot === bRoot ? 0 : aRoot ? 1 : -1
  })
  for (const lc of withParentFirst) {
    await payload.delete({ collection: 'categories' as never, id: lc.id as never, overrideAccess: true })
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // No-op: the old taxonomy is not restored.
}
