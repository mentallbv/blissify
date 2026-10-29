import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-vercel-postgres'

/**
 * Homepage texts from the copy (10/2026): hero, the three pillars and the
 * first four "Algemeen" FAQ questions. CMS data, so a data migration; it stays
 * editable under Globals -> Homepage.
 */
const hero = {
  title: 'Alles voor jouw groei in',
  highlight: 'beauty & wellness.',
  subtitle: 'Vind opleidingen en cursussen, merken en leveranciers, werkruimtes en vacatures voor beauty- en wellnessprofessionals. Alles overzichtelijk samengebracht op één platform, in België en Nederland.',
  primaryCtaLabel: 'Vind een opleiding',
  primaryCtaUrl: '/opleidingen',
}
const why = {
  title: 'Gebouwd voor de professional, niet voor de hype.',
  cards: [
    { icon: 'ti ti-user-check', title: 'Rechtstreeks van de aanbieder', body: 'Elk profiel wordt door de aanbieder zelf ingevuld. Jij kiest met de filters wat je ziet en neemt rechtstreeks contact op.' },
    { icon: 'ti ti-eye-check', title: 'Transparant', body: 'Prijs, duur, locatie en voorwaarden staan duidelijk vermeld. Nooit verborgen.' },
    { icon: 'ti ti-calendar-event', title: 'Avond, weekend of online', body: 'Vind het lesmoment dat bij jouw agenda past, zonder tussenpersoon.' },
  ],
}
const faq = [
  { question: 'Wat is Blissify?', answer: 'Blissify is een platform voor de beauty- en wellnesssector in België en Nederland. Het brengt opleidingen, salons en opleiders, merken en leveranciers, werkruimtes en vacatures samen op één plek.' },
  { question: 'Voor wie is Blissify bedoeld?', answer: 'Voor beauty- en wellnessprofessionals, opleiders, academies, merken, leveranciers, salonuitbaters en ondernemers. Of je nu je kennis wilt uitbreiden, een samenwerking zoekt of je eigen aanbod zichtbaar wilt maken: Blissify helpt je de juiste mogelijkheden te vinden.' },
  { question: 'Is Blissify gratis voor bezoekers?', answer: 'Ja. Je bekijkt, ontdekt en vergelijkt het publieke aanbod gratis.' },
  { question: 'Heb ik een account nodig om het aanbod te bekijken?', answer: 'Nee. Je bekijkt opleidingen, aanbieders, merken, leveranciers, werkruimtes en vacatures zonder account.' },
]

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const cur = (await payload.findGlobal({ slug: 'homepage' as never, depth: 0 })) as Record<string, any>
  await payload.updateGlobal({ slug: 'homepage' as never, data: { hero: { ...(cur?.hero || {}), ...hero }, why, faq } as never })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // Copy change only; restore earlier texts from a version in the admin if needed.
}
