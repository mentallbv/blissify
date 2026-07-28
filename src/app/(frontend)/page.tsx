import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { SiteNav } from '@/components/site/SiteNav'
import { SiteFooter, Marquee } from '@/components/site/SiteFooter'
import { StatCounters } from '@/components/site/StatCounters'
import { Faq } from '@/components/site/Faq'
import { SearchCard } from '@/components/site/SearchCard'
import { HomeCategoryExplorer } from '@/components/site/HomeCategoryExplorer'
import { MerkenSearchBlock } from '@/components/site/MerkenSearchBlock'
import { Eyebrow, ButtonLink, CourseCard } from '@/components/ui'
import { getPricing, getCourseFilterOptions, getHomepageSections, getMerkenFacets } from '@/lib/data'
import { FAQ_HOME } from '@/lib/pricing'

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
  { icon: 'ti ti-sparkles', title: 'Curatorisch, niet algoritmisch', body: 'Een zorgvuldig samengesteld overzicht van opleiders en opleidingen. Een Blissify-vermelding betekent iets.' },
  { icon: 'ti ti-eye-check', title: 'Transparant', body: 'Prijs, duur, erkenning en locatie staan altijd vermeld. Nooit verborgen.' },
  { icon: 'ti ti-calendar-event', title: 'Avond, weekend of online', body: 'Vind het lesmoment dat bij jouw agenda past, zonder tussenpersoon.' },
]
const DEFAULT_TILES = [
  { title: 'Zoek & vergelijk', body: 'Filter op categorie, locatie, lesmoment en erkenning.', image: null as string | null },
  { title: 'Ontdek opleiders', body: 'Een gecureerd overzicht van opleiders en merken.', image: null as string | null },
  { title: 'Schrijf je in', body: 'Vraag rechtstreeks informatie aan.', image: null as string | null },
]
const mediaUrl = (m: unknown): string | null => (m && typeof m === 'object' && (m as { url?: string }).url ? (m as { url: string }).url : null)

async function getHomepage(): Promise<Record<string, any> | null> {
  try {
    const payload = await getPayload({ config: await config })
    return (await payload.findGlobal({ slug: 'homepage' as never, depth: 1 })) as Record<string, any>
  } catch {
    return null
  }
}

