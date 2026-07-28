import { getPayload } from 'payload'
import config from '@payload-config'

// ── Helpers ──────────────────────────────────────────────────────────────────
const rt = (text: string) => ({
  root: {
    type: 'root',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', text, version: 1 }] }],
  },
})

const futureDate = (monthsAhead: number) => {
  const d = new Date()
  d.setMonth(d.getMonth() + monthsAhead)
  d.setHours(10, 0, 0, 0)
  return d.toISOString()
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const PASSWORD = 'Test1234!'
const TEST_NOTIFY = 'test-inschrijvingen@blissify.be'

// ── Dummy imagery (downloaded + uploaded into Media at seed time) ────────────
// Unsplash photo IDs are topical; a Picsum fallback guarantees an image even if
// an ID is unavailable. Brand logos use a wordmark generator, opleider avatars
// use real portrait photos - both reliable, no API key.
const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?w=1200&h=800&q=80&auto=format&fit=crop`

// Course cover photos by topic (2 per topic for variety).
const TOPIC_IMG: Record<string, string[]> = {
  skincare: ['1616394584738-fc6e612e71b9', '1570172619644-dfd03ed5d881'],
  facials: ['1512290923902-8a9f81dc236c', '1620331311520-246422fd82f9'],
  nails: ['1604654894610-df63bc536371', '1522337660859-02fbefca4702'],
  makeup: ['1522335789203-aabd1fc54bc9', '1596462502278-27bfdc403348'],
  hair: ['1560066984-138dadb4c035', '1522337360788-8b13dee7a37e'],
  waxing: ['1608248543803-ba4f8c70ae0b', '1519824145371-296894a0daa9'],
  massage: ['1519823551278-64ac92734fb1', '1600334129128-685c5582fd35'],
  wellness: ['1600334089648-b0d9d3028eb2', '1545205597-3d9d02c29597'],
  body: ['1519824145371-296894a0daa9', '1540555700478-4be289fbecef'],
  nutrition: ['1490645935967-10de6ba17061', '1512621776951-a57141f2eefd'],
  yoga: ['1544367567-0f2fcb009e0b', '1506126613408-eca07ce68773'],
  business: ['1600880292203-757bb62b4baf', '1556740738-b6a63e27c4df'],
}
const CAT_TOPIC: Record<string, string> = {
  nagelstyliste: 'nails', schoonheidszorg: 'skincare', gezichtsbehandelingen: 'facials', 'make-up': 'makeup',
  haarverzorging: 'hair', 'epilatie-ontharing': 'waxing', lichaamsverzorging: 'body',
  massage: 'massage', 'klassieke-massage': 'massage', sportmassage: 'massage', 'hot-stone-massage': 'massage',
  voetreflexologie: 'massage', lymfedrainage: 'massage', 'ayurvedische-massage': 'massage',
  aromatherapie: 'wellness', reiki: 'wellness', 'energetische-healing': 'wellness', ayurveda: 'wellness', meditatie: 'wellness', mindfulness: 'wellness',
  yoga: 'yoga', pilates: 'yoga', voeding: 'nutrition', darmgezondheid: 'nutrition',
  'persoonlijke-ontwikkeling': 'business', coaching: 'business',
}
const courseImg = (categorySlug: string, idx: number): string => {
  const arr = TOPIC_IMG[CAT_TOPIC[categorySlug] || 'wellness'] || TOPIC_IMG.wellness
  return unsplash(arr[idx % arr.length])
}
// Salon / product-shelf style cover photos for brand pages.
const BRAND_COVER_IDS = ['1560066984-138dadb4c035', '1596462502278-27bfdc403348', '1522337660859-02fbefca4702', '1600334089648-b0d9d3028eb2', '1556760544-74068565f05c', '1470259078422-826894b933aa']
// Portrait headshots per opleider (reliable, diverse).
const HEADSHOT: Record<string, string> = {
  sara: 'women/44', tom: 'men/32', jana: 'women/68', kevin: 'men/75',
  nele: 'women/12', bram: 'men/46', eline: 'women/33', wout: 'men/22',
  lieve: 'women/58', anke: 'women/25', sofie: 'women/90', ruben: 'men/60',
}
const headshotUrl = (key: string) => `https://randomuser.me/api/portraits/${HEADSHOT[key] || 'women/1'}.jpg`
const logoUrl = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=256&background=1a2e25&color=f5f0ea&bold=true&format=png`

// Fetch an image (with Picsum fallback) and upload it into the Media collection.
const mediaCache = new Map<string, number | null>()
async function uploadImage(
  payload: Awaited<ReturnType<typeof getPayload>>,
  url: string,
  alt: string,
  fallbackSeed?: string,
): Promise<number | null> {
  if (mediaCache.has(url)) return mediaCache.get(url) as number | null
  const grab = async (u: string) => {
    const r = await fetch(u)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const ct = r.headers.get('content-type') || 'image/jpeg'
    return { buf: Buffer.from(await r.arrayBuffer()), mimetype: ct, ext: ct.includes('png') ? 'png' : 'jpg' }
  }
  let img: { buf: Buffer; mimetype: string; ext: string } | null = null
  try {
    img = await grab(url)
  } catch {
    if (fallbackSeed) {
      try {
        img = await grab(`https://picsum.photos/seed/${encodeURIComponent(fallbackSeed)}/1200/800`)
      } catch {
        img = null
      }
    }
  }
  if (!img) {
    console.warn(`  ! image skipped (fetch failed): ${url}`)
    mediaCache.set(url, null)
    return null
  }
  const doc = await payload.create({
    collection: 'media' as never,
    data: { alt } as never,
    file: { data: img.buf, mimetype: img.mimetype, name: `${(fallbackSeed || 'img').replace(/[^a-z0-9-]/gi, '-')}-${Date.now()}.${img.ext}`, size: img.buf.length },
  })
  const id = (doc as { id: number }).id
  mediaCache.set(url, id)
  return id
}

