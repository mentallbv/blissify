import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { SiteNav } from '@/components/site/SiteNav'
import { SiteFooter, Marquee } from '@/components/site/SiteFooter'
import { StatCounters } from '@/components/site/StatCounters'
import { Faq } from '@/components/site/Faq'
import { CourseCard, ButtonLink } from '@/components/ui'
import { getCourseCards, getPricing } from '@/lib/data'
import { FAQ_HOME } from '@/lib/pricing'

export const dynamic = 'force-dynamic'

const DEFAULT_DARK_CARDS = [
  { icon: 'ti ti-rosette-discount-check', title: 'Curatorisch, niet algoritmisch', body: 'Elke opleider wordt handmatig geverifieerd. Een Blissify-vermelding betekent iets.' },
  { icon: 'ti ti-eye-check', title: 'Transparant', body: 'Prijs, duur, erkenning en locatie staan altijd vermeld. Nooit verborgen.' },
  { icon: 'ti ti-calendar-event', title: 'Avond, weekend of online', body: 'Vind het lesmoment dat bij jouw agenda past, zonder tussenpersoon.' },
]
const DEFAULT_TILES = [
  { title: 'Zoek & vergelijk', body: 'Filter op categorie, locatie, lesmoment en erkenning.', image: null as string | null },
  { title: 'Geverifieerde opleiders', body: 'Enkel handmatig gecontroleerde academies.', image: null as string | null },
  { title: 'Schrijf je in', body: 'Vraag rechtstreeks informatie aan.', image: null as string | null },
]
const DEFAULT_STATS = [
  { target: 847, suffix: '', label: 'Opleidingen' },
  { target: 124, suffix: '', label: 'Geverifieerde opleiders' },
  { target: 3, suffix: '', label: 'Landen' },
]

