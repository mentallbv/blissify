import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteChrome } from '@/components/site/SiteChrome'
import { WorkspaceApply } from '@/components/site/WorkspaceApply'
import { ReportListing } from '@/components/site/ReportListing'
import { TrackPageView } from '@/components/site/TrackPageView'
import { WorkspaceLandingPage, landingMetadata } from '@/components/site/WorkspaceLandingPage'
import { Avatar } from '@/components/ui'
import { publicMediaUrl } from '@/lib/media'
import { cssUrl } from '@/lib/css-url'
import { getWorkspaceBySlug, rentLabel, usageLabel, workplaceLabels } from '@/lib/workspaces'
import { workspaceLanding } from '@/lib/workspace-landings'
import { ACCESS_OPTIONS, ALL_FACILITIES, AVAILABLE_FROM, DAYS, DEPOSIT_OPTIONS, FACILITY_UNITS, SALON_TYPES, WORKSPACE_ACTIVITIES, labelOf } from '@/lib/workspace-options'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const landing = workspaceLanding(slug)
  if (landing) return landingMetadata(landing)
  const w = await getWorkspaceBySlug(slug)
  if (!w) return {}
  return {
    title: w.seo?.title || `${w.title} | ${w.companyName}, ${w.city}`,
    description: w.seo?.description || `${workplaceLabels(w.workplaceTypes || []).join(', ')} te huur bij ${w.companyName} in ${w.city}. ${rentLabel(w)}. Stuur rechtstreeks een aanvraag via Blissify.`,
  }
}

const euro = (n: number) => `€${new Intl.NumberFormat('nl-BE', { maximumFractionDigits: 2 }).format(n)}`

