import React from 'react'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/SiteChrome'
import { Listing } from '@/components/site/Listing'
import { HubContent } from '@/components/site/HubContent'
import { getCourseCards, getCourseFilterOptions } from '@/lib/data'
import { parseCourseFilters } from '@/lib/filters'

export const dynamic = 'force-dynamic'

// Copy 10/2026, "Opleidingen (hub)".
export const metadata: Metadata = {
  title: 'Beauty- en wellnessopleidingen in België en Nederland',
  description: 'Vergelijk opleidingen en cursussen voor schoonheidsspecialiste, nagelstyliste, massage, pedicure en yoga. Neem rechtstreeks contact op met de opleider.',
}

type SP = Promise<Record<string, string | string[] | undefined>>

/** "Opleidingen per beroep" (copy 10/2026): the six SEO pages. */
const PER_BEROEP: [string, string, string][] = [
  ['Opleiding schoonheidsspecialiste', '/opleidingen/schoonheidsspecialiste', 'huidverzorging, harsen, wimperextensions, huidtherapie.'],
  ['Nagelstyliste opleiding', '/opleidingen/nagelstyliste', 'gelnagels, nail art, productkennis.'],
  ['Opleiding pedicure', '/opleidingen/pedicure', 'voetverzorging en medische pedicure.'],
  ['Massage opleiding', '/opleidingen/massage', 'ontspanningsmassage, sportmassage, hot stone, aromatherapie.'],
  ['Yoga docent opleiding', '/opleidingen/yoga', 'yogaleraar worden bij een yogaschool.'],
  ['Voetreflexologie opleiding', '/opleidingen/reflexologie', 'reflexologie als aanvulling op massage en pedicure.'],
]

export default async function OpleidingenPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const filters = parseCourseFilters(sp)
  const [{ cards, total }, options] = await Promise.all([getCourseCards({ ...filters, limit: 24 }), getCourseFilterOptions()])

  return (
    <SiteChrome>
      <Listing
        title="Vind de opleiding die bij jou past."
        header={{
          eyebrow: 'Opleidingen',
          title: 'Vind de opleiding die bij jou past.',
          intro: 'Ontdek professionele opleidingen, praktijktrainingen, online cursussen en workshops van opleiders, academies, merken en leveranciers in België en Nederland.',
        }}
        cards={cards}
        total={total}
        options={options}
        activeCategory={filters.categorySlug}
      />
      <HubContent
        sections={[
          { h2: 'Beauty opleiding of wellness opleiding: welke richting past bij jou?', body: 'Beauty en wellness bestaan uit veel beroepen met elk een eigen opleiding. Schoonheidsspecialiste en nagelstyliste werken vooral aan huid en nagels in een salon of instituut. Masseurs, pedicures, reflexologen en yogadocenten werken vaker in een praktijk, een spa of voor zichzelf. Kies eerst het beroep, vergelijk daarna het aanbod. Op Blissify vind je opleidingen van opleiders, academies en merken op één plek.' },
          {
            h2: 'Opleidingen en cursussen vergelijken op prijs, duur, locatie en lesmoment',
            body: 'Elke opleiding op Blissify toont de praktische informatie die jij nodig hebt om te vergelijken: prijs, duur, locatie, lesmoment (overdag, avond, weekend of online) en wat je na afloop ontvangt. Je neemt rechtstreeks contact op met de opleider of klikt door naar de inschrijvingspagina. Blissify verwerkt zelf geen inschrijvingen of betalingen.',
            sub: [
              { h3: 'Opleiding of cursus: wat is het verschil?', body: 'In België zeg je vaker opleiding, in Nederland vaker cursus. Als vuistregel is een opleiding breder en langer en richt een cursus zich op één techniek of product. De opleider vermeldt de duur en de inhoud bij elke publicatie.' },
              { h3: 'Een opleiding volgen om te starten, om bij te scholen of om je te specialiseren', body: 'Wie begint, kiest meestal een volledige opleiding. Wie al werkt, zoekt een bijscholing, een merktraining of een workshop voor een nieuwe behandeling. Filter op opleidingstype om beide te vinden.' },
            ],
          },
          {
            h2: 'Opleidingen per beroep',
            body: (
              <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9 }}>
                {PER_BEROEP.map(([label, href, text]) => <li key={href}><a href={href} className="bl-textlink">{label}</a>: {text}</li>)}
              </ul>
            ),
          },
          { h2: 'Opleidingen van merken en leveranciers', body: <>Veel merken geven zelf trainingen: productkennis, nieuwe technieken en apparatuurinstructies. Je vindt ze samen met de andere opleidingen en filtert op opleider om één merk te bekijken. Merken en leveranciers vind je ook op de pagina <a href="/merken-leveranciers" className="bl-textlink">Merken &amp; leveranciers</a>.</> },
        ]}
        faqTitle="Veelgestelde vragen over opleidingen"
        faq={[
          ['Kan ik me via Blissify inschrijven voor een opleiding?', 'Nee. Blissify brengt opleidingen en aanbieders samen, maar verwerkt zelf geen inschrijvingen of betalingen. Via de opleidingspagina klik je door naar de aanbieder.'],
          ['Wie geeft het diploma of certificaat?', 'De opleider of academie zelf. Blissify geeft geen diploma’s en keurt opleidingen niet goed. Vraag de opleider welk certificaat je ontvangt en of dat voor jouw doel volstaat.'],
          ['Hoe vergelijk ik beauty opleidingen en wellness cursussen?', 'Vergelijk inhoud, duur, prijs, locatie, lesmoment en wat er na afloop mogelijk is: werken in een salon, starten als zelfstandige of bijscholen. Vraag bij de opleider naar de lesgroep en de praktijkuren.'],
          ['Zijn er opleidingen in de avond, het weekend of online?', 'Ja, afhankelijk van de opleider. Gebruik het filter lesmoment om opleidingen te vinden die bij jouw agenda passen.'],
          ['Kan ik een opleiding volgen in België en in Nederland?', 'Ja. Je zoekt op locatie in beide landen of kiest online. Controleer bij de opleider of het diploma of certificaat in het land waar je wilt werken wordt aanvaard.'],
          ['Ik geef zelf opleidingen. Hoe zet ik die op Blissify?', 'Kies een abonnement voor salons & professionals of merken & leveranciers, maak een profiel en voeg je opleiding toe. Bekijk de formules op Abonnementen & tarieven.'],
        ]}
        links={[
          { href: '/merken-leveranciers', label: 'Merken & leveranciers' },
          { href: '/abonnementen-tarieven', label: 'Abonnementen & tarieven' },
        ]}
      />
    </SiteChrome>
  )
}
