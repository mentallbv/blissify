/**
 * Veelgestelde vragen (copy 10/2026), seven categories. The downgrade answer
 * follows the client decision (publications go offline, never deleted) and
 * the trial is two months.
 */
export type FaqCategory = { title: string; items: [string, string][] }

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    "title": "Salons & professionals",
    "items": [
      [
        "Wat kan ik vinden bij Salons & professionals?",
        "Hier ontdek je salons, zelfstandige professionals, opleiders en academies binnen de beauty- en wellnesssector. Je bekijkt hun bedrijfsprofielen en aanbod en neemt rechtstreeks contact op."
      ],
      [
        "Kan ik als salon of zelfstandige professional een profiel aanmaken?",
        "Ja. Met een abonnement voor salons & professionals maak je één bedrijfsprofiel aan en gebruik je de mogelijkheden die bij jouw onderneming passen, zoals opleidingen publiceren, medewerkers zoeken of een werkruimte aanbieden."
      ],
      [
        "Welke mogelijkheden biedt Blissify voor mijn salon of onderneming?",
        "Vanuit één profiel publiceer je opleidingen, plaats je vacatures, bied je werkruimtes aan en werk je samen met merken en leveranciers. Lite (€15 per maand of €150 per jaar) omvat 1 opleiding, 1 vacature en 1 werkruimte. Premium (€49 per maand of €490 per jaar) omvat 5 opleidingen, 2 vacatures en 2 werkruimtes, plus basisstatistieken en betere zichtbaarheid. Ultimate (€97 per maand of €970 per jaar) is onbeperkt, met uitgebreide statistieken, prioritaire plaatsing en een Ultimate-badge. De aantallen gelden voor publicaties die tegelijk zichtbaar zijn. Alle prijzen zijn exclusief btw. Bekijk alle formules op Abonnementen & tarieven."
      ],
      [
        "Is Blissify bedoeld om mijn salonbehandelingen aan consumenten te promoten?",
        "Nee. Blissify is een B2B-platform voor professionele mogelijkheden binnen beauty en wellness. Het is geen boekingsplatform of bedrijvengids voor consumenten die een schoonheidsbehandeling zoeken."
      ]
    ]
  },
  {
    "title": "Merken & leveranciers",
    "items": [
      [
        "Wat kan ik vinden bij Merken & leveranciers?",
        "Je ontdekt professionele merken, leveranciers, producten en apparatuur voor beauty en wellness. Via de merkprofielen klik je rechtstreeks door naar de website of webshop."
      ],
      [
        "Kan ik producten rechtstreeks via Blissify kopen?",
        "Nee. Blissify is geen webshop en verwerkt zelf geen productbestellingen. Aankopen en verdere afspraken verlopen rechtstreeks via het merk of de leverancier."
      ],
      [
        "Hoe meld ik mijn merk of bedrijf aan?",
        "Kies een abonnement voor merken & leveranciers en stel je merkprofiel samen met bedrijfsinformatie, foto's, productinformatie, specialisaties en links naar je eigen kanalen. Afhankelijk van je abonnement publiceer je ook opleidingen, vacatures en werkruimtes."
      ],
      [
        "Welke mogelijkheden biedt Blissify voor mijn merk?",
        "Partner Lite (€49 per maand of €490 per jaar) toont je merk in 1 categorie, met links naar je website en webshop. Partner Premium (€89 per maand of €890 per jaar) toont je merk in maximaal 3 categorieën en omvat 5 opleidingen of events, 2 vacatures, 2 werkruimtes en basisstatistieken. Partner Ultimate (€149 per maand of €1.490 per jaar) is onbeperkt, met uitgebreide statistieken, prioritaire plaatsing en de mogelijkheid om samenwerkingen met opleiders te starten. Alle prijzen zijn exclusief btw."
      ],
      [
        "Controleert Blissify de kwaliteit van de producten?",
        "Een vermelding op Blissify is geen kwaliteitsgarantie of goedkeuring. Merken en leveranciers zijn zelf verantwoordelijk voor hun producten, diensten en de informatie die ze publiceren."
      ]
    ]
  },
  {
    "title": "Opleidingen",
    "items": [
      [
        "Welke opleidingen kan ik vinden op Blissify?",
        "Professionele opleidingen, praktijktrainingen, online cursussen, workshops en events binnen beauty en wellness. Het aanbod komt van opleiders, academies, salons, merken en leveranciers in België en Nederland."
      ],
      [
        "Hoe vind ik de juiste opleiding of cursus?",
        "Gebruik de zoekfunctie en de filters op categorie, locatie en opleidingstype. Bekijk daarna de opleidingspagina voor de inhoud, de aanbieder en de manier van inschrijven."
      ],
      [
        "Kan ik rechtstreeks via Blissify een opleiding boeken?",
        "Nee. Blissify verwerkt zelf geen inschrijvingen of betalingen. Via de opleidingspagina klik je door naar de website of inschrijvingspagina van de aanbieder, of neem je rechtstreeks contact op."
      ],
      [
        "Kan ik online opleidingen volgen op Blissify?",
        "Nee. Blissify is geen online leerplatform met videocursussen of lesmodules. Je vindt er wel informatie over online opleidingen en krijgt via de aanbieder toegang tot zijn leeromgeving of inschrijvingspagina."
      ],
      [
        "Zijn alle opleidingen op Blissify erkend?",
        "Niet noodzakelijk. Aanbieders zijn zelf verantwoordelijk voor de informatie die ze publiceren, waaronder erkenningen, certificaten en beroepskwalificaties. Vraag bij de aanbieder welk certificaat je ontvangt en of de opleiding aansluit bij jouw doel."
      ],
      [
        "Wie geeft het certificaat of diploma na een opleiding?",
        "De aanbieder zelf, niet Blissify."
      ],
      [
        "Hoe publiceer ik mijn eigen opleiding?",
        "Kies een abonnement voor salons & professionals of merken & leveranciers, maak je profiel aan en voeg een opleiding toe met beschrijving, foto's, praktische informatie en een link naar je website of inschrijvingspagina. Publiceren is inbegrepen in de abonnementen die dat aanbieden; het aantal opleidingen dat tegelijk zichtbaar is, hangt af van je formule. Je beheert alles via je dashboard."
      ],
      [
        "Kan ik mijn opleidingen achteraf aanpassen?",
        "Ja. Via je dashboard pas je opleidingen aan, activeer of deactiveer je ze."
      ],
      [
        "Kan ik als opleider samenwerken met merken en leveranciers?",
        "Ja. Merken en leveranciers met Partner Ultimate kunnen samenwerkingen met opleiders starten. Als opleider accepteer je die verzoeken en toon je goedgekeurde samenwerkingen op je profiel en bij je opleidingen."
      ]
    ]
  },
  {
    "title": "Werkruimtes",
    "items": [
      [
        "Welke werkruimtes kan ik vinden op Blissify?",
        "Beschikbare werkruimtes binnen beauty en wellness: behandelkamers, werkplekken in bestaande salons, gedeelde praktijkruimtes en volledige salons die te huur worden aangeboden."
      ],
      [
        "Kan ik een werkruimte huren voor enkele uren of dagen?",
        "Dat hangt af van de verhuurder. Sommige ruimtes worden aangeboden voor vaste dagen, bepaalde tijdstippen of langere periodes. Bekijk beschikbaarheid en huurvoorwaarden in de publicatie en neem rechtstreeks contact op met de verhuurder."
      ],
      [
        "Wat is het verschil tussen exclusief en gedeeld gebruik?",
        "Bij exclusief gebruik beschik je tijdens de afgesproken huurperiode zelf over de werkruimte. Bij gedeeld gebruik kan de ruimte ook door andere professionals worden gebruikt, afhankelijk van de afspraken met de verhuurder."
      ],
      [
        "Kan ik rechtstreeks via Blissify een werkruimte huren?",
        "Nee. Blissify verzorgt zelf geen reservaties, huurovereenkomsten of huurbetalingen. Via het platform vind je verhuurders en maak je rechtstreeks afspraken."
      ],
      [
        "Hoe bied ik mijn salon, stoel of behandelkamer te huur aan?",
        "Kies een abonnement waarin werkruimtes zijn inbegrepen, maak je profiel aan en publiceer de ruimte met beschrijving, foto's, locatie, huurprijs, voorzieningen en beschikbaarheid."
      ],
      [
        "Hoeveel kost het om een werkruimte aan te bieden?",
        "Publiceren is inbegrepen in de abonnementen die dit aanbieden. Je betaalt geen afzonderlijke advertentiekosten. Het aantal werkruimtes dat tegelijk zichtbaar is, hangt af van je abonnement."
      ],
      [
        "Kan ik mijn werkruimte tijdelijk offline halen?",
        "Ja. Je deactiveert de publicatie via je dashboard en activeert ze later opnieuw."
      ],
      [
        "Hoelang blijft mijn werkruimte zichtbaar?",
        "Er is geen vaste publicatietermijn. Je werkruimte blijft zichtbaar zolang je abonnement actief is, de publicatie aanstaat en ze binnen de limieten van je abonnement valt."
      ],
      [
        "Wie is verantwoordelijk voor de huurafspraken?",
        "De verhuurder en de huurder zelf, voor afspraken, overeenkomsten, betalingen en toepasselijke verplichtingen. Blissify is geen partij bij de huurovereenkomst."
      ]
    ]
  },
  {
    "title": "Vacatures & samenwerkingen",
    "items": [
      [
        "Welke vacatures kan ik vinden op Blissify?",
        "Vacatures en samenwerkingsmogelijkheden binnen beauty en wellness. Naast jobs in loondienst vind je zelfstandige samenwerkingen, freelanceopdrachten, samenwerkingen op commissiebasis en stageplaatsen."
      ],
      [
        "Hoe reageer ik op een vacature?",
        "Via de contactmogelijkheden op de vacaturepagina neem je rechtstreeks contact op met de onderneming. De sollicitatie en verdere communicatie verlopen rechtstreeks tussen jou en de onderneming."
      ],
      [
        "Kan ik als zelfstandige ook een samenwerking zoeken?",
        "Ja. Blissify richt zich niet uitsluitend op vacatures in loondienst. Je vindt ook mogelijkheden voor zelfstandigen, freelancers en andere samenwerkingsvormen."
      ],
      [
        "Hoe plaats ik een vacature?",
        "Kies een abonnement waarin vacatures zijn inbegrepen, maak je profiel aan en publiceer je vacature met informatie over de functie, de locatie, het type samenwerking, de voorwaarden en de contactmogelijkheden."
      ],
      [
        "Hoeveel kost het om een vacature te plaatsen?",
        "Vacatures plaatsen is inbegrepen in de abonnementen die dit aanbieden. Je betaalt geen afzonderlijke advertentiekosten. Het aantal vacatures dat tegelijk zichtbaar is, hangt af van je abonnement."
      ],
      [
        "Kan ik mijn vacature tijdelijk offline halen?",
        "Ja. Je deactiveert de vacature via je dashboard en activeert ze later opnieuw."
      ],
      [
        "Hoelang blijft mijn vacature zichtbaar?",
        "Er is geen vaste publicatietermijn. Je vacature blijft zichtbaar zolang je abonnement actief is, de publicatie aanstaat en ze binnen de limieten van je abonnement valt."
      ],
      [
        "Kan ik mijn vacature verwijderen zodra ik iemand gevonden heb?",
        "Ja. Je zet de vacature offline of verwijdert ze via je dashboard."
      ],
      [
        "Is Blissify betrokken bij de arbeidsovereenkomst?",
        "Nee. Blissify geeft zichtbaarheid aan vacatures en samenwerkingen, maar is geen partij bij arbeidsovereenkomsten of zelfstandige samenwerkingen."
      ]
    ]
  },
  {
    "title": "Abonnementen & betalingen",
    "items": [
      [
        "Heb ik een abonnement nodig om Blissify te gebruiken?",
        "Nee. Het bekijken, ontdekken en vergelijken van het publieke aanbod is volledig gratis. Wil je zelf je onderneming en aanbod zichtbaar maken, dan kies je een abonnement voor salons & professionals of voor merken & leveranciers."
      ],
      [
        "Waar vergelijk ik alle abonnementen en tarieven?",
        "Op de pagina Abonnementen & tarieven, met maand- en jaarprijzen, publicatielimieten en inbegrepen functies. Alle prijzen zijn exclusief btw."
      ],
      [
        "Kan ik maandelijks of jaarlijks betalen?",
        "Ja. Bij jaarlijkse betaling betaal je het equivalent van ongeveer tien maanden in plaats van twaalf, dus je krijgt ongeveer twee maanden gratis."
      ],
      [
        "Betaal ik extra om opleidingen, vacatures of werkruimtes te publiceren?",
        "Nee. Publiceren is inbegrepen, voor zover je formule het aanbiedt. Je betaalt geen afzonderlijke kosten per opleiding, vacature of werkruimte. Het aantal publicaties dat tegelijk zichtbaar is, hangt af van je abonnement."
      ],
      [
        "Worden abonnementen automatisch verlengd?",
        "Ja. Betaalde abonnementen worden automatisch verlengd volgens de gekozen betaalperiode, tenzij je de automatische verlenging stopzet."
      ],
      [
        "Hoe zeg ik mijn abonnement op?",
        "Je stopt de automatische verlenging via je dashboard. Je abonnement blijft actief tot het einde van de betaalde periode en wordt daarna niet verlengd."
      ],
      [
        "Kan ik mijn abonnement upgraden?",
        "Ja. Je stapt over naar een hoger abonnement. De nieuwe mogelijkheden worden beschikbaar volgens de voorwaarden van de wijziging, en een eventuele verrekening van reeds betaalde bedragen zie je tijdens de wijziging."
      ],
      [
        "Kan ik mijn abonnement downgraden?",
        "Ja. Heb je bij de overgang meer publicaties dan je nieuwe abonnement toelaat, dan worden de publicaties boven je limiet offline gezet. Ze blijven bewaard in je dashboard en je publiceert ze opnieuw zodra je binnen je limiet valt of opnieuw upgradet."
      ],
      [
        "Krijg ik mijn geld terug als ik mijn abonnement vroegtijdig stopzet?",
        "Het stopzetten van de automatische verlenging geeft geen recht op terugbetaling van de reeds betaalde periode. Eventuele uitzonderingen volgen de toepasselijke voorwaarden en wetgeving."
      ],
      [
        "Kan ik een abonnement voor salons & professionals combineren met een partnerabonnement?",
        "Nee. Per onderneming werk je met één hoofdprofiel en één abonnement. Kies de categorie die bij je onderneming past en combineer binnen dat abonnement de beschikbare mogelijkheden."
      ],
      [
        "Biedt Blissify een gratis proefperiode aan?",
        "Ja. Nieuwe aanbieders proberen Blissify twee maanden gratis uit, met de Ultimate-functies van hun abonnementscategorie. Daarna kies je zelf of je een betalend abonnement wilt."
      ]
    ]
  },
  {
    "title": "Algemeen",
    "items": [
      [
        "Wat is Blissify?",
        "Blissify is een platform voor de beauty- en wellnesssector in België en Nederland. Het brengt opleidingen, salons en opleiders, merken en leveranciers, werkruimtes en vacatures samen op één plek."
      ],
      [
        "Voor wie is Blissify bedoeld?",
        "Voor beauty- en wellnessprofessionals, opleiders, academies, merken, leveranciers, salonuitbaters en ondernemers. Of je nu je kennis wilt uitbreiden, een samenwerking zoekt of je eigen aanbod zichtbaar wilt maken: Blissify helpt je de juiste mogelijkheden te vinden."
      ],
      [
        "Is Blissify gratis voor bezoekers?",
        "Ja. Je bekijkt, ontdekt en vergelijkt het publieke aanbod gratis."
      ],
      [
        "Heb ik een account nodig om het aanbod te bekijken?",
        "Nee. Je bekijkt opleidingen, aanbieders, merken, leveranciers, werkruimtes en vacatures zonder account."
      ],
      [
        "Kan ik meerdere publicaties beheren vanuit één account?",
        "Ja. Je beheert je opleidingen, vacatures en werkruimtes vanuit één dashboard. Hoeveel publicaties tegelijk zichtbaar zijn, hangt af van je abonnement."
      ],
      [
        "Zijn de betaalde abonnementen bedoeld voor particulieren?",
        "Nee. De betaalde abonnementen zijn bedoeld voor professionele klanten die handelen in het kader van hun beroeps- of bedrijfsactiviteit. Bij registratie vragen we de relevante ondernemingsgegevens."
      ],
      [
        "Wie is verantwoordelijk voor de gepubliceerde informatie?",
        "Aanbieders zijn zelf verantwoordelijk voor de juistheid, actualiteit en rechtmatigheid van hun publicaties. Blissify kan publicaties beperken of verwijderen wanneer ze in strijd zijn met de algemene voorwaarden of de toepasselijke wetgeving."
      ],
      [
        "In welke landen is Blissify beschikbaar?",
        "Blissify richt zich op beauty- en wellnessprofessionals in België en Nederland."
      ]
    ]
  }
]
