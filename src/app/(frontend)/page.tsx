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
import { publicMediaUrl } from '@/lib/media'

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
const DEFAULT_TILES = [
  { title: 'Zoek & vergelijk', body: 'Filter op categorie, locatie, lesmoment en certificaatinformatie.', image: null as string | null },
  { title: 'Ontdek opleiders', body: 'Een helder overzicht van opleiders en merken.', image: null as string | null },
  { title: 'Schrijf je in', body: 'Vraag rechtstreeks informatie aan.', image: null as string | null },
]
const mediaUrl = (m: unknown): string | null => (m && typeof m === 'object' ? publicMediaUrl(m as { filename?: string | null; url?: string | null }) : null)
const cleanTrustCopy = (value: string) =>
  value
    .replace(/geverifieerde, professionele/gi, 'professionele')
    .replace(/geverifieerde opleiders/gi, 'Professionele opleiders')
    .replace(/geverifieerde aanbieders/gi, 'Professionele aanbieders')

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
  const photo = hp.photoSection || {}

  const darkCards = (Array.isArray(why.cards) && why.cards.length ? why.cards : DEFAULT_DARK_CARDS).map(
    (card: { icon?: string; title: string; body?: string }) => ({
      ...card,
      title: cleanTrustCopy(card.title),
      body: card.body ? cleanTrustCopy(card.body) : card.body,
    }),
  )
  const tiles = Array.isArray(photo.tiles) && photo.tiles.length
    ? photo.tiles.map((t: Record<string, unknown>) => ({ title: t.title, body: t.body, image: mediaUrl(t.image) }))
    : DEFAULT_TILES
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

      {/* DARK "WAAROM" */}
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

      {/* FEATURED COURSES FROM INDIVIDUAL OPLEIDERS */}
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

      {/* PHOTO FEATURE TILES */}
      <section>
        <div className="bl-container bl-home-section" style={{ paddingTop: 96, paddingBottom: 112 }}>
        <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 48px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 44, lineHeight: 1.08, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: 0, textWrap: 'balance' }}>
            {photo.title || 'Ontdek hoe Blissify werkt'}
          </h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', margin: '16px 0 0' }}>
            {photo.subtitle || 'Van zoeken tot inschrijven: een helder, professioneel traject.'}
          </p>
        </div>
        <div className="bl-photo-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: 16 }}>
          {tiles.map((t: { title: string; body?: string; image?: string | null }) => (
            <div
              className="bl-home-photo-tile"
              key={t.title}
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                height: 440,
                background: 'var(--surface-dark)',
                backgroundImage: t.image ? `url(${t.image})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', padding: 24, background: 'linear-gradient(0deg,rgba(26,46,37,0.78),rgba(26,46,37,0))' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--blissify-chalk)', lineHeight: 1.15 }}>{t.title}</div>
                <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 'var(--type-sm)', color: 'rgba(245,240,234,0.8)', margin: '6px 0 0' }}>{t.body}</p>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>

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
