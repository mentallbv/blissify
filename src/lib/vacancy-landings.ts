/**
 * SEO landing pages under /vacatures (copy 10/2026, "Vacature per beroep"):
 * the copy's texts plus the matching vacancies. Indexed from 5 active
 * vacancies; below that the page points its canonical to /vacatures.
 */
export type VacancyLanding = {
  key: string
  title: string
  description: string
  h1: string
  intro: string
  sections: { h2: string; body: string }[]
  faqTitle: string
  faq: [string, string][]
  /** Vacancy functions shown on the page. */
  functions: string[]
}

export const VACANCY_LANDINGS: VacancyLanding[] = [
  {
    "key": "schoonheidsspecialiste",
    "sections": [
      {
        "h2": "Vacature schoonheidsspecialiste in loondienst of als zelfstandige",
        "body": "Een vacature kan vast of tijdelijk zijn, met een vast uurrooster of flexibel. Als zelfstandige werk je voor eigen rekening in een salon of instituut. Elke vacature toont het type samenwerking."
      },
      {
        "h2": "Stage schoonheidsspecialiste en instapvacatures",
        "body": "Net afgestudeerd? Zoek een stageplaats of instapvacature en bekijk de opleiding schoonheidsspecialiste voor bijscholingen."
      },
      {
        "h2": "Solliciteren als schoonheidsspecialiste: waar let je op?",
        "body": "Bekijk functie, locatie, type samenwerking en vergoeding, voor zover de onderneming die vermeldt. Vraag in het gesprek naar het behandelaanbod en de producten waarmee je werkt."
      }
    ],
    "faq": [
      [
        "Waar vind ik een vacature schoonheidsspecialiste?",
        "Op Blissify bekijk je vacatures van salons, instituten en spa's in België en Nederland. Filter op locatie en type samenwerking."
      ],
      [
        "Kan ik als schoonheidsspecialiste zelfstandig werken in een salon?",
        "Ja, veel salons werken met zelfstandigen. De vacature toont de samenwerkingsvorm en de afspraken verschillen per salon."
      ],
      [
        "Is er ook een stage schoonheidsspecialiste?",
        "Ja, filter op type samenwerking stage."
      ],
      [
        "Hoe reageer ik op een vacature?",
        "Rechtstreeks bij de onderneming, via de contactmogelijkheden op de vacaturepagina."
      ],
      [
        "Zie ik het loon in de vacature?",
        "Alleen als de onderneming het vermeldt. Vraag het anders in het eerste gesprek."
      ]
    ],
    "title": "Vacature schoonheidsspecialiste in België en Nederland",
    "description": "Bekijk vacatures voor schoonheidsspecialiste in loondienst, als zelfstandige of als stagiair. Reageer rechtstreeks bij het salon of instituut.",
    "h1": "Vacature schoonheidsspecialiste in België en Nederland",
    "intro": "Zoek je een vacature als schoonheidsspecialiste? Bekijk vacatures in loondienst, samenwerkingen als zelfstandige en stageplaatsen bij salons, instituten en spa's. Reageer rechtstreeks bij de onderneming.",
    "faqTitle": "Veelgestelde vragen over vacatures voor schoonheidsspecialiste",
    "functions": [
      "schoonheidsspecialist"
    ]
  },
  {
    "key": "nagelstyliste",
    "sections": [
      {
        "h2": "Vacature nagelstyliste in loondienst of als zelfstandige",
        "body": "Nagelsalons werken met medewerkers en met zelfstandigen. Elke vacature toont het type samenwerking."
      },
      {
        "h2": "Nagelstyliste worden of bijscholen vóór je solliciteert",
        "body": "Vergelijk de nagelstyliste opleidingen en cursussen voor gel, acryl en nail art."
      }
    ],
    "faq": [
      [
        "Waar vind ik een vacature nagelstyliste?",
        "Op Blissify, per locatie en type samenwerking."
      ],
      [
        "Kan ik als nagelstyliste een stoel of ruimte huren?",
        "Ja, bekijk stoelhuur en werkruimtes."
      ],
      [
        "Welke opleiding hebben nagelsalons nodig?",
        "Dat verschilt per salon. Kijk in de vacature naar de gevraagde ervaring of het certificaat."
      ],
      [
        "Hoe reageer ik op een vacature?",
        "Rechtstreeks bij de onderneming."
      ]
    ],
    "title": "Vacature nagelstyliste in België en Nederland",
    "description": "Bekijk vacatures voor nagelstyliste in loondienst of als zelfstandige samenwerking. Reageer rechtstreeks bij het nagelsalon.",
    "h1": "Vacature nagelstyliste in België en Nederland",
    "intro": "Zoek je een vacature als nagelstyliste? Bekijk vacatures in loondienst en samenwerkingen als zelfstandige bij nagelsalons en instituten, en reageer rechtstreeks.",
    "faqTitle": "Veelgestelde vragen over vacatures voor nagelstyliste",
    "functions": [
      "nagelstylist"
    ]
  },
  {
    "key": "pedicure",
    "sections": [
      {
        "h2": "Vacature pedicure in loondienst of als zelfstandige",
        "body": "Pedicures werken in een salon, een voetzorgpraktijk of voor zichzelf. De vacature toont de vorm van samenwerking."
      },
      {
        "h2": "Pedicure worden of bijscholen",
        "body": "Bekijk de opleiding pedicure en de voetreflexologie opleidingen."
      }
    ],
    "faq": [
      [
        "Waar vind ik een vacature pedicure?",
        "Op Blissify, per locatie en type samenwerking."
      ],
      [
        "Kan ik als pedicure zelfstandig in een praktijk werken?",
        "Ja, sommige praktijken werken met zelfstandigen. Zie ook behandelruimte huren."
      ],
      [
        "Hoe reageer ik op een vacature?",
        "Rechtstreeks bij de onderneming."
      ]
    ],
    "title": "Vacature pedicure in België en Nederland",
    "description": "Bekijk vacatures voor pedicure in loondienst of als zelfstandige samenwerking. Reageer rechtstreeks bij het salon of de praktijk.",
    "h1": "Vacature pedicure in België en Nederland",
    "intro": "Zoek je een vacature als pedicure? Bekijk vacatures in loondienst en samenwerkingen als zelfstandige bij salons en praktijken, en reageer rechtstreeks bij de onderneming.",
    "faqTitle": "Veelgestelde vragen over vacatures voor pedicure",
    "functions": [
      "pedicure",
      "medisch-pedicure"
    ]
  },
  {
    "key": "masseur",
    "sections": [
      {
        "h2": "Vacature masseur in een spa, praktijk of salon",
        "body": "Spa's zoeken vaak ontspanningsmassage, praktijken ook sport- of herstelmassage. Kijk naar de gevraagde technieken en het type samenwerking."
      },
      {
        "h2": "Masseur worden of bijscholen",
        "body": "Bekijk de massage opleidingen en cursussen."
      }
    ],
    "faq": [
      [
        "Waar vind ik een vacature masseur of masseuse?",
        "Op Blissify, per locatie en type samenwerking."
      ],
      [
        "Kan ik als masseur zelfstandig werken?",
        "Ja, dat kan in een praktijk of door een behandelruimte te huren."
      ],
      [
        "Hoe reageer ik op een vacature?",
        "Rechtstreeks bij de onderneming."
      ]
    ],
    "title": "Vacature masseur of masseuse in België en Nederland",
    "description": "Bekijk vacatures voor masseur of masseuse in spa's, praktijken en salons. Loondienst of zelfstandig: reageer rechtstreeks.",
    "h1": "Vacature masseur of masseuse in België en Nederland",
    "intro": "Zoek je een vacature als masseur of masseuse? Bekijk vacatures bij spa's, praktijken en salons, in loondienst of als zelfstandige, en reageer rechtstreeks.",
    "faqTitle": "Veelgestelde vragen over vacatures voor masseur",
    "functions": [
      "masseur"
    ]
  },
  {
    "key": "kapper",
    "sections": [
      {
        "h2": "Vacature kapper in loondienst of met stoelhuur",
        "body": "Kapsalons werken met medewerkers en met zelfstandigen die een stoel huren. Zie stoelhuur."
      }
    ],
    "faq": [
      [
        "Waar vind ik een vacature kapper of kapster?",
        "Op Blissify, per locatie en type samenwerking."
      ],
      [
        "Kan ik als kapper een stoel huren in een salon?",
        "Ja. Bekijk de werkruimtes en stoelhuur."
      ],
      [
        "Hoe reageer ik op een vacature?",
        "Rechtstreeks bij de onderneming."
      ]
    ],
    "title": "Vacature kapper en kapster in België en Nederland",
    "description": "Bekijk vacatures voor kapper of kapster in loondienst of als zelfstandige. Reageer rechtstreeks bij de kapsalon.",
    "h1": "Vacature kapper en kapster in België en Nederland",
    "intro": "Zoek je een vacature als kapper of kapster? Bekijk vacatures in loondienst en kansen als zelfstandige, en reageer rechtstreeks bij de kapsalon.",
    "faqTitle": "Veelgestelde vragen over vacatures voor kapper",
    "functions": [
      "kapper",
      "barber"
    ]
  }
]

export const VACANCY_LANDING_KEYS = new Set(VACANCY_LANDINGS.map((l) => l.key))
export const vacancyLanding = (key: string) => VACANCY_LANDINGS.find((l) => l.key === key) || null
/** Vacancies a landing page needs before it is indexed on its own. */
export const LANDING_INDEX_MIN = 5
