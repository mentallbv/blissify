import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteChrome } from '@/components/site/SiteChrome'
import { WorkspaceApply } from '@/components/site/WorkspaceApply'
import { ReportListing } from '@/components/site/ReportListing'
import { TrackPageView } from '@/components/site/TrackPageView'
import { WorkspaceLandingPage, landingMetadata } from '@/components/site/WorkspaceLandingPage'
import { Avatar, Eyebrow } from '@/components/ui'
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

const h2: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--text-brand)', margin: '0 0 12px' }
const h3: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-meta)', margin: '0 0 8px' }
const p: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.75, color: 'var(--text-body)', margin: 0, whiteSpace: 'pre-line' }
const box: React.CSSProperties = { background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 'clamp(20px, 5vw, 28px)', minWidth: 0 }
const list: React.CSSProperties = { margin: 0, paddingLeft: 20, fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.9, color: 'var(--text-body)' }

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
  const schedule = DAYS.map((d) => ({ label: d.label, blocks: (w.schedule || []).filter((b: { day: string }) => b.day === d.value).map((b: { from: string; to: string }) => `${b.from}–${b.to}`) })).filter((d) => d.blocks.length)
  const from = w.availableFrom === 'datum' && w.availableDate ? `Vanaf ${new Date(w.availableDate).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })}` : labelOf(AVAILABLE_FROM, w.availableFrom)
  const photos = [publicMediaUrl(w.coverImage), ...(w.gallery || []).map((g: { image?: unknown }) => publicMediaUrl(g.image as never))].filter(Boolean) as string[]
  const profileHref = w.brand?.slug ? `/merken-leveranciers/${w.brand.slug}` : w.trainer?.slug ? `/salons-professionals/${w.trainer.slug}` : null
  const logo = publicMediaUrl(w.brand?.logo) || publicMediaUrl(w.trainer?.photo)
  const deposit = w.deposit === 'bedrag' && w.depositAmount != null ? euro(w.depositAmount) : labelOf(DEPOSIT_OPTIONS, w.deposit)

  return (
    <SiteChrome>
      <TrackPageView kind="workspace" id={w.id} owner={w.brand?.id ? { kind: 'brand', id: w.brand.id } : w.trainer?.id ? { kind: 'trainer', id: w.trainer.id } : null} />
      {photos.length ? (
        <div className="bl-ws-gallery">
          {photos.slice(0, 3).map((src, i) => <div key={i} style={{ backgroundImage: cssUrl(src) }} />)}
        </div>
      ) : null}
      <div className="bl-container" style={{ paddingTop: 36, paddingBottom: 96 }}>
        <nav aria-label="Kruimelpad" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)', marginBottom: 20 }}>
          <a href="/werkruimtes" className="bl-textlink">Werkruimtes</a> → {w.city} → {w.title}
        </nav>
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 40, alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 20, minWidth: 0 }}>
            <div>
              <Eyebrow tone="meta">{workplaceLabels(w.workplaceTypes || []).join(' · ') || 'Werkruimte'}</Eyebrow>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 44, lineHeight: 1.1, color: 'var(--text-brand)', margin: '12px 0 10px' }}>{w.title}</h1>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--text-body)' }}>{w.companyName} · {w.city}, {w.country === 'nl' ? 'Nederland' : 'België'}</div>
            </div>

            <section style={box}>
              <h2 style={h2}>In het kort</h2>
              <dl className="bl-facts">
                <dt>Huurprijs</dt><dd>{rentLabel(w)}{w.rentAmount != null ? ' excl. btw' : ''}</dd>
                {w.salonTypes?.length ? <><dt>Type salon</dt><dd>{[...w.salonTypes.filter((s: string) => s !== 'overig').map((s: string) => labelOf(SALON_TYPES, s)), w.salonTypeOther].filter(Boolean).join(', ')}</dd></> : null}
                {w.usage ? <><dt>Gebruik</dt><dd>{usageLabel(w.usage)}</dd></> : null}
                {w.access ? <><dt>Toegang</dt><dd>{labelOf(ACCESS_OPTIONS, w.access)}</dd></> : null}
                <dt>Beschikbaar</dt><dd>{from}</dd>
                {deposit ? <><dt>Waarborg</dt><dd>{deposit}</dd></> : null}
              </dl>
            </section>

            {schedule.length || w.otherTimesNegotiable ? (
              <section style={box}>
                <h2 style={h2}>Beschikbaarheid</h2>
                {schedule.length ? (
                  <dl className="bl-facts">
                    {schedule.map((d) => <React.Fragment key={d.label}><dt>{d.label}</dt><dd>{d.blocks.join(' en ')}</dd></React.Fragment>)}
                  </dl>
                ) : null}
                {w.otherTimesNegotiable ? <p style={{ ...p, marginTop: 12, fontSize: 14 }}>Andere dagen of uren zijn bespreekbaar.</p> : null}
              </section>
            ) : null}

            {included.length || extra.length || features.length ? (
              <section style={box}>
                <h2 style={h2}>Voorzieningen</h2>
                <div style={{ display: 'grid', gap: 18 }}>
                  {included.length ? <div><h3 style={h3}>Inbegrepen in de huurprijs</h3><ul style={list}>{included.map((x: string) => <li key={x}>{x}</li>)}</ul></div> : null}
                  {extra.length ? <div><h3 style={h3}>Beschikbaar tegen meerprijs</h3><ul style={list}>{extra.map((x: string) => <li key={x}>{x}</li>)}</ul></div> : null}
                  {features.length ? <div><h3 style={h3}>Kenmerken &amp; aanvullende mogelijkheden</h3><ul style={list}>{features.map((x: string) => <li key={x}>{x}</li>)}</ul></div> : null}
                </div>
                {w.facilitiesNote ? <p style={{ ...p, marginTop: 16, fontSize: 14 }}>{w.facilitiesNote}</p> : null}
              </section>
            ) : null}

            {activities.length ? (
              <section style={box}>
                <h2 style={h2}>Geschikt voor</h2>
                <p style={p}>{activities.join(' · ')}</p>
                <p style={{ ...p, marginTop: 12, fontSize: 12, color: 'var(--text-meta)' }}>Bij medische of gereglementeerde activiteiten gaan verhuurder en huurder zelf na of de ruimte voldoet aan de toepasselijke vereisten.</p>
              </section>
            ) : null}

            {w.description ? <section style={box}><h2 style={h2}>Beschrijving</h2><p style={p}>{w.description}</p></section> : null}
            <div><ReportListing kind="workspace" slug={w.slug} /></div>
          </div>

          <aside style={{ position: 'sticky', top: 92 }}>
            <div style={box}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
                <Avatar initial={(w.companyName || '?')[0]} src={logo} size={48} radius={6} />
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-brand)' }}>{w.companyName}</div>
                  {profileHref ? <a href={profileHref} className="bl-textlink" style={{ fontSize: 13 }}>Bekijk profiel</a> : null}
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 30, color: 'var(--text-brand)' }}>{rentLabel(w)}</div>
              {w.rentAmount != null ? <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)', marginBottom: 16 }}>excl. btw</div> : <div style={{ height: 12 }} />}
              <h2 style={{ ...h2, fontSize: 20 }}>Interesse?</h2>
              <p style={{ ...p, fontSize: 14, marginBottom: 16 }}>Stuur een korte aanvraag. Je gegevens gaan alleen naar de verhuurder; het adres en telefoonnummer van het salon blijven verborgen.</p>
              <WorkspaceApply workspaceId={w.id} title={w.title} />
            </div>
          </aside>
        </div>
      </div>
      <div className="bl-apply-bar"><WorkspaceApply workspaceId={w.id} title={w.title} /></div>
    </SiteChrome>
  )
}
