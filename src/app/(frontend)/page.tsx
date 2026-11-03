import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { SiteNav } from '@/components/site/SiteNav'
import { SiteFooter } from '@/components/site/SiteFooter'
import { Faq } from '@/components/site/Faq'
import { SearchCard } from '@/components/site/SearchCard'
import { PricingPlans } from '@/components/site/PricingPlans'
import { Eyebrow, ButtonLink, CourseCard } from '@/components/ui'
import { getPricingCatalog, getCourseFilterOptions, getHomepageSections, getBrandCards } from '@/lib/data'
import { BrandCard } from '@/components/site/BrandCard'
import { FAQ_HOME } from '@/lib/pricing'
import { getCurrentUser } from '@/lib/session'
import { VacancyTile } from '@/components/site/VacancyTile'
import { getHomepageVacancies } from '@/lib/vacancies'
import { WorkspaceCard } from '@/components/site/WorkspaceCard'
import { getHomepageWorkspaces } from '@/lib/workspaces'
import { SITE_URL } from '@/lib/email'
import { RevealOnScroll } from '@/components/site/RevealOnScroll'
import { CtaPanel } from '@/components/site/CtaPanel'

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

// Copy 10/2026 pillars ("Curatorisch, niet algoritmisch" replaced, open point 3).
const DEFAULT_DARK_CARDS = [
  { icon: 'ti ti-user-check', title: 'Rechtstreeks van de aanbieder', body: 'Elk profiel wordt door de aanbieder zelf ingevuld. Jij kiest met de filters wat je ziet en neemt rechtstreeks contact op.' },
  { icon: 'ti ti-eye-check', title: 'Transparant', body: 'Prijs, duur, locatie en voorwaarden staan duidelijk vermeld. Nooit verborgen.' },
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
  // Live counts for the search card.
  const counts = await getCounts()
  const faqItems = Array.isArray(hp.faq) && hp.faq.length
    ? hp.faq.map((f: { question: string; answer: string }) => ({ q: cleanTrustCopy(f.question), a: cleanTrustCopy(f.answer) }))
    : FAQ_HOME

  const searchOptions = await getCourseFilterOptions()
  const [{ brandCourses, opleiderCourses }, featuredVacancies, featuredWorkspaces, brandRes] = await Promise.all([
    getHomepageSections(),
    getHomepageVacancies(),
    getHomepageWorkspaces(),
    getBrandCards({}),
  ])
  const pricingCatalog = await getPricingCatalog()
  // "Opleidingen in de kijker": trainer and brand courses together, alternating.
  const featuredCourses = Array.from({ length: Math.max(opleiderCourses.length, brandCourses.length) }).flatMap((_, i) => [opleiderCourses[i], brandCourses[i]]).filter(Boolean).slice(0, 6)
  // "Merken & leveranciers in de kijker": Ultimate brands (homepage rotation perk), shuffled.
  const featuredBrands = brandRes.cards.filter((b) => b.hasPremiumBadge).sort(() => Math.random() - 0.5).slice(0, 3)

  const h2: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 'clamp(32px, 4vw, 44px)', lineHeight: 1.08, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: 0, textWrap: 'balance' }
  const lead: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', margin: '14px 0 0' }
  const Featured = ({ title, text, href, link, children, tinted = false }: { title: string; text: string; href: string; link: string; children: React.ReactNode; tinted?: boolean }) => (
    <section style={tinted ? { background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)' } : undefined}>
      <div className="bl-container bl-home-section" data-reveal style={{ paddingTop: 88, paddingBottom: 88 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap', marginBottom: 36 }}>
          <div style={{ maxWidth: 640 }}>
            <h2 style={h2}>{title}</h2>
            <p style={lead}>{text}</p>
          </div>
          <a href={href} className="bl-textlink">{link}</a>
        </div>
        {children}
      </div>
    </section>
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            { '@context': 'https://schema.org', '@type': 'Organization', name: 'Blissify', url: SITE_URL, logo: `${SITE_URL}/brand/logo-blauw.svg`, areaServed: ['BE', 'NL'] },
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Blissify',
              url: SITE_URL,
              inLanguage: 'nl-BE',
              potentialAction: { '@type': 'SearchAction', target: `${SITE_URL}/opleidingen?keyword={search_term_string}`, 'query-input': 'required name=search_term_string' },
            },
            { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqItems.map((f: { q: string; a: string }) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
          ]),
        }}
      />
      <RevealOnScroll />
      <SiteNav user={currentUser ? { name: currentUser.name, role: currentUser.role } : null} />

      {/* HERO (copy 10/2026) */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          background:
            'transparent',
        }}
      >
        <div className="bl-container bl-home-hero-inner" style={{ paddingTop: 80, paddingBottom: 96 }}>
          <div className="bl-hero-split">
            <div className="bl-hero-copy" style={{ maxWidth: 600 }}>
              <Eyebrow>Hét platform voor beauty &amp; wellness · België &amp; Nederland</Eyebrow>
              <h1 className="bl-home-hero-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 64, lineHeight: 1.04, letterSpacing: '-0.02em', color: 'var(--text-brand)', margin: '20px 0 0', textWrap: 'balance' }}>
                {hero.title || 'Alles voor jouw groei in'}{' '}
                <span className="bl-hero-accent">{hero.highlight || 'beauty & wellness.'}</span>
              </h1>
              <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 18, lineHeight: 1.7, color: 'var(--text-body)', margin: '22px 0 0' }}>
                {hero.subtitle || 'Vind opleidingen en cursussen, merken en leveranciers, werkruimtes en vacatures voor beauty- en wellnessprofessionals. Alles overzichtelijk samengebracht op één platform, in België en Nederland.'}
              </p>
              <div className="bl-hero-chips">
                <a className="bl-hero-chip" href="/opleidingen"><i className="ti ti-school" aria-hidden="true" />Vind een opleiding</a>
                <a className="bl-hero-chip" href="/merken-leveranciers"><i className="ti ti-sparkles" aria-hidden="true" />Vind een merk</a>
                <a className="bl-hero-chip" href="/werkruimtes"><i className="ti ti-armchair" aria-hidden="true" />Vind een werkruimte</a>
                <a className="bl-hero-chip" href="/vacatures"><i className="ti ti-briefcase" aria-hidden="true" />Vind een vacature</a>
              </div>
            </div>
            <div className="bl-hero-card">
              <figure className="bl-hero-peek bl-hero-peek--top" aria-hidden="true"><img src="/images/home/facial.jpg" alt="" fetchPriority="high" /></figure>
              <figure className="bl-hero-peek bl-hero-peek--bottom" aria-hidden="true"><img src="/images/home/nails.jpg" alt="" /></figure>
              <SearchCard categories={searchOptions.categories} cities={searchOptions.citiesByCountry} counts={counts} />
            </div>
          </div>
        </div>
      </section>

      {/* SEO block under the hero */}
      <section style={{ background: 'var(--surface-card)' }}>
        <div className="bl-container bl-home-section" data-reveal style={{ paddingTop: 104, paddingBottom: 104 }}>
          <div className="bl-faq-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
            <div>
              <h2 style={{ ...h2, fontSize: 'clamp(30px, 3.6vw, 42px)' }}>Opleidingen, vacatures en werkruimtes voor <span className="bl-hero-accent">beauty- en wellnessprofessionals</span></h2>
              <p style={{ ...lead, fontSize: 16, marginTop: 22 }}>
                Blissify is het B2B-platform waar beauty- en wellnessprofessionals in België en Nederland hun volgende stap vinden. Vergelijk <a href="/opleidingen" className="bl-textlink">opleidingen en cursussen</a> van opleiders, academies en merken. Bekijk <a href="/vacatures" className="bl-textlink">vacatures en samenwerkingen</a> in loondienst of als zelfstandige. Zoek een <a href="/werkruimtes" className="bl-textlink">salon te huur, stoelhuur of behandelkamer</a>. En ontdek de <a href="/merken-leveranciers" className="bl-textlink">merken en leveranciers</a> achter het professionele aanbod.
              </p>
            </div>
            <div>
              <h2 style={{ ...h2, fontSize: 'clamp(24px, 2.6vw, 30px)', marginBottom: 20 }}>Voor wie is Blissify?</h2>
              {[
                ['ti-sparkles', 'Voor schoonheidsspecialisten, nagelstylisten, pedicures, masseurs en yogadocenten', 'Je vindt opleidingen om te starten of bij te scholen, vacatures en werkruimtes om je carrière op te bouwen.'],
                ['ti-building-store', 'Voor salons, instituten, spa’s en praktijken', 'Je publiceert vacatures, verhuurt werkruimtes en bereikt professionals die bij je passen.'],
                ['ti-school', 'Voor opleiders, academies, merken en leveranciers', 'Je maakt opleidingen en producten zichtbaar bij de professionals die ze zoeken.'],
              ].map(([icon, t, b]) => (
                <div key={t} className="bl-audience">
                  <span className="bl-audience-icon"><i className={`ti ${icon}`} aria-hidden="true" /></span>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 15, lineHeight: 1.45, color: 'var(--text-brand)', margin: 0 }}>{t}</h3>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-body)', margin: '4px 0 0' }}>{b}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Zelf iets aanbieden? (call to action) */}
      <section className="bl-cta-band">
        <div className="bl-container" style={{ paddingTop: 64, paddingBottom: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 680 }}>
            <h2 style={{ ...h2, color: '#fff', fontSize: 'clamp(34px, 4.4vw, 52px)' }}>Zelf iets <span style={{ fontStyle: 'italic' }}>aanbieden?</span></h2>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 17, lineHeight: 1.65, color: 'rgba(255, 255, 255, 0.92)', margin: '14px 0 0' }}>Bereik andere beauty- en wellnessprofessionals met jouw opleidingen, merk, vacatures of werkruimtes.</p>
          </div>
          <a href="/abonnementen-tarieven" className="bl-btn-light">Word aanbieder <i className="ti ti-arrow-right" aria-hidden="true" /></a>
        </div>
      </section>

      {/* In de kijker: opleidingen, merken, werkruimtes, vacatures */}
      {featuredCourses.length ? (
        <Featured title="Opleidingen in de kijker" text="Opleidingen en cursussen van opleiders, academies en merken, van schoonheidsspecialiste en nagelstyliste tot massage en yoga." href="/opleidingen" link="Bekijk alle opleidingen">
          <div className="bl-grid-3">{featuredCourses.map((c) => <CourseCard key={c.slug} {...c} />)}</div>
        </Featured>
      ) : null}
      {featuredBrands.length ? (
        <Featured tinted title="Merken & leveranciers in de kijker" text="Professionele merken, producten en apparatuur voor jouw salon of praktijk." href="/merken-leveranciers" link="Bekijk alle merken & leveranciers">
          <div className="bl-grid-3">{featuredBrands.map((b) => <BrandCard key={b.slug} b={b} />)}</div>
        </Featured>
      ) : null}
      {featuredWorkspaces.length ? (
        <Featured title="Werkruimtes in de kijker" text="Een salon te huur, een stoel in een bestaande salon of een behandelkamer voor een paar dagen per week." href="/werkruimtes" link="Bekijk alle werkruimtes">
          <div className="bl-grid-3">{featuredWorkspaces.map((w) => <WorkspaceCard key={w.id} w={w} />)}</div>
        </Featured>
      ) : null}
      {featuredVacancies.length ? (
        <Featured tinted title="Vacatures in de kijker" text="Vacatures, freelanceopdrachten en stages voor schoonheidsspecialisten, nagelstylisten, masseurs, pedicures en kappers." href="/vacatures" link="Bekijk alle vacatures">
          <div className="bl-grid-3">{featuredVacancies.map((v) => <VacancyTile key={v.id} v={v} />)}</div>
        </Featured>
      ) : null}

      {/* Gebouwd voor de professional, niet voor de hype. */}
      <section style={{ background: 'var(--surface-deep)' }}>
        <div className="bl-container bl-home-section bl-photo-split" data-reveal style={{ paddingTop: 112, paddingBottom: 112 }}>
          <figure><img src="/images/home/professional.jpg" alt="Een schoonheidsspecialiste brengt een kleimasker aan bij een klant" loading="lazy" /></figure>
          <div>
            <h2 style={{ ...h2, color: 'var(--blissify-chalk)', fontSize: 'clamp(32px, 4.2vw, 48px)', marginBottom: 32 }}>{why.title || 'Gebouwd voor de professional, niet voor de hype.'}</h2>
            {darkCards.map((d: { icon?: string; title: string; body?: string }) => (
              <div key={d.title} className="bl-point">
                <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: 'var(--blissify-chalk)', lineHeight: 1.2, marginBottom: 8 }}>{d.title}</div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.75, color: 'rgba(225, 230, 234, 0.9)', margin: 0, maxWidth: 520 }}>{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eén platform. Eindeloos veel mogelijkheden. */}
      <section>
        <div className="bl-container bl-home-section" data-reveal style={{ paddingTop: 96, paddingBottom: 96 }}>
          <div style={{ maxWidth: 640, marginBottom: 40 }}>
            <h2 style={h2}>Eén platform. Eindeloos veel mogelijkheden.</h2>
            <p style={lead}>Waar beauty, wellness en professioneel ondernemerschap samenkomen.</p>
          </div>
          <div className="bl-cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
            {[
              ['Ontdek.', 'Verken opleidingen, merken, werkruimtes en vacatures die aansluiten bij jouw ambities.'],
              ['Verbind.', 'Kom in contact met opleiders, leveranciers, saloneigenaars en andere professionals binnen de sector.'],
              ['Groei.', 'Blijf jezelf ontwikkelen, ontdek nieuwe samenwerkingen en geef jouw onderneming de zichtbaarheid die ze verdient.'],
            ].map(([t, b]) => (
              <div key={t} style={{ borderTop: '1px solid var(--palette-rose)', paddingTop: 20 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 44, lineHeight: 1, color: 'var(--blissify-terracotta)' }}>{t}</div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-body)', margin: '10px 0 0' }}>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hoe werkt Blissify? */}
      <section style={{ background: 'var(--surface-card)' }}>
        <div className="bl-container bl-home-section" data-reveal style={{ paddingTop: 104, paddingBottom: 104 }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
            <h2 style={h2}>Hoe werkt Blissify?</h2>
            <p style={{ ...lead, fontSize: 17 }}>Eén professioneel profiel. Alle mogelijkheden voor jouw onderneming.</p>
            <p style={{ ...lead, fontSize: 15 }}>Blissify brengt beauty- en wellnessondernemingen samen op één platform in België en Nederland. Maak jouw onderneming zichtbaar met een bedrijfsprofiel en presenteer jouw opleidingen, merk, vacatures en werkruimtes op één centrale plek.</p>
          </div>
          <div className="bl-faq-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'stretch' }}>
            {[
              {
                title: 'Voor salons & professionals',
                points: [
                  ['Creëer jouw bedrijfsprofiel', 'Stel jouw onderneming voor met foto’s, specialisaties, bedrijfsinformatie en links naar je eigen kanalen.'],
                  ['Bied opleidingen aan', 'Publiceer jouw opleidingen, workshops en trainingen en bereik professionals die hun kennis willen uitbreiden.'],
                  ['Publiceer vacatures', 'Vind medewerkers, zelfstandigen of freelancers die bij jouw onderneming passen.'],
                  ['Bied werkruimtes aan', 'Maak een behandelkamer, een stoel in jouw salon of een andere werkplek zichtbaar voor professionals die een werkruimte zoeken.'],
                ],
                image: '/images/home/salon.jpg',
                foot: 'Gebruik de mogelijkheden die voor jouw onderneming relevant zijn, allemaal binnen één abonnement.',
                cta: { href: '/abonnementen-tarieven', label: 'Ontdek de abonnementen voor salons & professionals' },
              },
              {
                title: 'Voor merken & leveranciers',
                points: [
                  ['Creëer jouw merkprofiel', 'Presenteer jouw merk met foto’s, productinformatie, specialisaties en links naar je website of webshop.'],
                  ['Bereik de juiste professionals', 'Word ontdekt via relevante categorieën, specialisaties en zoekfilters.'],
                  ['Promoot opleidingen & events', 'Publiceer, afhankelijk van je abonnement, trainingen, workshops en evenementen.'],
                  ['Deel vacatures en werkruimtes', 'Breng ook jouw vacatures en beschikbare werkruimtes onder de aandacht.'],
                ],
                image: '/images/home/facial.jpg',
                foot: 'Alles overzichtelijk beheerd vanuit één account.',
                cta: { href: '/abonnementen-tarieven?voor=merken', label: 'Ontdek de abonnementen voor merken & leveranciers' },
              },
            ].map((col) => (
              <div key={col.title} className="bl-howcard">
                <div className="bl-howcard-media" style={{ backgroundImage: `url(${col.image})` }} aria-hidden="true" />
                <div className="bl-howcard-body">
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 28, color: 'var(--text-brand)', lineHeight: 1.15, marginBottom: 20 }}>{col.title}</div>
                  <div style={{ display: 'grid', gap: 16, marginBottom: 20 }}>
                    {col.points.map(([t, b]) => (
                      <div key={t} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: 12, alignItems: 'start', fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.6, color: 'var(--text-body)' }}>
                        <span style={{ width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--surface-soft)', color: 'var(--palette-rose-ink)' }}><i className="ti ti-check" style={{ fontSize: 15 }} /></span>
                        <span><strong style={{ fontWeight: 600, color: 'var(--text-brand)' }}>{t}.</strong> {b}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.6, color: 'var(--text-strong)', margin: '0 0 24px' }}>{col.foot}</p>
                  <div style={{ marginTop: 'auto' }}><ButtonLink href={col.cta.href} variant="primary" fullWidth>{col.cta.label}</ButtonLink></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alles beheren vanuit één plek */}
      <section>
        <div className="bl-container" data-reveal style={{ paddingTop: 96, paddingBottom: 96, textAlign: 'center', maxWidth: 760 }}>
          <h2 style={h2}>Alles beheren vanuit één plek.</h2>
          <p style={lead}>Kies het abonnement dat bij jouw onderneming past, stel je profiel samen en publiceer jouw aanbod. Of je nu één opleiding aanbiedt, vacatures wilt plaatsen of een werkruimte wilt verhuren: met Blissify bereik je professionals die gericht zoeken naar wat jij aanbiedt.</p>
          <div style={{ marginTop: 24 }}><ButtonLink href="/abonnementen-tarieven" variant="primary">Word aanbieder</ButtonLink></div>
        </div>
      </section>

      {/* Een formule voor iedere aanbieder */}
      <section style={{ background: 'var(--surface-card)' }}>
        <div className="bl-container bl-home-section" style={{ paddingTop: 96, paddingBottom: 96 }}>
          <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 40px' }}>
            <h2 style={h2}>Een formule voor iedere aanbieder.</h2>
            <p style={lead}>Vergelijk de abonnementen voor salons &amp; professionals en voor merken &amp; leveranciers. Alle prijzen zijn exclusief btw. Bij jaarlijkse betaling krijg je twee maanden gratis.</p>
          </div>
          <PricingPlans catalog={{ opleiders: pricingCatalog.opleiders, brands: pricingCatalog.brands }} billing={pricingCatalog.billing} allowAudienceSwitch compact />
          <div style={{ textAlign: 'center', marginTop: 28 }}><a href="/abonnementen-tarieven" className="bl-textlink">Vergelijk alle abonnementen &amp; tarieven</a></div>
        </div>
      </section>

      {/* Veelgestelde vragen (first four "Algemeen" questions) */}
      <section>
        <div className="bl-container bl-home-section" style={{ paddingTop: 96, paddingBottom: 96 }}>
          <div className="bl-faq-split" style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 56, alignItems: 'start' }}>
            <div>
              <h2 style={h2}>Veelgestelde vragen.</h2>
              <p style={{ ...lead, fontSize: 15, margin: '18px 0 24px' }}>Korte antwoorden op de belangrijkste vragen over Blissify en de mogelijkheden van ons platform.</p>
              <ButtonLink href="/veelgestelde-vragen" variant="primary">Bekijk alle veelgestelde vragen</ButtonLink>
            </div>
            <Faq items={faqItems} variant="card" defaultOpen={0} />
          </div>
        </div>
      </section>

      {/* Slotblok */}
      <CtaPanel title="Jouw groei" accent="begint hier." body="Maak jouw aanbod zichtbaar voor beauty- en wellnessprofessionals in België en Nederland. Of je nu opleidingen aanbiedt, jouw merk wilt promoten, een werkruimte beschikbaar hebt of nieuwe medewerkers zoekt: ontdek wat Blissify voor jouw onderneming kan betekenen." href="/abonnementen-tarieven" label="Word aanbieder" />

      <SiteFooter />
    </>
  )
}