// ── Test dataset definitions ─────────────────────────────────────────────────

type BrandTier = 'partner_listing' | 'partner_professional' | 'partner_premium'
const BRANDS: {
  key: string
  name: string
  email: string
  tier: BrandTier
  typePartner: string
  herkomst: string
  positionering: string
  productType: string[]
  tags: string[]
  featured?: boolean
}[] = [
  // Partner Listing (cannot create/publish any course)
  { key: 'skinlab', name: 'Skinlab Belgium', email: 'info@skinlab.be', tier: 'partner_listing', typePartner: 'productmerken', herkomst: 'belgisch', positionering: 'professioneel-salon', productType: ['skincare-huidverbetering'], tags: ['belgisch', 'professioneel'] },
  { key: 'districos', name: 'Districos Groothandel', email: 'info@districos.be', tier: 'partner_listing', typePartner: 'groothandels_distributeurs', herkomst: 'belgisch', positionering: 'starter-friendly', productType: ['business-salon', 'skincare-huidverbetering'], tags: ['belgisch'] },
  { key: 'pureaesthetics', name: 'Pure Aesthetics NV', email: 'info@pureaesthetics.be', tier: 'partner_listing', typePartner: 'leveranciers', herkomst: 'belgisch', positionering: 'medisch-esthetisch', productType: ['esthetische-technologie'], tags: ['professioneel', 'luxe'] },
  { key: 'bellanails', name: 'Bella Nails Supply', email: 'info@bellanails.be', tier: 'partner_listing', typePartner: 'leveranciers', herkomst: 'nederlands', positionering: 'starter-friendly', productType: ['nagels-hand-voet'], tags: ['professioneel'] },
  // Partner Professional (up to 10 courses, isBookable)
  { key: 'lumiere', name: 'Lumière Cosmetics', email: 'info@lumierecosmetics.be', tier: 'partner_professional', typePartner: 'productmerken', herkomst: 'europees', positionering: 'premium-luxe', productType: ['skincare-huidverbetering', 'make-up-pmu'], tags: ['luxe', 'professioneel'], featured: true },
  { key: 'dermatech', name: 'DermaTech Solutions', email: 'info@dermatech.be', tier: 'partner_professional', typePartner: 'apparatuurmerken', herkomst: 'belgisch', positionering: 'medisch-esthetisch', productType: ['esthetische-technologie', 'waxing-ontharing'], tags: ['professioneel'] },
  { key: 'naturi', name: 'Naturi Skincare', email: 'info@naturi.be', tier: 'partner_professional', typePartner: 'productmerken', herkomst: 'belgisch', positionering: 'professioneel-salon', productType: ['skincare-huidverbetering', 'wellness-holistisch'], tags: ['natuurlijk', 'vegan', 'duurzaam', 'holistisch'] },
  // Partner Premium (unlimited, isBookable)
  { key: 'comfort', name: 'Comfort Zone Belgium', email: 'info@comfortzone.be', tier: 'partner_premium', typePartner: 'productmerken', herkomst: 'europees', positionering: 'premium-luxe', productType: ['skincare-huidverbetering', 'massage-body'], tags: ['luxe', 'professioneel'], featured: true },
  { key: 'estheticpro', name: 'EstheticPro Group', email: 'info@estheticpro.be', tier: 'partner_premium', typePartner: 'apparatuurmerken', herkomst: 'internationaal', positionering: 'medisch-esthetisch', productType: ['esthetische-technologie', 'waxing-ontharing'], tags: ['professioneel', 'luxe'] },
  { key: 'biobeaute', name: 'Bio Beauté Belgium', email: 'info@biobeaute.be', tier: 'partner_premium', typePartner: 'productmerken', herkomst: 'belgisch', positionering: 'professioneel-salon', productType: ['skincare-huidverbetering', 'wellness-holistisch'], tags: ['natuurlijk', 'biologisch', 'vegan', 'holistisch'] },
]

