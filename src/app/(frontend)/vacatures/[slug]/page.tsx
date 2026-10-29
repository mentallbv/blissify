import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteChrome } from '@/components/site/SiteChrome'
import { ApplyButton } from '@/components/site/ApplyButton'
import { TrackPageView } from '@/components/site/TrackPageView'
import { Avatar, Eyebrow } from '@/components/ui'
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

const h2: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--text-brand)', margin: '0 0 12px' }
const p: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.75, color: 'var(--text-body)', margin: 0, whiteSpace: 'pre-line' }
const box: React.CSSProperties = { background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 'clamp(20px, 5vw, 28px)', minWidth: 0 }

function Facts({ rows }: { rows: [string, string | null | undefined][] }) {
  const shown = rows.filter(([, v]) => v)
  if (!shown.length) return null
  return (
    <dl style={{ display: 'grid', gridTemplateColumns: 'minmax(96px, 200px) minmax(0, 1fr)', gap: '10px 20px', margin: 0, fontFamily: 'var(--font-ui)', fontSize: 14 }}>
      {shown.map(([k, v]) => (
        <React.Fragment key={k}>
          <dt style={{ color: 'var(--text-meta)' }}>{k}</dt>
          <dd style={{ margin: 0, color: 'var(--text-strong)', whiteSpace: 'pre-line' }}>{v}</dd>
        </React.Fragment>
      ))}
    </dl>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={box}>
      <h2 style={h2}>{title}</h2>
      {children}
    </section>
  )
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

  return (
    <SiteChrome>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobLd) }} />
      <TrackPageView kind="vacancy" id={v.id} owner={v.brand?.id ? { kind: 'brand', id: v.brand.id } : v.trainer?.id ? { kind: 'trainer', id: v.trainer.id } : null} />
      {cover ? <div style={{ height: 280, backgroundImage: cssUrl(cover), backgroundSize: 'cover', backgroundPosition: 'center' }} /> : null}
      <div className="bl-container" style={{ paddingTop: 40, paddingBottom: 96 }}>
        <nav aria-label="Kruimelpad" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)', marginBottom: 20 }}>
          <a href="/vacatures" className="bl-textlink">Vacatures</a> → {v.title}
        </nav>
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 40, alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 20, minWidth: 0 }}>
            <div>
              <Eyebrow tone="meta">{types || 'Vacature'}</Eyebrow>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 44, lineHeight: 1.1, color: 'var(--text-brand)', margin: '12px 0 10px' }}>{v.title}</h1>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--text-body)' }}>
                {v.companyName} · {v.city}, {v.country === 'nl' ? 'Nederland' : 'België'}
              </div>
            </div>

            <Section title="In het kort">
              <Facts rows={[
                ['Functie', functions],
                ['Type samenwerking', types],
                ['Werkregime', regimeLabels(v.regimes || []).join(', ')],
                ['Werkdagen', (v.workdays || []).map((d: string) => labelOf(WEEKDAYS, d)).join(', ')],
                ['Start', start],
                ['Ervaring', labelOf(EXPERIENCE_LEVELS, v.experience)],
                ['Vergoeding', [(v.compensationTypes || []).map((c: string) => labelOf(COMPENSATION_TYPES, c)).join(', '), v.compensationAmount].filter(Boolean).join(' · ')],
              ]} />
              {v.regimeNote || v.startNote ? <p style={{ ...p, marginTop: 16 }}>{[v.regimeNote, v.startNote].filter(Boolean).join('\n')}</p> : null}
            </Section>

            {v.aboutCompany ? <Section title="Over het salon"><p style={p}>{v.aboutCompany}</p></Section> : null}
            {v.whoWeSeek ? <Section title="Wie zoeken we?"><p style={p}>{v.whoWeSeek}</p></Section> : null}
            {v.whatWeOffer || offers.length ? (
              <Section title="Wat bieden we aan?">
                {v.whatWeOffer ? <p style={p}>{v.whatWeOffer}</p> : null}
                {offers.length ? (
                  <ul style={{ margin: v.whatWeOffer ? '14px 0 0' : 0, paddingLeft: 20, fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.8, color: 'var(--text-body)' }}>
                    {offers.map((o: string) => <li key={o}>{o}</li>)}
                  </ul>
                ) : null}
              </Section>
            ) : null}
            {v.diplomaNote || v.requirementsNote ? (
              <Section title="Vereisten">
                <Facts rows={[['Opleiding / diploma', v.diplomaNote], ['Verder', v.requirementsNote]]} />
              </Section>
            ) : null}
            {v.compensationNote ? <Section title="Vergoeding"><p style={p}>{v.compensationNote}</p></Section> : null}
          </div>

          <aside style={{ position: 'sticky', top: 92, display: 'grid', gap: 16 }}>
            <div style={box}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 18 }}>
                <Avatar initial={(v.companyName || '?')[0]} src={logo} size={48} radius={6} />
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-brand)' }}>{v.companyName}</div>
                  {profileHref ? <a href={profileHref} className="bl-textlink" style={{ fontSize: 13 }}>Bekijk profiel</a> : null}
                </div>
              </div>
              <h2 style={{ ...h2, fontSize: 20 }}>Interesse?</h2>
              <p style={{ ...p, fontSize: 14, marginBottom: 18 }}>
                {v.applyMethod === 'link' ? 'Solliciteer rechtstreeks via de website van de onderneming.' : `Stuur je sollicitatie rechtstreeks naar ${v.contactName}. Vermeld Blissify als referentie.`}
              </p>
              <ApplyButton method={v.applyMethod === 'link' ? 'link' : 'email'} url={v.applyUrl} email={v.contactEmail} title={v.title} label="Solliciteer voor deze vacature" />
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, lineHeight: 1.7, color: 'var(--text-meta)', marginTop: 16 }}>
                Contactpersoon: {v.contactName}
                {v.contactPhone ? <><br />Telefoon: <a href={`tel:${v.contactPhone}`} className="bl-textlink">{v.contactPhone}</a></> : null}
                {v.website ? <><br /><a href={v.website} target="_blank" rel="noopener noreferrer" className="bl-textlink">Website</a></> : null}
              </div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)', margin: '14px 0 0' }}>
                Geplaatst op {new Date(v.createdAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile: sticky apply bar, like creativeskills.be */}
      <div className="bl-apply-bar">
        <ApplyButton method={v.applyMethod === 'link' ? 'link' : 'email'} url={v.applyUrl} email={v.contactEmail} title={v.title} />
      </div>
    </SiteChrome>
  )
}
