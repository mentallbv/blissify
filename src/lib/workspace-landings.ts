/**
 * SEO landing pages under /werkruimtes (copy 10/2026): stoelhuur and
 * behandelruimte. Indexed from 5 active workspaces, else canonical to the hub.
 */
export type WorkspaceLanding = {
  key: string
  title: string
  description: string
  h1: string
  intro: string
  sections: { h2: string; body: string }[]
  faqTitle: string
  faq: [string, string][]
  /** Workplace types shown on the page. */
  workplaceTypes: string[]
}

export const WORKSPACE_LANDINGS: WorkspaceLanding[] = [
  {
    "key": "stoelhuur",
    "workplaceTypes": [
      "werkstoel"
    ],
    "sections": [
      {
        "h2": "Wat is stoelhuur en voor wie is het?",
        "body": "Je huurt een plek in een bestaande salon en werkt voor eigen rekening. Dat past bij kappers, maar ook bij nagelstylisten en beautyprofessionals met een eigen klantenkring."
      },
      {
        "h2": "Stoelhuur vergelijken: waar let je op?",
        "body": "Kijk naar locatie, huurprijs, wat is inbegrepen (water, elektriciteit, producten, wifi) en de looptijd. Vraag of je een eigen klantenkring meebrengt of klanten van de salon mag behandelen."
      }
    ],
    "faq": [
      [
        "Wat kost stoelhuur voor een kapper?",
        "Dat verschilt per salon en locatie. De huurprijs staat bij de publicatie."
      ],
      [
        "Wat is inbegrepen bij stoelhuur?",
        "Dat verschilt. Vraag naar nutsvoorzieningen, producten en gedeelde ruimtes."
      ],
      [
        "Kan ik stoelhuur combineren met een vacature?",
        "Ja, sommige salons bieden beide. Zie vacatures."
      ]
    ],
    "title": "Stoelhuur kapper en stoel huren in een salon",
    "description": "Zoek stoelhuur voor kapper of beautyprofessional in een bestaande salon in België en Nederland. Vergelijk de ruimtes en contacteer de verhuurder direct.",
    "h1": "Stoelhuur kapper en stoel huren in een salon",
    "intro": "Zoek je stoelhuur als kapper of beautyprofessional? Bekijk stoelen en werkplekken in bestaande salons in België en Nederland en maak rechtstreeks afspraken met de verhuurder.",
    "faqTitle": "Veelgestelde vragen over stoelhuur"
  },
  {
    "key": "behandelruimte",
    "workplaceTypes": [
      "behandelruimte",
      "volledig-salon"
    ],
    "sections": [
      {
        "h2": "Behandelkamer huren voor massage, schoonheid en wellness",
        "body": "Een behandelkamer huren is geschikt voor wie een paar dagen per week werkt of wil starten zonder volledige salon. Vergelijk locatie, voorzieningen en beschikbaarheid."
      },
      {
        "h2": "Praktijkruimte huren: wat vraag je aan de verhuurder?",
        "body": "Vraag naar de huurperiode, de beschikbare dagen, wat is inbegrepen en wat je mag doen in de ruimte, zoals het gebruik van producten of apparatuur."
      }
    ],
    "faq": [
      [
        "Kan ik een behandelkamer per dag of per uur huren?",
        "Dat hangt af van de verhuurder. Zie de publicatie."
      ],
      [
        "Wat kost een behandelkamer of praktijkruimte?",
        "Dat verschilt per locatie en verhuurder. De huurprijs staat bij de publicatie."
      ],
      [
        "Kan ik een behandelkamer huren als masseur of schoonheidsspecialiste?",
        "Ja, zie vacature masseur en opleiding massage."
      ]
    ],
    "title": "Behandelkamer en praktijkruimte huren",
    "description": "Vind een behandelkamer of praktijkruimte huren voor massage, schoonheidsbehandelingen en wellness in België en Nederland. Neem rechtstreeks contact op.",
    "h1": "Behandelkamer en praktijkruimte huren",
    "intro": "Zoek je een behandelkamer of praktijkruimte voor massage, schoonheidsbehandelingen of wellness? Bekijk beschikbare ruimtes voor vaste dagen, bepaalde tijdstippen of langere periodes en neem rechtstreeks contact op met de verhuurder.",
    "faqTitle": "Veelgestelde vragen over een behandelkamer huren"
  }
]

export const workspaceLanding = (key: string) => WORKSPACE_LANDINGS.find((l) => l.key === key) || null