type OpleiderTier = 'basis' | 'medium' | 'premium'
const OPLEIDERS: {
  key: string
  name: string
  email: string
  tier: OpleiderTier
  specs: string[]
  city: string
  province: string
  accent?: string
}[] = [
  // Basis (max 1 course, no accent color)
  { key: 'sara', name: 'Sara Martens', email: 'sara@example.be', tier: 'basis', specs: ['nagelstyliste'], city: 'Antwerpen', province: 'Antwerpen' },
  { key: 'tom', name: 'Tom Verhoeven', email: 'tom@example.be', tier: 'basis', specs: ['massage'], city: 'Gent', province: 'Oost-Vlaanderen' },
  { key: 'jana', name: 'Jana Peeters', email: 'jana@example.be', tier: 'basis', specs: ['massage'], city: 'Brugge', province: 'West-Vlaanderen' },
  { key: 'kevin', name: 'Kevin Smets', email: 'kevin@example.be', tier: 'basis', specs: ['yoga', 'mindfulness'], city: 'Leuven', province: 'Vlaams-Brabant' },
  // Medium (accent color applies)
  { key: 'nele', name: 'Nele Wouters', email: 'nele@example.be', tier: 'medium', specs: ['aromatherapie', 'schoonheid'], city: 'Gent', province: 'Oost-Vlaanderen', accent: '#C4795A' },
  { key: 'bram', name: 'Bram Claes', email: 'bram@example.be', tier: 'medium', specs: ['massage'], city: 'Brugge', province: 'West-Vlaanderen', accent: '#2E7D6B' },
  { key: 'eline', name: 'Eline Bosmans', email: 'eline@example.be', tier: 'medium', specs: ['voeding'], city: 'Antwerpen', province: 'Antwerpen', accent: '#8E5BA6' },
  { key: 'wout', name: 'Wout De Backer', email: 'wout@example.be', tier: 'medium', specs: ['schoonheid'], city: 'Hasselt', province: 'Limburg', accent: '#C6971B' },
  // Premium (accent color + homepage exposure eligible)
  { key: 'lieve', name: 'Lieve Maes', email: 'lieve@example.be', tier: 'premium', specs: ['schoonheid'], city: 'Antwerpen', province: 'Antwerpen', accent: '#1A2E25' },
  { key: 'anke', name: 'Anke Goossens', email: 'anke@example.be', tier: 'premium', specs: ['schoonheid'], city: 'Hasselt', province: 'Limburg', accent: '#B5423A' },
  { key: 'sofie', name: 'Sofie Dekeyser', email: 'sofie@example.be', tier: 'premium', specs: ['schoonheid'], city: 'Antwerpen', province: 'Antwerpen', accent: '#2B5C9B' },
  { key: 'ruben', name: 'Ruben Peeters', email: 'ruben@example.be', tier: 'premium', specs: ['massage'], city: 'Gent', province: 'Oost-Vlaanderen', accent: '#6B8E23' },
]

