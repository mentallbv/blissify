/**
 * Course SEO landing pages (copy 10/2026, "Opleidingen per beroep"). Each
 * maps to one or more taxonomy categories; yoga and reflexologie have no
 * category in the taxonomy yet, so they stay empty and noindex until added.
 */
export type CourseLanding = {
  key: string
  categories: string[]
  title: string
  description: string
  h1: string
  intro: string
  sections: { h2: string; body: string; sub: { h3: string; body: string }[] }[]
  faqTitle: string
  faq: [string, string][]
}

export const COURSE_LANDINGS: CourseLanding[] = [
  {
    "key": "schoonheidsspecialiste",
    "categories": [
      "gelaatsverzorging-skincare",
      "esthetische-huidtechnieken",
      "wenkbrauwen-wimpers",
      "waxing-manuele-ontharing"
    ],
    "sections": [
      {
        "h2": "Wat leer je in een opleiding schoonheidsspecialiste?",
        "body": "Het aanbod loopt van een volledige opleiding tot gerichte bijscholingen. Typische onderdelen zijn gelaatsverzorging, huidanalyse, harsen, make-up en lichaamsbehandelingen. Wie zich wil specialiseren, vindt aparte opleidingen voor wimperextensions en huidtherapie.",
        "sub": [
          {
            "h3": "Opleiding wimperextensions",
            "body": "Een korte bijscholing voor wie wimperextensions aan het aanbod wil toevoegen. Vraag naar de duur, de producten en of je een startpakket krijgt."
          },
          {
            "h3": "Opleiding huidtherapeut en huidtherapie",
            "body": "Een verdieping voor wie dieper op de huid wil werken. Vergelijk welke voorkennis de opleider vraagt."
          }
        ]
      },
      {
        "h2": "Hoe kies je een opleiding schoonheidsspecialiste?",
        "body": "Vergelijk inhoud, duur, prijs, locatie en lesmoment, en vraag de opleider welk certificaat of diploma je ontvangt. Zo weet je of de opleiding past bij jouw doel, bijvoorbeeld werken in een salon of starten als zelfstandige.",
        "sub": [
          {
            "h3": "Opleiding schoonheidsspecialiste in de avond of als volwassene",
            "body": "Wie al werkt of een carrièreswitch maakt, zoekt vaak avondlessen of lessen in het weekend. Gebruik het filter lesmoment en vraag de opleider of er instroom tijdens het jaar mogelijk is."
          },
          {
            "h3": "Opleiding schoonheidsspecialiste kosten",
            "body": "De prijs hangt af van de duur, de lesgroep en het materiaal dat is inbegrepen. Op Blissify staat de prijs bij elke opleiding, zodat je vergelijkt zonder eerst een offerte te vragen."
          }
        ]
      },
      {
        "h2": "Na je opleiding: werken in een salon of zelfstandig starten",
        "body": "Als schoonheidsspecialiste kies je tussen loondienst en een eigen praktijk. Bekijk de vacatures voor schoonheidsspecialiste of zoek een salon te huur als je zelfstandig wilt starten.",
        "sub": []
      }
    ],
    "faq": [
      [
        "Hoe word ik schoonheidsspecialiste?",
        "Meestal volg je daarvoor een opleiding bij een opleider of academie. Hoe lang die duurt en welk certificaat je krijgt, verschilt per aanbieder. Vergelijk het aanbod en vraag de opleider rechtstreeks."
      ],
      [
        "Hoe lang duurt een opleiding schoonheidsspecialiste?",
        "Dat hangt af van de opleider en van het type opleiding. Een bijscholing duurt korter dan een volledige opleiding. De duur staat bij elke publicatie."
      ],
      [
        "Wat kost een opleiding schoonheidsspecialiste?",
        "De prijs verschilt per aanbieder en per type. Vergelijk daarom prijs én wat erbij inbegrepen is, zoals materiaal en examen."
      ],
      [
        "Kan ik een opleiding schoonheidsspecialiste online volgen?",
        "Een deel van de theorie kan online. Praktijk vraagt meestal lessen op locatie. Vraag de opleider hoe die verdeeld zijn."
      ],
      [
        "Wat is het verschil tussen schoonheidsspecialiste en huidtherapeut?",
        "Een schoonheidsspecialiste verzorgt de huid in de salon. Een huidtherapeut gaat dieper op huidproblemen in. Opleidingen verschillen daardoor in inhoud en voorkennis; de opleider vermeldt dat."
      ],
      [
        "Wie geeft het diploma of certificaat?",
        "De opleider of academie zelf, niet Blissify."
      ]
    ],
    "title": "Opleiding schoonheidsspecialiste vergelijken",
    "description": "Vergelijk opleidingen en cursussen schoonheidsspecialiste op prijs, duur, locatie en lesmoment in België en Nederland. Contacteer de opleider rechtstreeks.",
    "h1": "Opleiding schoonheidsspecialiste in België en Nederland",
    "intro": "Zoek je een opleiding of cursus schoonheidsspecialiste? Vergelijk opleidingen van opleiders, academies en merken op prijs, duur, locatie en lesmoment, en neem rechtstreeks contact op met de aanbieder.",
    "faqTitle": "Veelgestelde vragen over de opleiding schoonheidsspecialiste"
  },
  {
    "key": "nagelstyliste",
    "categories": [
      "gel-acryl",
      "nail-art",
      "nagelprothesen",
      "manicure-pedicure"
    ],
    "sections": [
      {
        "h2": "Nagelstyliste worden: welke opleiding of cursus past bij jou?",
        "body": "Wie nagelstyliste wil worden, kiest tussen een volledige opleiding en een cursus per techniek. Een basiscursus leert je werken met gel of acryl. Een bijscholing richt zich op een techniek of merk.",
        "sub": [
          {
            "h3": "Cursus gelnagels",
            "body": "Een cursus gelnagels leert je voorbereiden, opbouwen, afwerken en onderhouden. Controleer of een startpakket of producten zijn inbegrepen."
          },
          {
            "h3": "Nail art en bijscholing",
            "body": "Voor wie al nagels doet en het aanbod wil uitbreiden met nail art of een nieuw systeem."
          }
        ]
      },
      {
        "h2": "Opleiding of cursus nagelstyliste: wat is het verschil?",
        "body": "Een opleiding is doorgaans breder en langer, een cursus richt zich vaak op één techniek of product. De opleider vermeldt duur en inhoud bij elke publicatie.",
        "sub": []
      },
      {
        "h2": "Training van een nagelmerk volgen",
        "body": "Veel nagelmerken geven eigen trainingen waarin je de producten en het systeem leert gebruiken. Ook merken en leveranciers publiceren opleidingen en workshops op Blissify. Vergelijk ze met de aanbieders van onafhankelijke opleidingen.",
        "sub": []
      }
    ],
    "faq": [
      [
        "Hoe word ik nagelstyliste?",
        "Meestal met een opleiding of cursus bij een opleider, academie of nagelmerk. Vergelijk inhoud, duur, prijs en wat je na afloop kan."
      ],
      [
        "Wat kost een cursus gelnagels?",
        "De prijs verschilt per aanbieder en hangt af van de duur en van het materiaal dat is inbegrepen. De prijs staat bij elke opleiding."
      ],
      [
        "Kan ik als nagelstyliste zelfstandig werken?",
        "Ja, veel nagelstylistes werken zelfstandig of huren een stoel of ruimte. Bekijk vacatures nagelstyliste en werkruimtes voor beide mogelijkheden."
      ],
      [
        "Is er een verschil tussen BE en NL?",
        "Ja in woordgebruik: in België zeg je vaker opleiding, in Nederland vaker cursus. Je vindt op Blissify opleidingen in beide landen."
      ],
      [
        "Kan ik een training van een merk volgen?",
        "Ja. Ook merken en leveranciers publiceren opleidingen en workshops op Blissify."
      ]
    ],
    "title": "Nagelstyliste opleiding en cursus vergelijken",
    "description": "Vind een nagelstyliste opleiding of cursus gelnagels in België en Nederland. Vergelijk prijs, duur en locatie en vraag direct informatie aan.",
    "h1": "Nagelstyliste opleiding en cursus",
    "intro": "Op zoek naar een nagelstyliste opleiding of een cursus gelnagels? Vergelijk opleidingen en cursussen van opleiders, academies en nagelmerken in België en Nederland en vraag rechtstreeks informatie aan.",
    "faqTitle": "Veelgestelde vragen over de nagelstyliste opleiding"
  },
  {
    "key": "pedicure",
    "categories": [
      "medische-pedicure",
      "manicure-pedicure",
      "hand-voetmassages"
    ],
    "sections": [
      {
        "h2": "Pedicure worden: opleiding of cursus kiezen",
        "body": "Pedicure en voetverzorging omvatten onder andere voetverzorging, nagelverzorging en kalknagels. Sommige opleidingen richten zich op medische pedicure. Vergelijk de inhoud en vraag de opleider welke voorkennis nodig is.",
        "sub": []
      },
      {
        "h2": "Opleiding pedicure: kosten, duur en lesmoment",
        "body": "Zoekers vragen vaak eerst naar de prijs. Op Blissify staat de prijs bij elke opleiding, samen met duur, locatie en lesmoment. Vraag de opleider wat is inbegrepen, zoals instrumenten, materiaal en examen. Met het filter lesmoment vind je opleidingen in de avond, het weekend of online.",
        "sub": []
      },
      {
        "h2": "Na de opleiding: werken als pedicure",
        "body": "Bekijk de vacatures voor pedicure in loondienst of als zelfstandige. Wie verder wil, bekijkt ook de opleidingen voetreflexologie.",
        "sub": []
      }
    ],
    "faq": [
      [
        "Wat kost een opleiding pedicure?",
        "De prijs verschilt per aanbieder en per type. Vergelijk prijs én wat erbij inbegrepen is."
      ],
      [
        "Hoe word ik pedicure?",
        "Je volgt meestal een opleiding of cursus bij een opleider of academie. De duur en het certificaat verschillen per aanbieder."
      ],
      [
        "Wat is het verschil tussen pedicure en medische pedicure?",
        "Pedicure richt zich op verzorging van voeten en nagels. Medische pedicure houdt zich bezig met voetproblemen. Vraag de opleider welke inhoud een opleiding heeft."
      ],
      [
        "Kan ik een opleiding pedicure in de avond, het weekend of online volgen?",
        "Dat hangt af van de opleider. Gebruik het filter lesmoment."
      ],
      [
        "Waar werkt een pedicure?",
        "In een salon, een voetzorgpraktijk, aan huis of als zelfstandige. Zie de vacatures en de werkruimtes."
      ]
    ],
    "title": "Opleiding pedicure en pedicure cursus",
    "description": "Vergelijk opleidingen en cursussen pedicure in België en Nederland. Bekijk prijs, duur, locatie en lesvorm en vraag rechtstreeks informatie aan.",
    "h1": "Opleiding pedicure en voetverzorging",
    "intro": "Zoek je een opleiding pedicure of een pedicure cursus? Vergelijk het aanbod van opleiders en academies in België en Nederland en neem rechtstreeks contact op met de aanbieder.",
    "faqTitle": "Veelgestelde vragen over de opleiding pedicure"
  },
  {
    "key": "massage",
    "categories": [
      "massage-lichaamsbehandelingen",
      "aromatherapie"
    ],
    "sections": [
      {
        "h2": "Welke massage opleiding past bij jou?",
        "body": "Dat hangt af van je doel. Wil je werken in een salon of spa, in een sportpraktijk of als zelfstandige? Vergelijk de inhoud en vraag de opleider welk certificaat je ontvangt.",
        "sub": [
          {
            "h3": "Opleiding masseur en opleiding massagetherapeut",
            "body": "Brede opleidingen voor wie massage als beroep wil uitoefenen. Vergelijk duur, inhoud en lesmethode."
          },
          {
            "h3": "Opleiding sportmassage",
            "body": "Gericht op massage voor sporters en herstel. Vraag naar de voorkennis die de opleider verwacht."
          },
          {
            "h3": "Opleiding aromatherapie en hot stone",
            "body": "Aanvullende technieken voor in de salon of spa. Handig om je aanbod uit te breiden."
          }
        ]
      },
      {
        "h2": "Massage cursus voor beginners of bijscholing",
        "body": "Een massage cursus vraagt minder tijd dan een volledige opleiding. Ideaal voor een eerste kennismaking of als aanvulling op een bestaand beroep. Vergelijk duur, lesmoment en prijs.",
        "sub": []
      },
      {
        "h2": "Werken als masseur of zelfstandige in een praktijk",
        "body": "Bekijk de vacatures voor masseur of zoek een behandelkamer of praktijkruimte om zelfstandig te starten.",
        "sub": []
      }
    ],
    "faq": [
      [
        "Wat is het verschil tussen een massage opleiding en een massage cursus?",
        "Een opleiding is breder en langer, een cursus richt zich op één techniek. In België zeg je vaker opleiding, in Nederland vaker cursus."
      ],
      [
        "Hoe word ik masseur?",
        "Je volgt meestal een opleiding of cursus bij een opleider. Vergelijk inhoud, duur en wat je na afloop kan."
      ],
      [
        "Wat kost een massage cursus?",
        "De prijs hangt af van duur en inhoud en verschilt per aanbieder. De prijs staat bij elke opleiding."
      ],
      [
        "Kan ik een massage cursus volgen zonder voorkennis?",
        "Veel cursussen zijn voor beginners. Controleer bij de opleider welke voorkennis is vereist."
      ],
      [
        "Welke massage opleiding past bij werken in een spa?",
        "Kies een opleiding met ontspanningsmassage en aanvullende technieken. Vraag de opleider welke vaardigheden werkgevers zoeken."
      ]
    ],
    "title": "Massage opleiding en massage cursus vergelijken",
    "description": "Vergelijk massage opleidingen en cursussen: ontspanning, sport, hot stone en meer. Kies op locatie, prijs en lesmoment en contacteer de opleider direct.",
    "h1": "Massage opleiding en massage cursus",
    "intro": "Zoek je een massage opleiding of een massage cursus? Vergelijk opleidingen en cursussen voor ontspanningsmassage, sportmassage, hot stone en aromatherapie van opleiders en academies in België en Nederland.",
    "faqTitle": "Veelgestelde vragen over de massage opleiding"
  },
  {
    "key": "yoga",
    "categories": [],
    "sections": [
      {
        "h2": "Yoga docent worden: hoe kies je een opleiding?",
        "body": "Meestal volg je daarvoor een opleiding bij een yogaschool of opleider. Op Blissify vergelijk je prijs, duur, locatie en lesmoment en vraag je rechtstreeks informatie aan. Vraag de opleider naar de yogastijl, het aantal lesuren en het certificaat.",
        "sub": []
      },
      {
        "h2": "Yoga opleiding: bijscholing en specialisaties",
        "body": "Voor wie al lesgeeft, bestaan bijscholingen en workshops. Vergelijk het aanbod op stijl, duur en lesmoment.",
        "sub": []
      }
    ],
    "faq": [
      [
        "Hoe word ik yoga docent?",
        "Je volgt een opleiding bij een yogaschool of opleider. De duur, de stijl en het certificaat verschillen per aanbieder."
      ],
      [
        "Hoe lang duurt een yoga docent opleiding?",
        "Dat hangt af van de opleider en van de stijl. De duur staat bij elke publicatie."
      ],
      [
        "Wat kost een yoga docent opleiding?",
        "De prijs verschilt per aanbieder. Vergelijk ook wat is inbegrepen."
      ],
      [
        "Kan ik een yoga docent opleiding online volgen?",
        "Dat hangt af van de opleider. Gebruik het filter lesmoment en locatie om online aanbod te vinden."
      ]
    ],
    "title": "Yoga docent opleiding vergelijken",
    "description": "Vergelijk yoga docent opleidingen in België en Nederland. Bekijk prijs, duur, locatie en lesmoment en neem rechtstreeks contact op met de opleider.",
    "h1": "Yoga docent opleiding in België en Nederland",
    "intro": "Zoek je een yoga docent opleiding? Vergelijk opleidingen en workshops van yogascholen en opleiders in België en Nederland en neem rechtstreeks contact op met de aanbieder.",
    "faqTitle": "Veelgestelde vragen over de yoga docent opleiding"
  },
  {
    "key": "reflexologie",
    "categories": [],
    "sections": [
      {
        "h2": "Opleiding voetreflexologie en reflexologie: wat leer je?",
        "body": "Voetreflexologie is een aanvulling op massage en pedicure. Vergelijk de inhoud en vraag de opleider welke voorkennis nodig is.",
        "sub": []
      },
      {
        "h2": "Welke opleidingen sluiten hierbij aan?",
        "body": "Bekijk ook de opleidingen massage en pedicure.",
        "sub": []
      }
    ],
    "faq": [
      [
        "Hoe word ik voetreflexoloog?",
        "Je volgt een opleiding bij een opleider. Vergelijk duur, inhoud en certificaat."
      ],
      [
        "Wat kost een opleiding voetreflexologie?",
        "De prijs verschilt per aanbieder en staat bij elke opleiding."
      ],
      [
        "Kan ik reflexologie combineren met massage of pedicure?",
        "Ja, veel professionals combineren die technieken. Bekijk de aanverwante opleidingen."
      ]
    ],
    "title": "Voetreflexologie opleiding vergelijken",
    "description": "Vergelijk voetreflexologie opleidingen in België en Nederland op prijs, duur en locatie. Vraag rechtstreeks informatie aan bij de opleider.",
    "h1": "Voetreflexologie opleiding",
    "intro": "Zoek je een voetreflexologie opleiding? Vergelijk het aanbod van opleiders in België en Nederland op prijs, duur, locatie en lesmoment.",
    "faqTitle": "Veelgestelde vragen over de opleiding voetreflexologie"
  }
]

export const courseLanding = (key: string) => COURSE_LANDINGS.find((l) => l.key === key) || null
