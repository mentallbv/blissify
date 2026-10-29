import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteChrome } from '@/components/site/SiteChrome'
import { ApplyButton } from '@/components/site/ApplyButton'
import { TrackPageView } from '@/components/site/TrackPageView'
import { Avatar } from '@/components/ui'
import { publicMediaUrl } from '@/lib/media'
import { cssUrl } from '@/lib/css-url'
import { functionLabels, getVacancyBySlug, regimeLabels, typeLabels } from '@/lib/vacancies'
import { vacancyLanding } from '@/lib/vacancy-landings'
import { VacancyLandingPage, landingMetadata } from '@/components/site/VacancyLandingPage'
import { COMPENSATION_TYPES, EXPERIENCE_LEVELS, START_OPTIONS, VACANCY_OFFERS, WEEKDAYS, labelOf } from '@/lib/vacancy-options'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const landing = vacancyLanding(slug)
  if (landing) return landingMetadata(landing)
  const v = await getVacancyBySlug(slug)
  if (!v) return {}
  return {
    title: v.seo?.title || `Vacature ${v.title} bij ${v.companyName} in ${v.city}`,
    description: v.seo?.description || `${v.title} bij ${v.companyName} in ${v.city}. ${typeLabels(v.types || []).join(', ')}. Reageer rechtstreeks via Blissify.`,
  }
}