type CourseSeed = { title: string; ownerKey: string; categorySlug: string; price: number; format: ('online' | 'fysiek' | 'hybride')[]; erkend: boolean; city?: string | null }

// Brand courses (Professional + Premium only). 18 total.
const BRAND_COURSES: CourseSeed[] = [
  { title: 'Lumière signature facial training', ownerKey: 'lumiere', categorySlug: 'gezichtsbehandelingen', price: 480, format: ['fysiek'], erkend: true },
  { title: 'Color theory en make-up masterclass', ownerKey: 'lumiere', categorySlug: 'make-up', price: 390, format: ['fysiek'], erkend: false },
  { title: 'Anti-aging skincare protocol', ownerKey: 'lumiere', categorySlug: 'schoonheidszorg', price: 520, format: ['hybride'], erkend: true },
  { title: 'Microneedling device certificering', ownerKey: 'dermatech', categorySlug: 'schoonheidszorg', price: 650, format: ['fysiek'], erkend: true },
  { title: 'LED-therapie apparatuur training', ownerKey: 'dermatech', categorySlug: 'schoonheidszorg', price: 420, format: ['hybride'], erkend: false },
  { title: 'Natuurlijke gelaatsverzorging', ownerKey: 'naturi', categorySlug: 'gezichtsbehandelingen', price: 340, format: ['fysiek'], erkend: false },
  { title: 'Vegan product formulatie workshop', ownerKey: 'naturi', categorySlug: 'schoonheidszorg', price: 260, format: ['fysiek'], erkend: false },
  { title: 'Holistische huidverzorging', ownerKey: 'naturi', categorySlug: 'schoonheidszorg', price: 380, format: ['hybride'], erkend: false },
  { title: 'Luxe gelaatsbehandeling academy', ownerKey: 'comfort', categorySlug: 'gezichtsbehandelingen', price: 750, format: ['fysiek'], erkend: true },
  { title: 'Signature spa ritual training', ownerKey: 'comfort', categorySlug: 'lichaamsverzorging', price: 690, format: ['fysiek'], erkend: true },
  { title: 'Hydraterende behandelingen', ownerKey: 'comfort', categorySlug: 'schoonheidszorg', price: 480, format: ['fysiek'], erkend: false },
  { title: 'Premium massage protocol', ownerKey: 'comfort', categorySlug: 'massage', price: 620, format: ['fysiek'], erkend: true },
  { title: 'Laser ontharing certificering', ownerKey: 'estheticpro', categorySlug: 'epilatie-ontharing', price: 890, format: ['fysiek'], erkend: true },
  { title: 'IPL apparatuur masterclass', ownerKey: 'estheticpro', categorySlug: 'epilatie-ontharing', price: 780, format: ['fysiek'], erkend: true },
  { title: 'Huidverbetering met technologie', ownerKey: 'estheticpro', categorySlug: 'schoonheidszorg', price: 640, format: ['hybride'], erkend: true },
  { title: 'Biologische huidverzorging opleiding', ownerKey: 'biobeaute', categorySlug: 'schoonheidszorg', price: 360, format: ['fysiek'], erkend: false },
  { title: 'Aromatherapie voor de salon', ownerKey: 'biobeaute', categorySlug: 'aromatherapie', price: 290, format: ['fysiek'], erkend: false },
  { title: 'Natuurlijke lichaamsrituelen', ownerKey: 'biobeaute', categorySlug: 'lichaamsverzorging', price: 410, format: ['fysiek'], erkend: false },
]

