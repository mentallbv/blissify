import { getPayload } from 'payload'
import config from '@payload-config'

async function seed() {
  const payload = await getPayload({ config })

  console.log('🌱 Seeding Blissify...\n')

  // ── CLEANUP ─────────────────────────────────────────────────────────────────
  console.log('🧹 Clearing existing data...')
  const collectionsToClear = ['courses', 'trainers', 'brands', 'categories'] as const
  for (const col of collectionsToClear) {
    await payload.delete({
      collection: col as any,
      where: { id: { exists: true } },
    })
  }
  // Delete non-admin seeded users by email
  for (const email of ['info@opi.be', 'sara@example.be', 'jana@example.be', 'lonne@blissify.be']) {
    await payload.delete({
      collection: 'users' as any,
      where: { email: { equals: email } },
    })
  }
  console.log('  ✓ Cleared\n')

  // ── 0. CATEGORIES ───────────────────────────────────────────────────────────
  console.log('📂 Creating categories...')

  const categoryData = [
    { name: 'Schoonheid & Verzorging', slug: 'schoonheid-verzorging', children: [
      { name: 'Gezichtsbehandelingen', slug: 'gezichtsbehandelingen' },
      { name: 'Lichaamsverzorging', slug: 'lichaamsverzorging' },
      { name: 'Nagelstyliste', slug: 'nagelstyliste' },
      { name: 'Make-up', slug: 'make-up' },
      { name: 'Haarverzorging', slug: 'haarverzorging' },
      { name: 'Epilatie & Ontharing', slug: 'epilatie-ontharing' },
    ]},
    { name: 'Massage & Lichaamswerk', slug: 'massage-lichaamswerk', children: [
      { name: 'Klassieke massage', slug: 'klassieke-massage' },
      { name: 'Sportmassage', slug: 'sportmassage' },
      { name: 'Hot stone massage', slug: 'hot-stone-massage' },
      { name: 'Reflexologie', slug: 'reflexologie' },
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
      { name: 'Voedingsadvies', slug: 'voedingsadvies' },
      { name: 'Orthomoleculaire therapie', slug: 'orthomoleculaire-therapie' },
      { name: 'Plantaardige voeding', slug: 'plantaardige-voeding' },
      { name: 'Darmgezondheid', slug: 'darmgezondheid' },
    ]},
    { name: 'Persoonlijke ontwikkeling', slug: 'persoonlijke-ontwikkeling', children: [
      { name: 'Mindfulness', slug: 'mindfulness' },
      { name: 'Coaching', slug: 'coaching' },
      { name: 'NLP', slug: 'nlp' },
      { name: 'Stressmanagement', slug: 'stressmanagement' },
      { name: 'Ademwerk', slug: 'ademwerk' },
    ]},
  ]

  for (const cat of categoryData) {
    const parent = await payload.create({
      collection: 'categories' as any,
      data: { name: cat.name, slug: cat.slug },
    })
    for (const child of cat.children) {
      await payload.create({
        collection: 'categories' as any,
        data: { name: child.name, slug: child.slug, parent: parent.id },
      })
    }
    console.log(`  ✓ ${cat.name} (+${cat.children.length} subcategorieën)`)
  }

  // ── 1. USERS ──────────────────────────────────────────────────────────────
  console.log('\n👤 Creating users...')

  const admin = await payload.create({
    collection: 'users' as any,
    data: {
      email: 'lonne@blissify.be',
      password: 'Admin1234!',
      name: 'Lonne',
      role: 'admin',
      subscriptionTier: 'premium',
      subscriptionStatus: 'active',
    },
  })
  console.log('  ✓ Admin: lonne@blissify.be')

  const brandUser = await payload.create({
    collection: 'users' as any,
    data: {
      email: 'info@opi.be',
      password: 'Brand1234!',
      name: 'OPI Belgium',
      role: 'brand',
      subscriptionTier: 'medium',
      subscriptionStatus: 'active',
    },
  })
  console.log('  ✓ Brand: info@opi.be')

  const trainerUser1 = await payload.create({
    collection: 'users' as any,
    data: {
      email: 'sara@example.be',
      password: 'Trainer1234!',
      name: 'Sara Martens',
      role: 'trainer',
      subscriptionTier: 'basis',
      subscriptionStatus: 'active',
    },
  })
  console.log('  ✓ Trainer 1: sara@example.be')

  const trainerUser2 = await payload.create({
    collection: 'users' as any,
    data: {
      email: 'jana@example.be',
      password: 'Trainer1234!',
      name: 'Jana Peeters',
      role: 'trainer',
      subscriptionTier: 'medium',
      subscriptionStatus: 'active',
    },
  })
  console.log('  ✓ Trainer 2: jana@example.be')

  // ── 2. BRAND ──────────────────────────────────────────────────────────────
  console.log('\n🏷️  Creating brand...')

  const opiBrand = await payload.create({
    collection: 'brands' as any,
    data: {
      name: 'OPI Belgium',
      slug: 'opi-belgium',
      owner: brandUser.id,
      tags: ['professioneel', 'belgisch'],
      verified: true,
      featured: false,
    },
  })
  console.log('  ✓ OPI Belgium')

  // ── 3. TRAINERS ───────────────────────────────────────────────────────────
  console.log('\n🧑‍🏫 Creating trainers...')

  const sara = await payload.create({
    collection: 'trainers' as any,
    data: {
      displayName: 'Sara Martens',
      slug: 'sara-martens',
      owner: trainerUser1.id,
      brand: opiBrand.id,
      specializations: ['nagelstyliste'],
      location: { city: 'Antwerpen', province: 'Antwerpen', online: false },
      verified: true,
    },
  })
  console.log('  ✓ Sara Martens (linked to OPI Belgium)')

  const jana = await payload.create({
    collection: 'trainers' as any,
    data: {
      displayName: 'Jana Peeters',
      slug: 'jana-peeters',
      owner: trainerUser2.id,
      specializations: ['massage'],
      location: { city: 'Gent', province: 'Oost-Vlaanderen', online: false },
      verified: true,
    },
  })
  console.log('  ✓ Jana Peeters (independent)')

  // ── 4. CATEGORIES (lookup) ────────────────────────────────────────────────
  const { docs: cats } = await payload.find({
    collection: 'categories' as any,
    limit: 100,
  })
  const catBySlug = Object.fromEntries(cats.map((c: any) => [c.slug, c.id]))

  // ── 5. COURSES ────────────────────────────────────────────────────────────
  console.log('\n📚 Creating courses...')

  await payload.create({
    collection: 'courses' as any,
    data: {
      title: 'Gelnagels voor beginners',
      slug: 'gelnagels-voor-beginners',
      status: 'published',
      trainer: sara.id,
      brand: opiBrand.id,
      category: catBySlug['nagelstyliste'] || cats[0]?.id,
      shortDescription: 'Leer de basis van gelnagels in deze hands-on avondopleiding in Antwerpen.',
      description: {
        root: {
          type: 'root',
          children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', text: 'In deze opleiding leer je alles over het zetten van gelnagels. Van voorbereiding tot afwerking - je vertrekt met een volledige basiskennis.', version: 1 }] }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      format: ['fysiek'],
      location: { city: 'Antwerpen', province: 'Antwerpen', postcode: '2000' },
      price: { amount: 295, currency: 'EUR', isFree: false, priceOnRequest: false },
      level: 'beginner',
      language: ['nl'],
      externalUrl: 'https://opi.com/register/gelnagels-beginners',
      certificate: true,
    },
  })
  console.log('  ✓ Gelnagels voor beginners')

  await payload.create({
    collection: 'courses' as any,
    data: {
      title: 'Klassieke massage opleiding',
      slug: 'klassieke-massage-opleiding',
      status: 'published',
      trainer: jana.id,
      category: catBySlug['klassieke-massage'] || cats[0]?.id,
      shortDescription: 'Een erkende weekendopleiding klassieke massage in Gent. Inclusief certificaat.',
      description: {
        root: {
          type: 'root',
          children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', text: 'Volg deze erkende opleiding klassieke massage en behaal je certificaat. Ideaal voor wie professioneel wil starten als masseur/masseuse.', version: 1 }] }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      format: ['fysiek'],
      location: { city: 'Gent', province: 'Oost-Vlaanderen', postcode: '9000' },
      price: { amount: 450, currency: 'EUR', isFree: false, priceOnRequest: false },
      level: 'beginner',
      language: ['nl'],
      externalUrl: 'https://jana-peeters.be/massage-opleiding',
      certificate: true,
      accreditation: 'Erkend door Fedactio',
    },
  })
  console.log('  ✓ Klassieke massage opleiding')

  await payload.create({
    collection: 'courses' as any,
    data: {
      title: 'Online introductie aromatherapie',
      slug: 'online-introductie-aromatherapie',
      status: 'published',
      trainer: jana.id,
      category: catBySlug['aromatherapie'] || cats[0]?.id,
      shortDescription: 'Ontdek de kracht van essentiële oliën in deze online introductiecursus.',
      description: {
        root: {
          type: 'root',
          children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', text: 'Leer de basisprincipes van aromatherapie en hoe je essentiële oliën veilig kunt toepassen voor welzijn en ontspanning.', version: 1 }] }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      format: ['online'],
      price: { amount: 149, currency: 'EUR', isFree: false, priceOnRequest: false },
      level: 'beginner',
      language: ['nl'],
      externalUrl: 'https://jana-peeters.be/aromatherapie',
      certificate: false,
    },
  })
  console.log('  ✓ Online introductie aromatherapie')

  console.log('\n✅ Seeding complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err)
  process.exit(1)
})