export default async function WorkspacePage({ params }: Params) {
  const { slug } = await params
  const landing = workspaceLanding(slug)
  if (landing) return <WorkspaceLandingPage landing={landing} />
  const w = await getWorkspaceBySlug(slug)
  if (!w) notFound()

  const facilityName = (f: { key: string; name?: string }) => (f.key === 'custom' ? f.name || '' : ALL_FACILITIES.find((x) => x.value === f.key)?.label || f.key)
  const included = (w.facilities || []).filter((f: { mode: string }) => f.mode === 'inbegrepen').map(facilityName)
  const extra = (w.facilities || []).filter((f: { mode: string }) => f.mode === 'meerprijs').map((f: { key: string; name?: string; price?: number; unit?: string }) => `${facilityName(f)} – ${f.price != null ? `${euro(f.price)} ${labelOf(FACILITY_UNITS, f.unit).toLowerCase()}` : 'tegen meerprijs'}`)
  const features = (w.features || []).map((k: string) => ALL_FACILITIES.find((x) => x.value === k)?.label || k)
  const activities = [...(w.activities || []).filter((a: string) => a !== 'overig').map((a: string) => labelOf(WORKSPACE_ACTIVITIES, a)), w.activityOther].filter(Boolean)
  const week: { label: string; blocks: string[] }[] = DAYS.map((d) => ({ label: d.label, blocks: (w.schedule || []).filter((b: { day: string }) => b.day === d.value).map((b: { from: string; to: string }) => `${b.from}–${b.to}`) }))
  const from = w.availableFrom === 'datum' && w.availableDate ? `Vanaf ${new Date(w.availableDate).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long' })}` : labelOf(AVAILABLE_FROM, w.availableFrom)
  const photos = [publicMediaUrl(w.coverImage), ...(w.gallery || []).map((g: { image?: unknown }) => publicMediaUrl(g.image as never))].filter(Boolean) as string[]
  const profileHref = w.brand?.slug ? `/merken-leveranciers/${w.brand.slug}` : w.trainer?.slug ? `/salons-professionals/${w.trainer.slug}` : null
  const logo = publicMediaUrl(w.brand?.logo) || publicMediaUrl(w.trainer?.photo)
  const deposit = w.deposit === 'bedrag' && w.depositAmount != null ? euro(w.depositAmount) : labelOf(DEPOSIT_OPTIONS, w.deposit)
  const salonTypes = [...(w.salonTypes || []).filter((s: string) => s !== 'overig').map((s: string) => labelOf(SALON_TYPES, s)), w.salonTypeOther].filter(Boolean)
  const price = rentLabel(w)
  const facts: [string, string, string | null | undefined][] = [
    ['ti-coin-euro', 'Huurprijs', `${price}${w.rentAmount != null ? ' excl. btw' : ''}`],
    ['ti-users', 'Gebruik', usageLabel(w.usage)],
    ['ti-key', 'Toegang', labelOf(ACCESS_OPTIONS, w.access)],
    ['ti-calendar-event', 'Beschikbaar', from],
    ['ti-shield', 'Waarborg', deposit],
  ]

  return (
    <SiteChrome>
      <TrackPageView kind="workspace" id={w.id} owner={w.brand?.id ? { kind: 'brand', id: w.brand.id } : w.trainer?.id ? { kind: 'trainer', id: w.trainer.id } : null} />
      {photos.length ? (
        <div className="bl-ws-gallery">{photos.slice(0, 3).map((src, i) => <div key={i} style={{ backgroundImage: cssUrl(src) }} />)}</div>
      ) : null}
      <div className="bl-container" style={{ paddingTop: 36, paddingBottom: 96 }}>
        <nav aria-label="Kruimelpad" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-strong)', marginBottom: 22 }}>
          <a href="/werkruimtes" className="bl-textlink">Werkruimtes</a> <span aria-hidden="true">→</span> {w.city}
        </nav>

        <header className="bl-detail-head">
          <div className="bl-tags">
            {workplaceLabels(w.workplaceTypes || []).map((t) => <span key={t} className="bl-tag">{t}</span>)}
            {w.availableFrom === 'onmiddellijk' ? <span className="bl-tag bl-tag--ok">Nu beschikbaar</span> : null}
          </div>
          <h1 className="bl-detail-title">{w.title}</h1>
          <div className="bl-meta" style={{ fontSize: 15 }}>
            <span><i className="ti ti-building-store" aria-hidden="true" />{w.companyName}</span>
            <span><i className="ti ti-map-pin" aria-hidden="true" />{w.city}, {w.country === 'nl' ? 'Nederland' : 'België'}</span>
          </div>
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
            {w.description ? <section className="bl-panel-section"><h2>Over deze werkruimte</h2><p className="bl-prose">{w.description}</p></section> : null}

            {week.some((d) => d.blocks.length) ? (
              <section className="bl-panel-section">
                <h2>Beschikbaarheid</h2>
                <div className="bl-week">
                  {week.map((d) => (
                    <div key={d.label} className={'bl-week-day' + (d.blocks.length ? ' is-open' : '')}>
                      <span className="bl-week-name">{d.label}</span>
                      {d.blocks.length ? d.blocks.map((b: string) => <span key={b} className="bl-week-block">{b}</span>) : <span className="bl-week-none">Niet beschikbaar</span>}
                    </div>
                  ))}
                </div>
                {w.otherTimesNegotiable ? <p className="bl-contactbox-note" style={{ marginTop: 14 }}><i className="ti ti-messages" aria-hidden="true" />Andere dagen of uren zijn bespreekbaar.</p> : null}
              </section>
            ) : null}

            {included.length || extra.length || features.length ? (
              <section className="bl-panel-section">
                <h2>Voorzieningen</h2>
                <div style={{ display: 'grid', gap: 22 }}>
                  {included.length ? <div><h3>Inbegrepen in de huurprijs</h3><ul className="bl-checklist">{included.map((x: string) => <li key={x}><i className="ti ti-check" aria-hidden="true" />{x}</li>)}</ul></div> : null}
                  {extra.length ? (
                    <div>
                      <h3>Beschikbaar tegen meerprijs</h3>
                      <ul className="bl-checklist">
                        {extra.map((x: string) => {
                          const [name, cost] = x.split(' – ')
                          return <li key={x}><i className="ti ti-plus" aria-hidden="true" />{name}<span className="bl-price">{cost === 'tegen meerprijs' ? 'Op aanvraag' : cost}</span></li>
                        })}
                      </ul>
                    </div>
                  ) : null}
                  {features.length ? <div><h3>Kenmerken en mogelijkheden</h3><ul className="bl-checklist">{features.map((x: string) => <li key={x}><i className="ti ti-point-filled" aria-hidden="true" />{x}</li>)}</ul></div> : null}
                </div>
                {w.facilitiesNote ? <p className="bl-prose" style={{ marginTop: 16, fontSize: 14 }}>{w.facilitiesNote}</p> : null}
              </section>
            ) : null}

            {activities.length || salonTypes.length ? (
              <section className="bl-panel-section">
                <h2>Geschikt voor</h2>
                <div className="bl-tags">
                  {salonTypes.map((s: string) => <span key={s} className="bl-tag">{s}</span>)}
                  {activities.map((a: string) => <span key={a} className="bl-tag bl-tag--quiet">{a}</span>)}
                </div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, lineHeight: 1.6, color: 'var(--text-strong)', margin: '14px 0 0', maxWidth: '68ch' }}>
                  Bij medische of gereglementeerde activiteiten gaan verhuurder en huurder zelf na of de ruimte voldoet aan de toepasselijke vereisten.
                </p>
              </section>
            ) : null}
          </div>

          <aside style={{ position: 'sticky', top: 96, display: 'grid', gap: 12 }}>
            <div className="bl-contactbox">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Avatar initial={(w.companyName || '?')[0]} src={logo} size={44} radius={8} />
                <div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 15, color: 'var(--text-brand)' }}>{w.companyName}</div>
                  {profileHref ? <a href={profileHref} className="bl-textlink" style={{ fontSize: 13 }}>Bekijk profiel</a> : null}
                </div>
              </div>
              <div>
                <div className="bl-contactbox-price">{price}</div>
                {w.rentAmount != null ? <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-strong)', marginTop: 6 }}>excl. btw</div> : null}
              </div>
              <WorkspaceApply workspaceId={w.id} title={w.title} />
              <p className="bl-contactbox-note"><i className="ti ti-lock" aria-hidden="true" />Je gegevens gaan alleen naar de verhuurder. Het adres en telefoonnummer van het salon blijven verborgen.</p>
            </div>
            <div style={{ padding: '0 4px' }}><ReportListing kind="workspace" slug={w.slug} /></div>
          </aside>
        </div>
      </div>
      <div className="bl-apply-bar"><WorkspaceApply workspaceId={w.id} title={w.title} /></div>
    </SiteChrome>
  )
}