// Opleider courses, respecting tier limits (basis 1, medium <=5, premium unlimited). 20 total.
const OPLEIDER_COURSES: CourseSeed[] = [
  { title: 'Gelnagels voor beginners', ownerKey: 'sara', categorySlug: 'nagelstyliste', price: 295, format: ['fysiek'], erkend: false },
  { title: 'Klassieke massage basis', ownerKey: 'tom', categorySlug: 'massage', price: 380, format: ['fysiek'], erkend: true },
  { title: 'Voetreflexologie weekendcursus', ownerKey: 'jana', categorySlug: 'voetreflexologie', price: 390, format: ['fysiek'], erkend: true },
  { title: 'Yoga docentenopleiding', ownerKey: 'kevin', categorySlug: 'yoga', price: 890, format: ['fysiek'], erkend: false },
  { title: 'Aromatherapie introductie', ownerKey: 'nele', categorySlug: 'aromatherapie', price: 149, format: ['online'], erkend: false, city: null },
  { title: 'Natuurlijke huidverzorging cursus', ownerKey: 'nele', categorySlug: 'schoonheidszorg', price: 320, format: ['fysiek'], erkend: false },
  { title: 'Sportmassage opleiding', ownerKey: 'bram', categorySlug: 'sportmassage', price: 420, format: ['fysiek'], erkend: true },
  { title: 'Hot stone massage workshop', ownerKey: 'bram', categorySlug: 'hot-stone-massage', price: 260, format: ['fysiek'], erkend: false },
  { title: 'Voedingscoach opleiding', ownerKey: 'eline', categorySlug: 'voeding', price: 510, format: ['fysiek'], erkend: true },
  { title: 'Darmgezondheid en voeding', ownerKey: 'eline', categorySlug: 'darmgezondheid', price: 280, format: ['online'], erkend: false, city: null },
  { title: 'Bruidsmake-up masterclass', ownerKey: 'wout', categorySlug: 'make-up', price: 340, format: ['fysiek'], erkend: false },
  { title: 'Airbrush make-up techniek', ownerKey: 'wout', categorySlug: 'make-up', price: 380, format: ['fysiek'], erkend: false },
  { title: 'Huidanalyse en behandeling', ownerKey: 'lieve', categorySlug: 'schoonheidszorg', price: 520, format: ['fysiek'], erkend: true },
  { title: 'Professionele peeling technieken', ownerKey: 'lieve', categorySlug: 'schoonheidszorg', price: 410, format: ['fysiek'], erkend: true },
  { title: 'Medisch-esthetische behandelingen', ownerKey: 'anke', categorySlug: 'schoonheidszorg', price: 690, format: ['fysiek'], erkend: true },
  { title: 'Huidverbetering met devices', ownerKey: 'anke', categorySlug: 'schoonheidszorg', price: 590, format: ['hybride'], erkend: true },
  { title: 'Premium facial technieken', ownerKey: 'sofie', categorySlug: 'gezichtsbehandelingen', price: 680, format: ['fysiek'], erkend: true },
  { title: 'Lifting massage gelaat', ownerKey: 'sofie', categorySlug: 'gezichtsbehandelingen', price: 450, format: ['fysiek'], erkend: false },
  { title: 'Deep tissue massage', ownerKey: 'ruben', categorySlug: 'massage', price: 480, format: ['fysiek'], erkend: true },
  { title: 'Lymfedrainage opleiding', ownerKey: 'ruben', categorySlug: 'lymfedrainage', price: 520, format: ['fysiek'], erkend: true },
]