export default async function HomePage() {
  const hp = (await getHomepage()) || {}
  const hero = hp.hero || {}
  const why = hp.why || {}
  const photo = hp.photoSection || {}

  const darkCards = Array.isArray(why.cards) && why.cards.length ? why.cards : DEFAULT_DARK_CARDS
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
  const faqItems = Array.isArray(hp.faq) && hp.faq.length ? hp.faq.map((f: { question: string; answer: string }) => ({ q: f.question, a: f.answer })) : FAQ_HOME

  const searchOptions = await getCourseFilterOptions()
  const { brandCourses, opleiderCourses, categorySections } = await getHomepageSections()
  const merkenFacets = await getMerkenFacets()
  const pricingData = await getPricing()
  const pricing = pricingData.intro
  const tiers = pricingData.tiers

  return (
    <>
      <SiteNav />

      {/* HERO */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          background:
            'radial-gradient(120% 90% at 15% 0%, rgba(196,121,90,0.10), rgba(245,240,234,0) 55%), radial-gradient(120% 90% at 85% 5%, rgba(26,46,37,0.08), rgba(245,240,234,0) 55%), #F5F0EA',
        }}
      >
        <div className="bl-container" style={{ paddingTop: 88, paddingBottom: 80 }}>
          <div className="bl-hero-split">
            {/* Left column */}
            <div style={{ maxWidth: 600 }}>
              <Eyebrow>Professionele wellnessopleiding · België</Eyebrow>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 64, lineHeight: 1.04, letterSpacing: '-0.02em', color: 'var(--text-brand)', margin: '20px 0 0', textWrap: 'balance' }}>
                {hero.title || 'De Europese standaard voor'}{' '}
                <span style={{ color: 'var(--blissify-terracotta)' }}>
                  {hero.highlight || 'wellnessopleiding.'}
                </span>
              </h1>
              <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 18, lineHeight: 1.7, color: 'var(--text-body)', margin: '22px 0 0' }}>
                {hero.subtitle ||
                  'Vind erkende, professionele opleidingen in massage, nagelstyliste, reflexologie, yoga, voeding en beauty, zorgvuldig samengebracht door Blissify.'}
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

      {/* B6 - ONTDEK MERKEN & LEVERANCIERS */}
      <section>
        <div className="bl-container" style={{ paddingTop: 8, paddingBottom: 88 }}>
          <MerkenSearchBlock facets={merkenFacets} />
        </div>
      </section>

      {/* DARK "WAAROM" */}
      <section style={{ background: 'var(--surface-dark)' }}>
        <div className="bl-container" style={{ paddingTop: 120, paddingBottom: 128 }}>
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

      {/* PHOTO FEATURE TILES */}
      <section>
        <div className="bl-container" style={{ paddingTop: 96, paddingBottom: 112 }}>
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

      {/* B3 - COURSES BY CATEGORY (tier-gated exposure pool) */}
      {categorySections.length ? (
        <section>
          <div className="bl-container" style={{ paddingTop: 96, paddingBottom: 40 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 40, lineHeight: 1.08, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: '0 0 24px', textWrap: 'balance' }}>
              Opleidingen per categorie
            </h2>
            <HomeCategoryExplorer sections={categorySections} />
          </div>
        </section>
      ) : null}

      {/* B4 - FEATURED MERKEN & LEVERANCIERS COURSES */}
      {brandCourses.length ? (
        <section style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)' }}>
          <div className="bl-container" style={{ paddingTop: 96, paddingBottom: 96 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 40, lineHeight: 1.08, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: 0 }}>
                Uitgelicht van Merken & Leveranciers
              </h2>
              <a href="/merken" className="bl-textlink">Bekijk alle merken</a>
            </div>
            <div className="bl-grid-3">
              {brandCourses.slice(0, 6).map((c) => (
                <CourseCard key={c.slug} {...c} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* B5 - FEATURED OPLEIDER COURSES (Premium only) */}
      {opleiderCourses.length ? (
        <section>
          <div className="bl-container" style={{ paddingTop: 96, paddingBottom: 96 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 40, lineHeight: 1.08, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: 0 }}>
                Uitgelichte opleidingen van opleiders
              </h2>
              <a href="/opleiders" className="bl-textlink">Bekijk alle opleiders</a>
            </div>
            <div className="bl-grid-3">
              {opleiderCourses.slice(0, 6).map((c) => (
                <CourseCard key={c.slug} {...c} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* STATS */}
      <section style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)', borderBottom: '0.5px solid var(--border-hairline)' }}>
        <StatCounters stats={stats} />
      </section>

      {/* PRICING */}
      <section>
        <div className="bl-container" style={{ paddingTop: 104, paddingBottom: 88 }}>
        <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 48px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 44, lineHeight: 1.08, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: 0 }}>{pricing.title || 'Eenvoudige, eerlijke prijzen.'}</h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 16, color: 'var(--text-body)', margin: '14px 0 0' }}>{pricing.subtitle || 'Eén jaarlijks abonnement. Directe leads. Geen commissie.'}</p>
        </div>
        <div className="bl-cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'start' }}>
          {tiers.map((t: { key: string; name: string; price: string; period: string; desc: string; recommended: boolean; features: string[] }) => (
            <div key={t.key} style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 14, color: 'var(--text-strong)' }}>{t.name}</span>
                {t.recommended ? (
                  <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 'var(--type-micro)', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff', background: 'var(--blissify-terracotta)', borderRadius: 'var(--radius-pill)', padding: '3px 10px' }}>
                    Aanbevolen
                  </span>
                ) : null}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '14px 0 4px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 52, lineHeight: 1, letterSpacing: '-0.01em', color: 'var(--text-brand)' }}>{t.price}</span>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 14, color: 'var(--text-meta)' }}>{t.period || '/jaar'}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 14, lineHeight: 1.6, color: 'var(--text-body)', margin: '0 0 24px', minHeight: 42 }}>{t.desc}</p>
              <ButtonLink href="/prijzen" variant={t.recommended ? 'accent' : 'primary'} fullWidth>
                Kies {t.name}
              </ButtonLink>
              <div style={{ height: '0.5px', background: 'var(--border-hairline)', margin: '24px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {t.features.slice(0, 3).map((f) => (
                  <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 14, color: 'var(--text-body)' }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--blissify-forest)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                      <i className="ti ti-check" style={{ fontSize: 13, color: 'var(--blissify-chalk)' }} />
                    </span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)' }}>
        <div className="bl-container" style={{ paddingTop: 96, paddingBottom: 96 }}>
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