export default async function VacancyPage({ params }: Params) {
  const { slug } = await params
  const landing = vacancyLanding(slug)
  if (landing) return <VacancyLandingPage landing={landing} />
  const v = await getVacancyBySlug(slug)
  if (!v) notFound()

  const list = (labels: string[], other?: string) => [...labels.filter((l) => l !== 'Overig' && l !== 'Andere samenwerking'), other].filter(Boolean).join(', ')
  const types = list(typeLabels(v.types || []), v.typeOther)
  const functions = list(functionLabels(v.functions || []), v.functionOther)
  const start = v.start === 'datum' && v.startDate ? `Vanaf ${new Date(v.startDate).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })}` : labelOf(START_OPTIONS, v.start)
  const offers = [...(v.offers || []).filter((o: string) => o !== 'overig').map((o: string) => labelOf(VACANCY_OFFERS, o)), v.offerOther].filter(Boolean)
  const cover = publicMediaUrl(v.coverImage)
  const logo = publicMediaUrl(v.logo) || publicMediaUrl(v.brand?.logo) || publicMediaUrl(v.trainer?.photo)
  const profileHref = v.brand?.slug ? `/merken-leveranciers/${v.brand.slug}` : v.trainer?.slug ? `/salons-professionals/${v.trainer.slug}` : null

  // Google for Jobs (copy: JobPosting op elke vacature).
  const employmentType = (v.types || []).map((t: string) => ({ loondienst: 'FULL_TIME', zelfstandig: 'CONTRACTOR', bijberoep: 'CONTRACTOR', commissie: 'CONTRACTOR', stage: 'INTERN' } as Record<string, string>)[t]).filter(Boolean)
  const jobLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: v.title,
    description: [v.whoWeSeek, v.whatWeOffer, v.aboutCompany].filter(Boolean).join('\n\n') || v.title,
    datePosted: v.createdAt,
    employmentType: Array.from(new Set(employmentType)),
    hiringOrganization: { '@type': 'Organization', name: v.companyName, ...(v.website ? { sameAs: v.website } : {}), ...(logo ? { logo } : {}) },
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: v.city, addressCountry: v.country === 'nl' ? 'NL' : 'BE' } },
    directApply: false,
  }

  const compensation = [(v.compensationTypes || []).map((c: string) => labelOf(COMPENSATION_TYPES, c)).join(', '), v.compensationAmount].filter(Boolean).join(' · ')
  const facts: [string, string, string | null | undefined][] = [
    ['ti-briefcase', 'Samenwerking', types],
    ['ti-clock', 'Werkregime', regimeLabels(v.regimes || []).join(', ')],
    ['ti-map-pin', 'Locatie', `${v.city}, ${v.country === 'nl' ? 'Nederland' : 'België'}`],
    ['ti-calendar-event', 'Start', start],
    ['ti-coin-euro', 'Vergoeding', compensation],
  ]
  const workdays = (v.workdays || []).map((d: string) => labelOf(WEEKDAYS, d))
  const applyProps = { method: (v.applyMethod === 'link' ? 'link' : 'email') as 'link' | 'email', url: v.applyUrl, email: v.contactEmail, title: v.title }

  return (
    <SiteChrome>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobLd) }} />
      <TrackPageView kind="vacancy" id={v.id} owner={v.brand?.id ? { kind: 'brand', id: v.brand.id } : v.trainer?.id ? { kind: 'trainer', id: v.trainer.id } : null} />
      {cover ? <div style={{ height: 'clamp(180px, 26vw, 320px)', backgroundImage: cssUrl(cover), backgroundSize: 'cover', backgroundPosition: 'center' }} /> : null}
      <div className="bl-container" style={{ paddingTop: 36, paddingBottom: 96 }}>
        <nav aria-label="Kruimelpad" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-strong)', marginBottom: 22 }}>
          <a href="/vacatures" className="bl-textlink">Vacatures</a> <span aria-hidden="true">→</span> {v.title}
        </nav>

        <header className="bl-detail-head">
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Avatar initial={(v.companyName || '?')[0]} src={logo} size={56} radius={8} />
            <div className="bl-meta" style={{ fontSize: 15 }}>
              <span style={{ fontWeight: 500 }}>{v.companyName}</span>
              <span>Geplaatst op {new Date(v.createdAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
          <h1 className="bl-detail-title">{v.title}</h1>
          <div className="bl-tags">{functions.split(', ').filter(Boolean).map((f: string) => <span key={f} className="bl-tag">{f}</span>)}</div>
        </header>

        <div className="bl-keyfacts" style={{ marginBottom: 28 }}>
          {facts.filter(([, , val]) => val).map(([icon, label, val]) => (
            <div key={label} className="bl-keyfact">
              <span className="bl-keyfact-label"><i className={`ti ${icon}`} aria-hidden="true" />{label}</span>
              <span className="bl-keyfact-value">{val}</span>
            </div>
          ))}
        </div>

        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 32, alignItems: 'start' }}>
          <div className="bl-panel" style={{ minWidth: 0 }}>
            {v.whoWeSeek ? <section className="bl-panel-section"><h2>Wie zoeken we?</h2><p className="bl-prose">{v.whoWeSeek}</p></section> : null}
            {v.whatWeOffer || offers.length ? (
              <section className="bl-panel-section">
                <h2>Wat bieden we aan?</h2>
                {v.whatWeOffer ? <p className="bl-prose" style={{ marginBottom: offers.length ? 18 : 0 }}>{v.whatWeOffer}</p> : null}
                {offers.length ? <ul className="bl-checklist">{offers.map((o: string) => <li key={o}><i className="ti ti-check" aria-hidden="true" />{o}</li>)}</ul> : null}
              </section>
            ) : null}
            {v.diplomaNote || v.requirementsNote || v.experience ? (
              <section className="bl-panel-section">
                <h2>Wat verwachten we?</h2>
                <ul className="bl-checklist" style={{ gridTemplateColumns: '1fr' }}>
                  {v.experience ? <li><i className="ti ti-certificate" aria-hidden="true" />{labelOf(EXPERIENCE_LEVELS, v.experience)}</li> : null}
                  {v.diplomaNote ? <li><i className="ti ti-school" aria-hidden="true" /><span style={{ whiteSpace: 'pre-line' }}>{v.diplomaNote}</span></li> : null}
                  {v.requirementsNote ? <li><i className="ti ti-list-check" aria-hidden="true" /><span style={{ whiteSpace: 'pre-line' }}>{v.requirementsNote}</span></li> : null}
                </ul>
              </section>
            ) : null}
            {workdays.length || v.regimeNote || v.startNote ? (
              <section className="bl-panel-section">
                <h2>Dagen en planning</h2>
                {workdays.length ? <div className="bl-tags" style={{ marginBottom: 12 }}>{workdays.map((d: string) => <span key={d} className="bl-tag bl-tag--quiet">{d}</span>)}</div> : null}
                {v.regimeNote || v.startNote ? <p className="bl-prose">{[v.regimeNote, v.startNote].filter(Boolean).join('\n')}</p> : null}
              </section>
            ) : null}
            {v.compensationNote ? <section className="bl-panel-section"><h2>Vergoeding</h2><p className="bl-prose">{v.compensationNote}</p></section> : null}
            {v.aboutCompany ? <section className="bl-panel-section"><h2>Over {v.companyName}</h2><p className="bl-prose">{v.aboutCompany}</p>{profileHref ? <a href={profileHref} className="bl-textlink" style={{ display: 'inline-block', marginTop: 12 }}>Bekijk het profiel</a> : null}</section> : null}
          </div>

          <aside style={{ position: 'sticky', top: 96, display: 'grid', gap: 12 }}>
            <div className="bl-contactbox">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--text-brand)', margin: 0 }}>Interesse?</h2>
              <p className="bl-contactbox-note" style={{ margin: 0 }}>
                <i className={`ti ${applyProps.method === 'link' ? 'ti-external-link' : 'ti-mail'}`} aria-hidden="true" />
                {applyProps.method === 'link' ? 'Je solliciteert rechtstreeks op de website van de onderneming.' : `Je solliciteert rechtstreeks bij ${v.contactName} via e-mail. Vermeld Blissify als referentie.`}
              </p>
              <ApplyButton {...applyProps} label="Solliciteer voor deze vacature" />
              <div className="bl-meta" style={{ fontSize: 13, display: 'grid', gap: 6 }}>
                <span><i className="ti ti-user" aria-hidden="true" />{v.contactName}</span>
                {v.contactPhone ? <span><i className="ti ti-phone" aria-hidden="true" /><a href={`tel:${v.contactPhone}`} className="bl-textlink">{v.contactPhone}</a></span> : null}
                {v.website ? <span><i className="ti ti-world" aria-hidden="true" /><a href={v.website} target="_blank" rel="noopener noreferrer" className="bl-textlink">Website</a></span> : null}
              </div>
            </div>
            <p className="bl-contactbox-note" style={{ padding: '0 4px' }}><i className="ti ti-shield-check" aria-hidden="true" />Blissify verzamelt geen gegevens van kandidaten.</p>
          </aside>
        </div>
      </div>

      <div className="bl-apply-bar"><ApplyButton {...applyProps} /></div>
    </SiteChrome>
  )
}