async function seed() {
  const payload = await getPayload({ config })
  console.log('🌱 Seeding Blissify (tier + registration test dataset)...\n')

  // ── CLEANUP ────────────────────────────────────────────────────────────────
  console.log('🧹 Clearing existing data...')
  for (const col of ['courses', 'trainers', 'brands', 'categories'] as const) {
    await payload.delete({ collection: col as never, where: { id: { exists: true } } as never })
  }
  const emails = ['lonne@blissify.be', ...BRANDS.map((b) => b.email), ...OPLEIDERS.map((o) => o.email)]
  for (const email of emails) {
    await payload.delete({ collection: 'users' as never, where: { email: { equals: email } } as never })
  }
  console.log('  ✓ Cleared\n')

  // ── CATEGORIES ─────────────────────────────────────────────────────────────
  console.log('📂 Creating categories...')
  const categoryData = [
    { name: 'Schoonheid & Verzorging', slug: 'schoonheid-verzorging', children: [
      { name: 'Schoonheidszorg', slug: 'schoonheidszorg' },
      { name: 'Gezichtsbehandelingen', slug: 'gezichtsbehandelingen' },
      { name: 'Lichaamsverzorging', slug: 'lichaamsverzorging' },
      { name: 'Nagelstyliste', slug: 'nagelstyliste' },
      { name: 'Make-up', slug: 'make-up' },
      { name: 'Haarverzorging', slug: 'haarverzorging' },
      { name: 'Epilatie & Ontharing', slug: 'epilatie-ontharing' },
    ]},
    { name: 'Massage & Lichaamswerk', slug: 'massage-lichaamswerk', children: [
      { name: 'Massage', slug: 'massage' },
      { name: 'Klassieke massage', slug: 'klassieke-massage' },
      { name: 'Sportmassage', slug: 'sportmassage' },
      { name: 'Hot stone massage', slug: 'hot-stone-massage' },
      { name: 'Voetreflexologie', slug: 'voetreflexologie' },
      { name: 'Lymfedrainage', slug: 'lymfedrainage' },
      { name: 'Ayurvedische massage', slug: 'ayurvedische-massage' },
    ]},
    { name: 'Wellness & Holistische therapie', slug: 'wellness-holistische-therapie', children: [
      { name: 'Reiki', slug: 'reiki' },
      { name: 'Aromatherapie', slug: 'aromatherapie' },
      { name: 'Kristaltherapie', slug: 'kristaltherapie' },
      { name: 'Energetische healing', slug: 'energetische-healing' },
      { name: 'Ayurveda', slug: 'ayurveda' },
    ]},
    { name: 'Beweging & Yoga', slug: 'beweging-yoga', children: [
      { name: 'Yoga', slug: 'yoga' },
      { name: 'Pilates', slug: 'pilates' },
      { name: 'Meditatie', slug: 'meditatie' },
      { name: 'Tai Chi & Qi Gong', slug: 'tai-chi-qi-gong' },
      { name: 'Dans & Beweging', slug: 'dans-beweging' },
    ]},
    { name: 'Voeding & Gezondheid', slug: 'voeding-gezondheid', children: [
      { name: 'Voeding', slug: 'voeding' },
      { name: 'Voedingsadvies', slug: 'voedingsadvies' },
      { name: 'Orthomoleculaire therapie', slug: 'orthomoleculaire-therapie' },
      { name: 'Plantaardige voeding', slug: 'plantaardige-voeding' },
      { name: 'Darmgezondheid', slug: 'darmgezondheid' },
    ]},
    { name: 'Persoonlijke ontwikkeling', slug: 'persoonlijke-ontwikkeling-hoofd', children: [
      { name: 'Persoonlijke ontwikkeling', slug: 'persoonlijke-ontwikkeling' },
      { name: 'Mindfulness', slug: 'mindfulness' },
      { name: 'Coaching', slug: 'coaching' },
      { name: 'NLP', slug: 'nlp' },
      { name: 'Stressmanagement', slug: 'stressmanagement' },
      { name: 'Ademwerk', slug: 'ademwerk' },
    ]},
  ]
  for (const cat of categoryData) {
    const parent = await payload.create({ collection: 'categories' as never, data: { name: cat.name, slug: cat.slug } as never })
    for (const child of cat.children) {
      await payload.create({ collection: 'categories' as never, data: { name: child.name, slug: child.slug, parent: (parent as { id: number }).id } as never })
    }
  }
  const { docs: allCats } = await payload.find({ collection: 'categories' as never, limit: 200 })
  const catBySlug: Record<string, number> = Object.fromEntries((allCats as { slug: string; id: number }[]).map((c) => [c.slug, c.id]))
  console.log(`  ✓ ${categoryData.length} hoofdcategorieën + subcategorieën`)

  // ── ADMIN ────────────────────────────────────────────────────────────────
  await payload.create({
    collection: 'users' as never,
    data: { email: 'lonne@blissify.be', password: 'Admin1234!', name: 'Lonne', role: 'admin', subscriptionStatus: 'active' } as never,
  })
  console.log('\n👤 Admin: lonne@blissify.be')

  // ── BRAND accounts + profiles ──────────────────────────────────────────────
  console.log('\n🏷️  Creating Merken & Leveranciers...')
  const brands: Record<string, { id: number }> = {}
  for (let bi = 0; bi < BRANDS.length; bi++) {
    const b = BRANDS[bi]
    const user = await payload.create({
      collection: 'users' as never,
      data: { email: b.email, password: PASSWORD, name: b.name, role: 'brand', brandTier: b.tier, subscriptionStatus: 'active' } as never,
    })
    const logo = await uploadImage(payload, logoUrl(b.name), `${b.name} logo`)
    const coverImage = await uploadImage(payload, unsplash(BRAND_COVER_IDS[bi % BRAND_COVER_IDS.length]), `${b.name} sfeerbeeld`, `${b.key}-cover`)
    brands[b.key] = (await payload.create({
      collection: 'brands' as never,
      data: {
        name: b.name,
        slug: slugify(b.name),
        owner: (user as { id: number }).id,
        logo,
        coverImage,
        typePartner: b.typePartner,
        herkomst: b.herkomst,
        positionering: b.positionering,
        productType: b.productType,
        tags: b.tags,
        featured: Boolean(b.featured),
        description: rt(`${b.name} is een ${b.typePartner} actief in de Belgische beauty- en wellnesssector.`),
      } as never,
    })) as { id: number }
    console.log(`  ✓ ${b.name} (${b.tier})`)
  }

  // ── OPLEIDER accounts + profiles ───────────────────────────────────────────
  console.log('\n🧑‍🏫 Creating Opleiders...')
  const trainers: Record<string, { id: number }> = {}
  for (const o of OPLEIDERS) {
    const user = await payload.create({
      collection: 'users' as never,
      data: { email: o.email, password: PASSWORD, name: o.name, role: 'trainer', subscriptionTier: o.tier, subscriptionStatus: 'active' } as never,
    })
    const photo = await uploadImage(payload, headshotUrl(o.key), o.name, o.key)
    trainers[o.key] = (await payload.create({
      collection: 'trainers' as never,
      data: {
        displayName: o.name,
        slug: slugify(o.name),
        owner: (user as { id: number }).id,
        photo,
        specializations: o.specs,
        location: { city: o.city, province: o.province, online: false },
        // profileAccentColor is enforced by the Trainers hook: cleared unless medium/premium.
        ...(o.accent ? { profileAccentColor: o.accent } : {}),
        featured: o.tier === 'premium',
      } as never,
    })) as { id: number }
    console.log(`  ✓ ${o.name} (${o.tier}${o.accent ? `, accent ${o.accent}` : ''})`)
  }

  // ── COURSES ────────────────────────────────────────────────────────────────
  console.log('\n📚 Creating courses...')
  const brandOwnerName: Record<string, string> = Object.fromEntries(BRANDS.map((b) => [b.key, b.name]))
  const opleiderName: Record<string, string> = Object.fromEntries(OPLEIDERS.map((o) => [o.key, o.name]))
  const slugsByOwner: Record<string, string[]> = {}

  async function createCourse(c: CourseSeed, kind: 'brand' | 'opleider', idx: number) {
    const slug = slugify(c.title)
    const isOnline = c.format.includes('online')
    const startMonths = [2, 4, 6][Math.floor(Math.random() * 3)]
    const coverImage = await uploadImage(payload, courseImg(c.categorySlug, idx), c.title, slug)
    const base = {
      title: c.title,
      slug,
      status: 'published',
      category: catBySlug[c.categorySlug] || catBySlug['massage'],
      coverImage,
      shortDescription: `${c.title} - professionele opleiding via Blissify.`,
      description: rt(`${c.title}. Een praktijkgerichte opleiding voor professionals in de beauty- en wellnesssector.`),
      format: c.format,
      ...(isOnline || c.city === null ? {} : { location: { city: c.city ?? 'Antwerpen', province: 'Antwerpen', postcode: '2000' } }),
      price: { amount: c.price, currency: 'EUR', isFree: false, priceOnRequest: false },
      language: ['nl'],
      level: c.price > 600 ? 'gevorderd' : 'beginner',
      certificate: c.erkend,
      accreditation: c.erkend ? 'Erkend door de sector' : null,
      startDates: [{ date: futureDate(startMonths), spotsAvailable: 8 + Math.floor(Math.random() * 13) }],
    }
    const owned =
      kind === 'brand'
        ? { brand: brands[c.ownerKey].id, notificationRecipients: [{ email: TEST_NOTIFY }] } // in-platform registration (isBookable auto-set)
        : { trainer: trainers[c.ownerKey].id, externalUrl: `https://example.be/inschrijven/${slug}` } // redirect mode
    await payload.create({ collection: 'courses' as never, data: { ...base, ...owned } as never })
    ;(slugsByOwner[c.ownerKey] ||= []).push(slug)
  }

  for (let i = 0; i < BRAND_COURSES.length; i++) await createCourse(BRAND_COURSES[i], 'brand', i)
  for (let i = 0; i < OPLEIDER_COURSES.length; i++) await createCourse(OPLEIDER_COURSES[i], 'opleider', i)
  console.log(`  ✓ ${BRAND_COURSES.length} brand courses + ${OPLEIDER_COURSES.length} opleider courses`)

  // ── SUMMARY ──────────────────────────────────────────────────────────────
  console.log('\n📋 Test account summary (password: ' + PASSWORD + ')\n')
  console.log('MERKEN & LEVERANCIERS')
  for (const b of BRANDS) {
    const slugs = slugsByOwner[b.key] || []
    console.log(`  ${b.email.padEnd(30)} ${b.tier.padEnd(22)} courses: ${slugs.length}${slugs.length ? ' [' + slugs.join(', ') + ']' : ' (none - listing tier cannot publish)'}`)
  }
  console.log('\nOPLEIDERS')
  for (const o of OPLEIDERS) {
    const slugs = slugsByOwner[o.key] || []
    console.log(`  ${o.email.padEnd(24)} ${o.tier.padEnd(8)} accent:${o.accent || '-'} courses: ${slugs.length} [${slugs.join(', ')}]`)
  }
  void brandOwnerName
  void opleiderName

  console.log('\n✅ Seeding complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err)
  process.exit(1)
})
