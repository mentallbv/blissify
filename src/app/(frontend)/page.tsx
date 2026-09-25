import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { SiteNav } from '@/components/site/SiteNav'
import { SiteFooter, Marquee } from '@/components/site/SiteFooter'
import { StatCounters } from '@/components/site/StatCounters'
import { Faq } from '@/components/site/Faq'
import { SearchCard } from '@/components/site/SearchCard'
import { PricingPlans } from '@/components/site/PricingPlans'
import { Eyebrow, ButtonLink, CourseCard } from '@/components/ui'
import { getPricingCatalog, getCourseFilterOptions, getHomepageSections } from '@/lib/data'
import { FAQ_HOME } from '@/lib/pricing'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

/** Live counts for the hero stat strip - never hardcoded. */
async function getCounts(): Promise<{ courses: number; opleiders: number; merken: number }> {
  try {
    const payload = await getPayload({ config: await config })
    const [courses, trainers, brands] = await Promise.all([
      payload.count({ collection: 'courses' as never, where: { status: { equals: 'published' } } as never }),
      payload.count({ collection: 'trainers' as never }),
      payload.count({ collection: 'brands' as never }),
    ])
    return { courses: courses.totalDocs, opleiders: trainers.totalDocs, merken: brands.totalDocs }
  } catch {
    return { courses: 0, opleiders: 0, merken: 0 }
  }
}

const DEFAULT_DARK_CARDS = [
  { icon: 'ti ti-sparkles', title: 'Overzichtelijk, niet algoritmisch', body: 'Vergelijk opleiders en opleidingen op basis van de informatie die zij zelf beschikbaar stellen.' },
  { icon: 'ti ti-eye-check', title: 'Transparant', body: 'Prijs, duur, certificaatinformatie en locatie staan duidelijk vermeld wanneer de aanbieder die informatie opgeeft.' },
  { icon: 'ti ti-calendar-event', title: 'Avond, weekend of online', body: 'Vind het lesmoment dat bij jouw agenda past, zonder tussenpersoon.' },
]
const cleanTrustCopy = (value: string) =>
  value
    .replace(/geverifieerde, professionele/gi, 'professionele')
    .replace(/geverifieerde opleiders/gi, 'Professionele opleiders')
    .replace(/geverifieerde aanbieders/gi, 'Professionele aanbieders')
    .replace(/enkel handmatig gecontroleerde academies\.?/gi, 'Vergelijk de informatie die aanbieders zelf publiceren.')
    .replace(/handmatig gecontroleerde academies/gi, 'opleiders met heldere profielinformatie')

async function getHomepage(): Promise<Record<string, any> | null> {
  try {
    const payload = await getPayload({ config: await config })
    return (await payload.findGlobal({ slug: 'homepage' as never, depth: 1 })) as Record<string, any>
  } catch {
    return null
  }
}

