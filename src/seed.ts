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

  // ── PAGES (editable static content) ─────────────────────────────────────────
  console.log('📄 Creating editable pages...')
  await payload.delete({ collection: 'pages' as any, where: { id: { exists: true } } }).catch(() => {})

  await payload.create({
    collection: 'pages' as any,
    data: {
      title: 'Over ons',
      slug: 'over-ons',
      hero: {
        eyebrow: 'Over Blissify',
        title: 'De Europese standaard voor wellnessopleiding.',
        subtitle:
          'Blissify is gebouwd voor de professional. Het platform dat de wellness- en beautysector serieus neemt, met gecureerde opleidingen, geverifieerde opleiders en de duidelijkheid die studenten verdienen.',
      },
      blocks: [
        {
          blockType: 'features',
          items: [
            { icon: 'ti ti-rosette-discount-check', title: 'Curatorisch, niet algoritmisch', body: 'Elke opleider wordt handmatig geverifieerd voor publicatie.' },
            { icon: 'ti ti-eye-check', title: 'Professioneel, niet spiritueel', body: 'Blissify is een vakplatform, geen wellnessapp.' },
            { icon: 'ti ti-list-check', title: 'Transparant', body: 'Prijs, duur, erkenning en locatie staan altijd vermeld.' },
          ],
        },
        { blockType: 'cta', title: 'Jouw praktijk begint hier.', body: 'Sluit je aan bij 124 geverifieerde opleiders.', buttonLabel: 'Bied mijn opleidingen aan', buttonUrl: '/voor-aanbieders', background: 'forest' },
      ],
      seo: { title: 'Over Blissify - De Europese standaard voor wellnessopleiding' },
    },
  })

  await payload.create({
    collection: 'pages' as any,
    data: {
      title: 'Voor aanbieders',
      slug: 'voor-aanbieders',
      hero: {
        eyebrow: 'Voor aanbieders',
        title: 'Bereik duizenden professionals die actief op zoek zijn naar jouw opleiding.',
        subtitle: 'Blissify is het Belgische platform voor professionele wellnessopleiding. Jouw opleiding verdient zichtbaarheid bij het juiste publiek.',
      },
      blocks: [
        {
          blockType: 'features',
          items: [
            { icon: 'ti ti-target-arrow', title: 'Gerichte zichtbaarheid', body: 'Verschijn in zoekresultaten van mensen die actief zoeken naar wat jij aanbiedt.' },
            { icon: 'ti ti-mail-forward', title: 'Directe leads', body: 'Studenten vragen rechtstreeks informatie op. Geen commissie, geen tussenpersoon.' },
            { icon: 'ti ti-chart-line', title: 'Analytisch inzicht', body: 'Zie hoeveel mensen jouw profiel en opleidingen bekijken.' },
          ],
        },
        { blockType: 'testimonial', quote: 'Blissify heeft ons bereik verdubbeld in het eerste jaar. De leads zijn concreet en serieus, geen tijdverspilling.', author: 'Academia Van der Berg', company: 'Antwerpen' },
        { blockType: 'cta', title: 'Jouw praktijk begint hier.', body: 'Sluit je aan bij 124 geverifieerde opleiders die hun bereik uitbreiden via Blissify.', buttonLabel: 'Bied mijn opleidingen aan', buttonUrl: '/inloggen', background: 'forest' },
      ],
      seo: { title: 'Publiceer jouw opleiding op Blissify' },
    },
  })

  await payload.create({
    collection: 'pages' as any,
    data: {
      title: 'Contact',
      slug: 'contact-info',
      hero: { eyebrow: 'Contact', title: 'Neem contact op met Blissify.', subtitle: 'Vragen over het platform, je account of een samenwerking? We helpen je graag verder.' },
      blocks: [
        { blockType: 'richText', content: { root: { type: 'root', direction: 'ltr', format: '', indent: 0, version: 1, children: [{ type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0, children: [{ type: 'text', version: 1, text: 'Mail ons op hallo@blissify.be of gebruik het contactformulier op /contact.' }] }] } } },
      ],
      seo: { title: 'Contact - Blissify' },
    },
  })
  console.log('  ✓ 3 pages (over-ons, voor-aanbieders, contact-info)')

  // ── HOMEPAGE GLOBAL ─────────────────────────────────────────────────────────
  console.log('🏠 Seeding homepage content...')
  await payload.updateGlobal({
    slug: 'homepage' as any,
    data: {
      hero: {
        badge: '847 opleidingen in België',
        title: 'De Europese standaard voor',
        highlight: 'wellnessopleiding.',
        subtitle:
          'Vind erkende, professionele opleidingen in massage, nagelstyliste, reflexologie, yoga, voeding en beauty, zorgvuldig samengebracht door Blissify.',
        primaryCtaLabel: 'Vind een opleiding',
        primaryCtaUrl: '/opleidingen',
        secondaryCtaLabel: 'Publiceer jouw opleiding',
        secondaryCtaUrl: '/voor-aanbieders',
      },
      trustText: 'Vertrouwd door 124 geverifieerde opleiders in heel België',
      why: {
        eyebrow: 'Waarom Blissify',
        title: 'Gebouwd voor de professional, niet voor de hype.',
        cards: [
          { icon: 'ti ti-rosette-discount-check', title: 'Curatorisch, niet algoritmisch', body: 'Elke opleider wordt handmatig geverifieerd. Een Blissify-vermelding betekent iets.' },
          { icon: 'ti ti-eye-check', title: 'Transparant', body: 'Prijs, duur, erkenning en locatie staan altijd vermeld. Nooit verborgen.' },
          { icon: 'ti ti-calendar-event', title: 'Avond, weekend of online', body: 'Vind het lesmoment dat bij jouw agenda past, zonder tussenpersoon.' },
        ],
      },
      photoSection: {
        title: 'Ontdek hoe Blissify werkt',
        subtitle: 'Van zoeken tot inschrijven: een helder, professioneel traject.',
        tiles: [
          { title: 'Zoek & vergelijk', body: 'Filter op categorie, locatie, lesmoment en erkenning.' },
          { title: 'Geverifieerde opleiders', body: 'Enkel handmatig gecontroleerde academies.' },
          { title: 'Schrijf je in', body: 'Vraag rechtstreeks informatie aan.' },
        ],
      },
      stats: [
        { value: '847', label: 'Opleidingen' },
        { value: '124', label: 'Geverifieerde opleiders' },
        { value: '3', label: 'Landen' },
      ],
      faq: [
        { question: 'Wat is Blissify?', answer: 'Blissify is een Belgisch platform dat cursisten verbindt met geverifieerde, professionele wellness- en beauty-opleiders.' },
        { question: 'Hoe weet ik dat een opleider betrouwbaar is?', answer: 'Elke opleider wordt handmatig gecontroleerd op identiteit, kwalificaties, programma-inhoud en erkenning voordat die op Blissify verschijnt.' },
        { question: 'Kost het iets om een opleiding te zoeken?', answer: 'Nee. Zoeken en vergelijken is volledig gratis voor cursisten. Je vraagt informatie rechtstreeks aan bij de opleider.' },
        { question: 'Wat betekent een erkend certificaat?', answer: 'Een erkende opleiding voldoet aan de kwaliteits- en urenstandaarden van een beroepsfederatie of onderwijsinstelling.' },
      ],
    } as any,
  })
  console.log('  ✓ Homepage content')

  // ── PRICING GLOBAL (single source of truth) ─────────────────────────────────
  console.log('💶 Seeding pricing...')
  await payload.updateGlobal({
    slug: 'pricing' as any,
    data: {
      intro: {
        eyebrow: 'Prijzen voor opleiders',
        title: 'Eenvoudige, eerlijke prijzen.',
        subtitle: 'Eén jaarlijks abonnement. Directe leads. Geen commissie per aanvraag.',
      },
      tiers: [
        { key: 'basis', name: 'Basis', tagline: 'Voor wie start', price: '€ 99', period: '/jaar', desc: 'Voor wie start: één opleiding en een professioneel profiel.', recommended: false, features: [{ feature: '1 opleiding' }, { feature: 'Opleider profiel' }, { feature: 'Aanvraagbeheer' }, { feature: 'Geen analytics' }] },
        { key: 'medium', name: 'Medium', tagline: 'Voor groeiende opleiders', price: '€ 290', period: '/jaar', desc: 'Voor groeiende opleiders die meer bereik en inzicht willen.', recommended: true, features: [{ feature: 'Tot 5 opleidingen' }, { feature: 'Opleider profiel' }, { feature: 'Aanvraagbeheer' }, { feature: 'Analytisch dashboard' }, { feature: 'Nieuwsbrief-vermelding' }] },
        { key: 'premium', name: 'Premium', tagline: 'Voor maximale zichtbaarheid', price: '€ 690', period: '/jaar', desc: 'Voor maximale zichtbaarheid met toppositie en support.', recommended: false, features: [{ feature: 'Onbeperkte opleidingen' }, { feature: 'Toppositie in resultaten' }, { feature: 'Premium badge' }, { feature: 'Featured plaatsing' }, { feature: 'Prioriteitssupport' }] },
      ],
      comparison: {
        col1: 'Basis',
        col2: 'Medium',
        col3: 'Premium',
        rows: [
          { feature: 'Aantal opleidingen', v1: '1', v2: 'Tot 5', v3: 'Onbeperkt' },
          { feature: 'Opleider profiel', v1: 'Ja', v2: 'Ja', v3: 'Ja' },
          { feature: 'Aanvraagbeheer', v1: 'Ja', v2: 'Ja', v3: 'Ja' },
          { feature: 'Analytisch dashboard', v1: '–', v2: 'Ja', v3: 'Ja' },
          { feature: 'Nieuwsbrief-vermelding', v1: '–', v2: 'Ja', v3: 'Ja' },
          { feature: 'Featured plaatsing', v1: '–', v2: '–', v3: 'Ja' },
          { feature: 'Prioriteitssupport', v1: '–', v2: '–', v3: 'Ja' },
        ],
      },
      bottomCta: {
        title: 'Jouw praktijk begint hier.',
        body: 'Sluit je aan bij 124 geverifieerde opleiders die hun bereik uitbreiden via Blissify.',
        buttonLabel: 'Bied mijn opleidingen aan',
        buttonUrl: '/inloggen',
      },
    } as any,
  })
  console.log('  ✓ Pricing')

  console.log('\n✅ Seeding complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err)
  process.exit(1)
})