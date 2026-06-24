/** SEO-driven copy for category landing pages (from the Blissify copy doc). */
export type CategoryContent = {
  slug: string
  name: string
  metaTitle: string
  metaDescription: string
  h1: string
  heroIntro: string
  seoIntro: string
  section?: { title: string; body: string }
  faqs?: { q: string; a: string }[]
}

export const CATEGORY_CONTENT: Record<string, CategoryContent> = {
  nagelstyliste: {
    slug: 'nagelstyliste',
    name: 'Nagelstyliste',
    metaTitle: 'Opleiding nagelstyliste in België - Erkende cursussen',
    metaDescription:
      'Vind de beste opleiding nagelstyliste in België. Gel, acryl, gelnagels, nageldesign en permanente nagelverzorging. Dag- en avondopleidingen beschikbaar.',
    h1: 'Opleiding nagelstyliste in België',
    heroIntro:
      'Ontdek erkende opleidingen nagelstyliste van professionele academies. Van basistechnieken tot gevorderde nageldesign - vind de opleiding die aansluit op jouw niveau en agenda.',
    seoIntro:
      'Een opleiding nagelstyliste is de eerste stap naar een zelfstandige carrière in de beautybranche. Op Blissify vind je gecureerde opleidingen van geverifieerde opleiders door heel België - in Antwerpen, Gent, Limburg en West-Vlaanderen, maar ook online. Kies voor een dagopleiding, avondschool of weekendcursus.',
    section: {
      title: 'Wat leer je als nagelstyliste?',
      body:
        'Een professionele opleiding nagelstyliste dekt alle aspecten van het vak: anatomie van de nagel, gelextensies, acrylnagels, gelnagels, French manicure, nageldesign en klantenbehandeling. De meest gevraagde opleidingen omvatten ook hygiëne- en veiligheidsnormen die verplicht zijn in professionele salons.',
    },
    faqs: [
      {
        q: 'Hoe lang duurt een opleiding nagelstyliste?',
        a: 'Een basisopleiding duurt gemiddeld 3 tot 10 dagen intensief, afhankelijk van de opleider en het programma. Avondopleidingen lopen over meerdere weken.',
      },
      {
        q: 'Is een certificaat verplicht om als nagelstyliste te werken?',
        a: 'In België is er geen wettelijke verplichting, maar een erkend certificaat verhoogt je geloofwaardigheid bij klanten en is vaak vereist bij salons.',
      },
      {
        q: 'Wat kost een opleiding nagelstyliste?',
        a: 'Prijzen variëren van € 200 voor een introductiecursus tot € 1.500 voor een uitgebreid professioneel programma. Op Blissify zie je de prijs altijd voor je aanvraagt.',
      },
    ],
  },
  schoonheid: {
    slug: 'schoonheid',
    name: 'Schoonheidsspecialist',
    metaTitle: 'Schoonheidsspecialist opleiding in België - Erkende beauty opleidingen',
    metaDescription:
      'Word schoonheidsspecialiste met een erkende opleiding in België. Ontdek beauty, huidverzorging, make-up en nagelopleidingen van professionele academies.',
    h1: 'Schoonheidsspecialiste worden in België',
    heroIntro:
      'Ontdek erkende beauty opleidingen van professionele academies. Huidverzorging, make-up, nageldesign en meer - op Blissify vind je de opleiding die jouw carrière in de beautybranche start.',
    seoIntro:
      'Als schoonheidsspecialiste beheers je een breed scala aan behandelingen: van gelaatsverzorging en huidanalyse tot epilatie, make-up en nagelstyliste. Een professionele opleiding leert je alle technieken én de kennis om zelfstandig of in een salon te werken. Op Blissify vind je opleidingen van erkende academies door heel België.',
    section: {
      title: 'Erkende opleidingen van geverifieerde academies',
      body:
        'Elke opleider op Blissify wordt handmatig geverifieerd. Zoek specifiek op opleidingen met een erkend certificaat - essentieel als je wil werken in professionele salons of als zelfstandige.',
    },
  },
  'make-up': {
    slug: 'make-up',
    name: 'Make-up artist',
    metaTitle: 'Opleiding make-up artist en permanente make-up in België',
    metaDescription:
      'Word make-up artist of specialist permanente make-up met een erkende opleiding in België. Ontdek dag- en avondopleidingen via Blissify.',
    h1: 'Opleiding make-up artist in België',
    heroIntro:
      'Van klassieke dag- en avondmake-up tot permanente make-up en airbrush - vind een erkende make-up opleiding bij een professionele academy op Blissify.',
    seoIntro:
      'Een opleiding make-up artist leert je de technieken en de kleurentheorie die de basis vormen van elk professioneel werk. Of je nu wil werken in een salon, op filmsets, voor bruiloften of als freelancer - een erkende opleiding geeft je de tools én het certificaat om te starten.',
  },
  massage: {
    slug: 'massage',
    name: 'Massage',
    metaTitle: 'Massage opleiding in België - Professionele massage cursussen',
    metaDescription:
      'Vind een professionele massage opleiding in België. Sportmassage, deep tissue, kobido, cupping en meer. Erkende opleidingen van geverifieerde academies.',
    h1: 'Massage opleiding in België',
    heroIntro:
      'Professionele massageopleidingen van erkende academies. Van klassieke Zweedse massage tot sportmassage, deep tissue, kobido en cupping - vind de techniek die aansluit op jouw praktijk.',
    seoIntro:
      'Een opleiding massage is het fundament van een professionele carrière als massagetherapeut. Op Blissify vind je gespecialiseerde opleidingen in alle massagetechnieken - gegeven door ervaren therapeuten met jarenlange praktijkervaring. Alle opleiders zijn geverifieerd.',
    faqs: [
      {
        q: 'Heb ik een diploma nodig om als masseur te werken in België?',
        a: 'Voor klassieke ontspanningsmassage is er geen wettelijk verplicht diploma. Een erkend certificaat versterkt je professionele profiel en is vereist door veel werkgevers en verzekeraars.',
      },
      {
        q: 'Hoe lang duurt een massage opleiding?',
        a: 'Intensieve praktijkopleidingen duren 2 tot 6 dagen. Volledige professionele programma’s variëren van enkele weken tot meerdere maanden.',
      },
    ],
  },
  voetreflexologie: {
    slug: 'voetreflexologie',
    name: 'Voetreflexologie',
    metaTitle: 'Voetreflexologie opleiding in België - Erkende cursussen',
    metaDescription:
      'Vind een erkende opleiding voetreflexologie in België. Professionele cursussen van geverifieerde therapeuten. Filter op erkenning, locatie en lesmoment.',
    h1: 'Voetreflexologie opleiding in België',
    heroIntro:
      'Erkende opleidingen voetreflexologie van professionele therapeuten. Ontdek geaccrediteerde cursussen en bouw een stevige basis voor je therapeutische praktijk.',
    seoIntro:
      'Voetreflexologie is een erkende therapeutische techniek waarbij drukpunten op de voet worden gestimuleerd om organen en lichaamssystemen te beïnvloeden. Een professionele opleiding leert je de anatomie, de reflexzones en de behandelingstechnieken voor een zelfstandige praktijk.',
    section: {
      title: 'Erkende opleiding voetreflexologie - wat betekent dat?',
      body:
        'Een erkende opleiding voldoet aan de kwaliteits- en urenstandaarden van een erkende beroepsfederatie of onderwijsinstelling. Dit is belangrijk als je wil samenwerken met huisartsen of zorgkassen. Zoek op ‘Erkend certificaat’ om enkel erkende programma’s te zien.',
    },
  },
  aromatherapie: {
    slug: 'aromatherapie',
    name: 'Aromatherapie',
    metaTitle: 'Opleiding aromatherapie in België - Professionele cursussen',
    metaDescription:
      'Vind een professionele opleiding aromatherapie in België. Essentiële oliën, blending, therapeutische toepassingen. Erkende cursussen van geverifieerde opleiders.',
    h1: 'Opleiding aromatherapie in België',
    heroIntro:
      'Professionele opleidingen aromatherapie van erkende opleiders. Leer werken met essentiële oliën, therapeutische blends en de toepassingen die passen in een holistische praktijk.',
    seoIntro:
      'Aromatherapie combineert kennis van planten, essentiële oliën en het menselijk lichaam. Een professionele opleiding leert je veilig en effectief werken met essentiële oliën - voor ontspanning, pijnverlichting, huidverzorging en emotionele ondersteuning.',
    section: {
      title: 'Wat leer je in een opleiding aromatherapie?',
      body:
        'Een aromatherapieopleiding dekt de botanie en chemie van essentiële oliën, veilige dosering en contra-indicaties, blending-technieken, therapeutische toepassingen per klacht en de integratie van aromatherapie in massages of andere behandelingen.',
    },
  },
  reiki: {
    slug: 'reiki',
    name: 'Reiki',
    metaTitle: 'Reiki opleiding in België - Niveau 1, 2 en Master',
    metaDescription:
      'Vind een reiki opleiding in België. Niveau 1 (Shoden), niveau 2 (Okuden) en Reiki Master. Professionele cursussen van geverifieerde reikimeesters.',
    h1: 'Reiki opleiding in België',
    heroIntro:
      'Erkende reikiopleidingen van professionele reikimeesters. Van Niveau 1 voor beginners tot Reiki Master voor gevorderden - vind de opleiding die past bij jouw niveau en intentie.',
    seoIntro:
      'Reiki is een Japanse energie-healingtechniek die steeds meer erkenning krijgt als aanvullende therapie. Een professionele opleiding biedt een gestructureerd leerpad door de drie niveaus: Shoden (niveau 1), Okuden (niveau 2) en de Reiki Master.',
  },
  voeding: {
    slug: 'voeding',
    name: 'Voeding',
    metaTitle: 'Opleiding voeding en gezondheid in België - Professionele cursussen',
    metaDescription:
      'Vind een professionele opleiding voeding in België. Functionele voeding, voedingsleer, plantaardig eten en voeding & gezondheid. Erkende cursussen via Blissify.',
    h1: 'Opleiding voeding in België',
    heroIntro:
      'Professionele opleidingen voeding en gezondheid van erkende opleiders. Functionele voeding, voedingsleer, plantaardige voeding en meer - vind de cursus die jouw expertise verdiept.',
    seoIntro:
      'Voeding speelt een centrale rol in gezondheid, prestatie en welzijn. Een professionele opleiding leert je de wetenschap achter voedingsstoffen, de toepassing ervan in leefstijlbegeleiding en de praktijk van voedingsadvies.',
  },
  'persoonlijke-ontwikkeling': {
    slug: 'persoonlijke-ontwikkeling',
    name: 'Persoonlijke ontwikkeling',
    metaTitle: 'Opleiding persoonlijke ontwikkeling in België - Coaching en NLP',
    metaDescription:
      'Vind een opleiding persoonlijke ontwikkeling in België. Life coaching, NLP, mindset en zelfleiderschap. Professionele cursussen van erkende coaches via Blissify.',
    h1: 'Opleiding persoonlijke ontwikkeling in België',
    heroIntro:
      'Opleidingen in coaching, life coaching, NLP en zelfleiderschap van professionele coaches. Bouw competenties op om anderen te begeleiden of je eigen groeipotentieel te benutten.',
    seoIntro:
      'Persoonlijke ontwikkeling is een van de snelst groeiende sectoren in het Belgische opleidingslandschap. Een professionele opleiding biedt tools en methodieken om gedrag te begrijpen, te veranderen en te coachen - zowel bij jezelf als bij anderen.',
  },
  yoga: {
    slug: 'yoga',
    name: 'Yoga',
    metaTitle: 'Yoga opleiding in België - Yoga instructeur worden',
    metaDescription:
      'Word yoga instructeur met een erkende yoga opleiding in België. Hatha, yin yoga, vinyasa en meer. Professionele 200u trainingen van erkende yogascholen.',
    h1: 'Yoga opleiding in België',
    heroIntro:
      'Professionele yogaopleidingen voor aspirant-instructeurs en gevorderde beoefenaars. Van 200-uurs teacher trainings tot gespecialiseerde opleidingen in yin yoga, hatha en mindful movement.',
    seoIntro:
      'Een yoga opleiding in België is de stap van toegewijde beoefenaar naar professioneel instructeur. Een 200-uurs yoga teacher training is de internationale standaard en geeft je de basis om lessen te geven in studio’s, fitnesscentra of als zelfstandige.',
  },
  mindfulness: {
    slug: 'mindfulness',
    name: 'Mindfulness',
    metaTitle: 'Mindfulness opleiding in België - Coach en begeleider worden',
    metaDescription:
      'Vind een opleiding mindfulness of meditatie coach in België. Professionele cursussen voor Vlaanderen en heel België via Blissify.',
    h1: 'Mindfulness opleiding in België',
    heroIntro:
      'Professionele opleidingen mindfulness en meditatie van erkende coaches. Word mindfulnessbegeleider of meditatie coach met een erkend certificaat en een praktijkgerichte opleiding.',
    seoIntro:
      'Mindfulness en meditatie zijn uitgegroeid tot professioneel erkende begeleidingstechnieken. Een opleiding in België biedt een combinatie van theorie (aandachtstraining, neurowetenschappen, MBSR-principes) en praktijk (begeleide meditatie, groepsdynamiek, individuele begeleiding).',
  },
  'holistische-therapieen': {
    slug: 'holistische-therapieen',
    name: 'Holistische therapieën',
    metaTitle: 'Holistische therapie opleiding in België - Ayurveda, Reiki, Energie',
    metaDescription:
      'Ontdek opleidingen in holistische therapieën in België. Ayurveda, energetische therapie, chakrawerk en meer. Professionele cursussen via Blissify.',
    h1: 'Opleiding holistische therapieën in België',
    heroIntro:
      'Professionele opleidingen in holistische en energetische therapieën. Ayurveda, kristaltherapie, energetisch werk en meer - van geverifieerde therapeuten op Blissify.',
    seoIntro:
      'Holistische therapieën benaderen de mens als geheel - lichaam, geest en omgeving. Opleidingen in deze categorie omvatten een breed spectrum: van Ayurvedische geneeskunde en energetische therapie tot kristaltherapie en chakrabalancering. Op Blissify vind je opleiders die serieuze, professioneel onderbouwde programma’s aanbieden.',
  },
}

export const CATEGORY_SLUGS = Object.keys(CATEGORY_CONTENT)