const cardWrap: React.CSSProperties = { position: 'absolute', width: 300 }
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
  const { cards } = await getCourseCards({ limit: 3 })
  const hp = (await getHomepage()) || {}
  const hero = hp.hero || {}
  const why = hp.why || {}
  const photo = hp.photoSection || {}

  const darkCards = Array.isArray(why.cards) && why.cards.length ? why.cards : DEFAULT_DARK_CARDS
  const tiles = Array.isArray(photo.tiles) && photo.tiles.length
    ? photo.tiles.map((t: Record<string, unknown>) => ({ title: t.title, body: t.body, image: mediaUrl(t.image) }))
    : DEFAULT_TILES
  const stats = Array.isArray(hp.stats) && hp.stats.length
    ? hp.stats.map((s: { value: string; label: string }) => {
        const target = parseInt(String(s.value).replace(/\D/g, ''), 10) || 0
        const suffix = String(s.value).replace(/[0-9.\s]/g, '')
        return { target, suffix, label: s.label }
      })
    : DEFAULT_STATS
  const faqItems = Array.isArray(hp.faq) && hp.faq.length ? hp.faq.map((f: { question: string; answer: string }) => ({ q: f.question, a: f.answer })) : FAQ_HOME

  const pricingData = await getPricing()
  const pricing = pricingData.intro
  const tiers = pricingData.tiers

  const tilt = [
    { ...cardWrap, left: '7%', top: 90, transform: 'rotate(-9deg)', transformOrigin: 'bottom center' as const },
    { position: 'absolute' as const, left: '50%', top: 30, width: 320, marginLeft: -160, zIndex: 2 },
    { ...cardWrap, right: '7%', top: 90, transform: 'rotate(9deg)', transformOrigin: 'bottom center' as const },
  ]

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
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '96px 32px 0', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--surface-card)',
              border: '0.5px solid var(--border-hairline)',
              borderRadius: 40,
              padding: '6px 6px 6px 14px',
              fontFamily: 'var(--font-ui)',
              fontWeight: 'var(--fw-ui-medium)',
              fontSize: 12,
              color: 'var(--text-body)',
              marginBottom: 28,
            }}
          >
            {hero.badge || '847 opleidingen in België'}
            <span style={{ background: 'var(--blissify-forest)', color: 'var(--blissify-chalk)', borderRadius: 40, padding: '3px 9px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Nieuw
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 74, lineHeight: 1.0, letterSpacing: '-0.02em', color: 'var(--text-brand)', margin: 0, textWrap: 'balance' }}>
            {hero.title || 'De Europese standaard voor'}{' '}
            <span style={{ background: 'linear-gradient(95deg,var(--blissify-terracotta),var(--blissify-forest))', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'var(--blissify-terracotta)' }}>
              {hero.highlight || 'wellnessopleiding.'}
            </span>
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 18, lineHeight: 1.7, color: 'var(--text-body)', maxWidth: 560, margin: '24px auto 0' }}>
            {hero.subtitle ||
              'Vind erkende, professionele opleidingen in massage, nagelstyliste, reflexologie, yoga, voeding en beauty, zorgvuldig samengebracht door Blissify.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32 }}>
            <ButtonLink href={hero.primaryCtaUrl || '/opleidingen'} variant="primary" size="lg">
              {hero.primaryCtaLabel || 'Vind een opleiding'}
            </ButtonLink>
            <ButtonLink href={hero.secondaryCtaUrl || '/voor-aanbieders'} variant="ghost" size="lg">
              {hero.secondaryCtaLabel || 'Publiceer jouw opleiding'}
            </ButtonLink>
          </div>
        </div>

        {/* tilted cards */}
        <div className="bl-hero-cards" style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 32px 0', height: 340, position: 'relative' }}>
          {cards.slice(0, 3).map((c, i) => (
            <div key={c.slug} style={tilt[i]}>
              <CourseCard {...c} />
            </div>
          ))}
        </div>
      </section>

      {/* TRUST STRIP */}
      <section style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)', borderBottom: '0.5px solid var(--border-hairline)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 32px', textAlign: 'center', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-meta)' }}>
          {hp.trustText || 'Vertrouwd door 124 geverifieerde opleiders in heel België'}
        </div>
      </section>

      {/* DARK "WAAROM" */}
      <section style={{ background: 'var(--surface-dark)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '104px 32px' }}>
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 56px' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-accent)' }}>{why.eyebrow || 'Waarom Blissify'}</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 48, lineHeight: 1.08, letterSpacing: '-0.01em', color: 'var(--blissify-chalk)', margin: '14px 0 0', textWrap: 'balance' }}>
              {why.title || 'Gebouwd voor de professional, niet voor de hype.'}
            </h2>
          </div>
          <div className="bl-cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {darkCards.map((d: { icon?: string; title: string; body?: string }) => (
              <div key={d.title} style={{ background: 'rgba(245,240,234,0.05)', border: '0.5px solid rgba(245,240,234,0.12)', borderRadius: 14, padding: 32, backdropFilter: 'blur(6px)' }}>
                <span style={{ display: 'inline-flex', width: 48, height: 48, borderRadius: 12, background: 'rgba(196,121,90,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <i className={d.icon || 'ti ti-circle-check'} style={{ fontSize: 24, color: 'var(--blissify-terracotta)' }} />
                </span>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--blissify-chalk)', lineHeight: 1.2, marginBottom: 10 }}>{d.title}</div>
                <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 15, lineHeight: 1.65, color: 'rgba(245,240,234,0.7)', margin: 0 }}>{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PHOTO FEATURE TILES */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '104px 32px' }}>
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
                borderRadius: 14,
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
                <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 13, color: 'rgba(245,240,234,0.8)', margin: '6px 0 0' }}>{t.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)', borderBottom: '0.5px solid var(--border-hairline)' }}>
        <StatCounters stats={stats} />
      </section>

      {/* PRICING */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '104px 32px 88px' }}>
        <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 48px' }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-accent)' }}>{pricing.eyebrow || 'Prijzen'}</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 44, lineHeight: 1.08, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: '14px 0 0' }}>{pricing.title || 'Eenvoudige, eerlijke prijzen.'}</h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 16, color: 'var(--text-body)', margin: '14px 0 0' }}>{pricing.subtitle || 'Eén jaarlijks abonnement. Directe leads. Geen commissie.'}</p>
        </div>
        <div className="bl-cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'start' }}>
          {tiers.map((t: { key: string; name: string; price: string; period: string; desc: string; recommended: boolean; features: string[] }) => (
            <div key={t.key} style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 16, padding: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 14, color: 'var(--text-strong)' }}>{t.name}</span>
                {t.recommended ? (
                  <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff', background: 'var(--blissify-terracotta)', borderRadius: 40, padding: '3px 10px' }}>
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
              <div style={{ height: 2, borderRadius: 2, background: 'linear-gradient(90deg,rgba(196,121,90,0.35),rgba(26,46,37,0.35))', margin: '24px 0' }} />
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
      </section>

      {/* FAQ */}
      <section style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)' }}>
        <div className="bl-faq-split" style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 32px', display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 56, alignItems: 'start' }}>
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
      </section>

      <Marquee />
      <SiteFooter />
    </>
  )
}