export default async function HomePage() {
  const currentUser = await getCurrentUser()
  const hp = (await getHomepage()) || {}
  const hero = hp.hero || {}
  const why = hp.why || {}

  const darkCards = (Array.isArray(why.cards) && why.cards.length ? why.cards : DEFAULT_DARK_CARDS).map(
    (card: { icon?: string; title: string; body?: string }) => ({
      ...card,
      title: cleanTrustCopy(card.title),
      body: card.body ? cleanTrustCopy(card.body) : card.body,
    }),
  )
  // Stat strip is fully dynamic (live counts), never hardcoded. Third stat = brands.
  const counts = await getCounts()
  const stats = [
    { target: counts.courses, suffix: '', label: 'Opleidingen' },
    { target: counts.opleiders, suffix: '', label: 'Opleiders' },
    { target: counts.merken, suffix: '', label: 'Merken' },
  ]
  const faqItems = Array.isArray(hp.faq) && hp.faq.length
    ? hp.faq.map((f: { question: string; answer: string }) => ({ q: cleanTrustCopy(f.question), a: cleanTrustCopy(f.answer) }))
    : FAQ_HOME

  const searchOptions = await getCourseFilterOptions()
  const { brandCourses, opleiderCourses } = await getHomepageSections()
  const pricingCatalog = await getPricingCatalog()

  return (
    <>
      <SiteNav user={currentUser ? { name: currentUser.name, role: currentUser.role } : null} />

      {/* HERO */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          background:
            'radial-gradient(120% 90% at 15% 0%, rgba(196,121,90,0.10), rgba(245,240,234,0) 55%), radial-gradient(120% 90% at 85% 5%, rgba(26,46,37,0.08), rgba(245,240,234,0) 55%), #F5F0EA',
        }}
      >
        <div className="bl-container bl-home-hero-inner" style={{ paddingTop: 88, paddingBottom: 80 }}>
          <div className="bl-hero-split">
            {/* Left column */}
            <div style={{ maxWidth: 600 }}>
              <Eyebrow>Professionele wellnessopleiding · België</Eyebrow>
              <h1 className="bl-home-hero-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 64, lineHeight: 1.04, letterSpacing: '-0.02em', color: 'var(--text-brand)', margin: '20px 0 0', textWrap: 'balance' }}>
                {hero.title || 'De Europese standaard voor'}{' '}
                <span style={{ color: 'var(--blissify-terracotta)' }}>
                  {hero.highlight || 'wellnessopleiding.'}
                </span>
              </h1>
              <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 18, lineHeight: 1.7, color: 'var(--text-body)', margin: '22px 0 0' }}>
                {hero.subtitle ||
                  'Vind professionele opleidingen in massage, nagelstyliste, reflexologie, yoga, voeding en beauty, overzichtelijk samengebracht door Blissify.'}
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 30, flexWrap: 'wrap' }}>
                <ButtonLink href={hero.primaryCtaUrl || '/opleidingen'} variant="primary">
                  {hero.primaryCtaLabel || 'Vind een opleiding'}
                </ButtonLink>
                <ButtonLink href={hero.secondaryCtaUrl || '/voor-aanbieders'} variant="ghost">
                  {hero.secondaryCtaLabel || 'Publiceer jouw opleiding'}
                </ButtonLink>
                <ButtonLink href={hero.tertiaryCtaUrl || '/registreren?type=brand'} variant="ghost">
                  {hero.tertiaryCtaLabel || 'Zet je merk in de kijker'}
                </ButtonLink>
              </div>
            </div>

            {/* Right column */}
            <SearchCard categories={searchOptions.categories} cities={searchOptions.cities} counts={counts} />
          </div>
        </div>
      </section>

      {/* FEATURED COURSES FROM MERKEN & LEVERANCIERS */}
      {brandCourses.length ? (
        <section style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)' }}>
          <div className="bl-container bl-home-section" style={{ paddingTop: 96, paddingBottom: 96 }}>
            <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 48px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 44, lineHeight: 1.08, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: 0, textWrap: 'balance' }}>
                Uitgelicht van Merken & Leveranciers
              </h2>
              <a href="/merken" className="bl-textlink" style={{ display: 'inline-block', marginTop: 16 }}>Bekijk alle merken</a>
            </div>
            <div className="bl-grid-3">
              {brandCourses.slice(0, 6).map((c) => (
                <CourseCard key={c.slug} {...c} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* FEATURED COURSES FROM INDIVIDUAL OPLEIDERS
          Kept directly under the Merken & Leveranciers featured block so both
          "uitgelicht" sections align under each other (client feedback #2a: the
          green band that used to sit between them was moved below). */}
      {opleiderCourses.length ? (
        <section>
          <div className="bl-container bl-home-section" style={{ paddingTop: 96, paddingBottom: 96 }}>
            <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 48px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 44, lineHeight: 1.08, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: 0, textWrap: 'balance' }}>
                Uitgelichte opleidingen van opleiders
              </h2>
              <a href="/opleiders" className="bl-textlink" style={{ display: 'inline-block', marginTop: 16 }}>Bekijk alle opleiders</a>
            </div>
            <div className="bl-grid-3">
              {opleiderCourses.slice(0, 6).map((c) => (
                <CourseCard key={c.slug} {...c} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* DARK "WAAROM" - relocated to below both featured blocks (feedback #2a) */}
      <section style={{ background: 'var(--surface-dark)' }}>
        <div className="bl-container bl-home-section" style={{ paddingTop: 120, paddingBottom: 128 }}>
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 56px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 48, lineHeight: 1.08, letterSpacing: '-0.01em', color: 'var(--blissify-chalk)', margin: 0, textWrap: 'balance' }}>
              {why.title || 'Gebouwd voor de professional, niet voor de hype.'}
            </h2>
          </div>
          <div className="bl-cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {darkCards.map((d: { icon?: string; title: string; body?: string }) => (
              <div key={d.title} style={{ border: '0.5px solid rgba(245,240,234,0.12)', borderRadius: 'var(--radius-md)', padding: 32 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--blissify-chalk)', lineHeight: 1.2, marginBottom: 12 }}>{d.title}</div>
                <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 15, lineHeight: 1.65, color: 'rgba(245,240,234,0.72)', margin: 0 }}>{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOE WERKT BLISSIFY - two audiences (feedback #2b: also explain how
          Blissify works for merken & leveranciers, not only opleiders) */}
      <section style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)' }}>
        <div className="bl-container bl-home-section" style={{ paddingTop: 96, paddingBottom: 96 }}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 44, lineHeight: 1.08, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: 0, textWrap: 'balance' }}>
              Hoe werkt Blissify?
            </h2>
            <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', margin: '16px 0 0' }}>
              Of je nu opleidingen aanbiedt of als merk of leverancier de sector bereikt: Blissify brengt je op één plek samen met professionals die actief op zoek zijn.
            </p>
          </div>
          <div className="bl-faq-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'stretch' }}>
            {[
              {
                eyebrow: 'Voor opleiders',
                title: 'Toon en vul je opleidingen',
                points: [
                  'Maak een professioneel opleiderprofiel en publiceer je opleidingen met prijs, data, locatie en lesvorm.',
                  'Word gevonden via zoeken en filters op categorie, locatie en lesmoment.',
                  'Ontvang rechtstreeks informatieaanvragen en inschrijvingen, zonder tussenpersoon.',
                ],
                cta: { href: '/voor-aanbieders', label: 'Publiceer jouw opleiding' },
              },
              {
                eyebrow: 'Voor merken & leveranciers',
                title: 'Zet je merk in de kijker',
                points: [
                  'Bouw een merkpagina met logo, cover, foto’s, omschrijving, herkomst en socials.',
                  'Kies de categorieën waaronder je zichtbaar bent en verschijn in de merken- & leveranciersfilters.',
                  'Bereik opleiders en professionals die op zoek zijn naar producten, apparatuur en opleidingen — en bied afhankelijk van je abonnement zelf opleidingen aan.',
                ],
                cta: { href: '/registreren?type=brand', label: 'Zet je merk in de kijker' },
              },
            ].map((col) => (
              <div key={col.eyebrow} style={{ display: 'flex', flexDirection: 'column', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 32, background: 'var(--surface-page, transparent)' }}>
                <Eyebrow>{col.eyebrow}</Eyebrow>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 26, color: 'var(--text-brand)', lineHeight: 1.15, margin: '10px 0 18px' }}>{col.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  {col.points.map((p) => (
                    <div key={p} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 15, lineHeight: 1.6, color: 'var(--text-body)' }}>
                      <i className="ti ti-check" style={{ fontSize: 17, color: 'var(--text-accent)', flex: 'none', marginTop: 1 }} />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 'auto' }}>
                  <ButtonLink href={col.cta.href} variant="ghost">{col.cta.label}</ButtonLink>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo-tiles section removed (feedback #2): the single "Hoe werkt
          Blissify?" section above now covers both opleiders and merken &
          leveranciers, so the separate opleider/student-journey tiles were a
          duplicate "how it works" and are dropped. */}

      {/* STATS */}
      <section style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)', borderBottom: '0.5px solid var(--border-hairline)' }}>
        <div className="bl-container bl-home-stats-heading" style={{ paddingTop: 88 }}>
          <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 44, lineHeight: 1.08, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: 0 }}>
              Blissify in cijfers
            </h2>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', margin: '14px 0 0' }}>
              Een groeiend overzicht van opleidingen, opleiders, merken en leveranciers.
            </p>
          </div>
        </div>
        <StatCounters stats={stats} />
      </section>

      {/* PRICING */}
      <section>
        <div className="bl-container bl-home-section" style={{ paddingTop: 104, paddingBottom: 88 }}>
        <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 48px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 44, lineHeight: 1.08, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: 0 }}>Een formule voor iedere aanbieder.</h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 16, color: 'var(--text-body)', margin: '14px 0 0' }}>Vergelijk abonnementen voor opleiders, merken en leveranciers.</p>
        </div>
        <PricingPlans catalog={{ opleiders: pricingCatalog.opleiders, brands: pricingCatalog.brands }} billing={pricingCatalog.billing} allowAudienceSwitch compact />
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)' }}>
        <div className="bl-container bl-home-section" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <div className="bl-faq-split" style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 56, alignItems: 'start' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 44, lineHeight: 1.05, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: 0, textWrap: 'balance' }}>
              Veelgestelde vragen
            </h2>
            <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-body)', margin: '18px 0 24px' }}>
              Korte antwoorden op de belangrijkste vragen over Blissify en het platform.
            </p>
            <ButtonLink href="/over-ons" variant="primary">
              Meer weten
            </ButtonLink>
          </div>
          <Faq items={faqItems} variant="card" defaultOpen={0} />
        </div>
        </div>
      </section>

      <Marquee />
      <SiteFooter />
    </>
  )
}
