import React from 'react'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { LineChart } from '@/components/dashboard/LineChart'
import { MetricCard } from '@/components/ui'
import { InfoTooltip } from '@/components/site/InfoTooltip'
import { getCurrentUser, getCurrentProfile } from '@/lib/session'
import { getMyCourses } from '@/lib/dashboard-data'
import { getProfileViewEvents, getCourseViewEvents, getClickEvents, getLeadsForCourses, supabaseConfigured } from '@/lib/supabase'
import { tierForUser } from '@/lib/tier-features'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
const DAY = 86_400_000

export default async function DashboardAnalyticsPage() {
  const user = await getCurrentUser()
  const entitlement = user ? tierForUser(user) : null
  if (!user || !entitlement?.features.hasAnalytics) redirect('/dashboard/abonnement')
  const hasAdvancedAnalytics = entitlement.features.hasAdvancedAnalytics
  const profile = await getCurrentProfile(user)
  const courses = await getMyCourses(profile)
  const courseIds = courses.map((c) => c.id)

  const [views, courseViews, leads, clicks] = await Promise.all([
    getProfileViewEvents(profile?.kind === 'brand' ? { brandId: profile.doc.id } : profile?.kind === 'trainer' ? { trainerId: profile.doc.id } : {}),
    getCourseViewEvents(courseIds),
    getLeadsForCourses(courseIds),
    getClickEvents({
      trainerId: profile?.kind === 'trainer' ? profile.doc.id : undefined,
      brandId: profile?.kind === 'brand' ? profile.doc.id : undefined,
      courseIds,
    }),
  ])

  // bucket profile views over the last 12 months
  const now = new Date()
  const buckets: { label: string; count: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({ label: MONTHS[d.getMonth()], count: 0 })
  }
  const startMonth = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  views.forEach((ev) => {
    const d = new Date(ev.created_at)
    const idx = (d.getFullYear() - startMonth.getFullYear()) * 12 + (d.getMonth() - startMonth.getMonth())
    if (idx >= 0 && idx < 12) buckets[idx].count += 1
  })

  // per-course aggregates
  const viewsByCourse = new Map<string, number>()
  courseViews.forEach((ev) => {
    const k = String(ev.payload_course_id)
    viewsByCourse.set(k, (viewsByCourse.get(k) || 0) + 1)
  })
  const clicksByCourse = new Map<string, number>()
  let websiteClicks = 0
  let socialClicks = 0
  clicks.forEach((ev) => {
    if (ev.event_type === 'website_click') websiteClicks++
    if (ev.event_type === 'social_click') socialClicks++
    const k = ev.payload_course_id ? String(ev.payload_course_id) : null
    // website + register clicks on a course count toward its CTR
    if (k && (ev.event_type === 'website_click' || ev.event_type === 'register_click')) {
      clicksByCourse.set(k, (clicksByCourse.get(k) || 0) + 1)
    }
  })
  // trend: net change of course views, last 30 days vs the 30 before that
  const nowMs = Date.now()
  const trendByCourse = new Map<string, number>()
  courseViews.forEach((ev) => {
    const k = String(ev.payload_course_id)
    const t = new Date(ev.created_at).getTime()
    if (t >= nowMs - 30 * DAY) trendByCourse.set(k, (trendByCourse.get(k) || 0) + 1)
    else if (t >= nowMs - 60 * DAY) trendByCourse.set(k, (trendByCourse.get(k) || 0) - 1)
  })

  const topCourses = [...courses]
    .map((c) => ({ ...c, views: viewsByCourse.get(String(c.id)) || 0 }))
    .filter((c) => c.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)

  const nf = (n: number) => n.toLocaleString('nl-BE')
  const hasData = supabaseConfigured() && views.length > 0
  const totalViews = views.length
  const conversion = totalViews > 0 ? `${((leads.length / totalViews) * 100).toFixed(1).replace('.', ',')}%` : '-'

  const cell: React.CSSProperties = { padding: '12px', borderBottom: '1px solid var(--border-hairline)' }

  return (
    <>
      <PageTitle>Analytics</PageTitle>

      <div className="bl-dashboard-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
        <MetricCard
          label="Profielweergaven"
          value={nf(totalViews)}
          info="Het totale aantal keren dat je profiel is bekeken. Elke weergave telt mee — bezoekers worden (nog) niet ontdubbeld tot unieke personen."
        />
        <MetricCard
          label="Opleidingsweergaven"
          value={nf(courseViews.length)}
          info="Het totale aantal keren dat je opleidingspagina's zijn bekeken."
        />
        <MetricCard
          label="Aanvragen"
          value={nf(leads.length)}
          info="Het aantal keer dat bezoekers via je profiel of een opleiding rechtstreeks informatie hebben aangevraagd."
        />
        <MetricCard
          label="Websiteklikken"
          value={nf(websiteClicks)}
          info="Het aantal keer dat bezoekers op je websitelink klikten, op je profiel of op een opleiding."
        />
        <MetricCard
          label="Socialklikken"
          value={nf(socialClicks)}
          info="Het aantal keer dat bezoekers op een van je socialmedialinks (Instagram, Facebook, TikTok) klikten."
        />
        <MetricCard
          label="Conversieratio"
          value={conversion}
          info="Het percentage weergaven dat leidt tot een aanvraag: aanvragen ÷ profielweergaven. Bijvoorbeeld 5 aanvragen op 100 weergaven = 5%."
        />
      </div>

      <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)', margin: 0 }}>
            Profielweergaven
            <InfoTooltip text="Evolutie van je profielweergaven per maand over de laatste 12 maanden. Zo zie je of je zichtbaarheid stijgt of daalt." label="Profielweergaven" />
          </h2>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)' }}>Maandelijks · laatste 12 maanden</span>
        </div>
        {hasData ? (
          <LineChart series={buckets.map((b) => b.count)} labels={buckets.map((b) => b.label)} />
        ) : (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-meta)', margin: 0, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
              Nog geen analytics beschikbaar. Verzamel je eerste 7 dagen aan profielweergaven en kom dan terug voor je grafiek.
            </p>
          </div>
        )}
      </div>

      {/* Populairste opleidingen (analytics #2) */}
      {topCourses.length ? (
        <div style={{ marginTop: 24, background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)', margin: '0 0 4px' }}>
            Populairste opleidingen
            <InfoTooltip text="Je opleidingen gerangschikt op aantal weergaven in de gemeten periode." label="Populairste opleidingen" />
          </h2>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topCourses.map((c, i) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-ui)', fontSize: 14 }}>
                <span style={{ width: 22, height: 22, flex: 'none', borderRadius: '50%', background: 'var(--surface-page)', color: 'var(--text-meta)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{i + 1}</span>
                <span style={{ flex: 1, color: 'var(--text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                <span style={{ color: 'var(--text-meta)' }}>{nf(c.views)} weergaven</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {hasAdvancedAnalytics ? (
        <div style={{ marginTop: 24, background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)', margin: 0 }}>Geavanceerde analytics</h2>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, lineHeight: 1.6, color: 'var(--text-meta)', margin: '6px 0 0' }}>
              Vergelijk prestaties per opleiding: weergaven, aanvragen, CTR en trend.
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-ui)', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-meta)' }}>
                  <th style={cell}>Opleiding</th>
                  <th style={cell}>Weergaven</th>
                  <th style={cell}>Aanvragen</th>
                  <th style={cell}>
                    CTR
                    <InfoTooltip text="Click-through ratio: het percentage weergaven van deze opleiding dat doorklikt naar je website of de inschrijving. Een streepje betekent nog geen weergaven." label="CTR" />
                  </th>
                  <th style={cell}>
                    Trend
                    <InfoTooltip text="Verandering in weergaven van de laatste 30 dagen t.o.v. de 30 dagen daarvoor." label="Trend" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => {
                  const cid = String(course.id)
                  const cv = viewsByCourse.get(cid) || 0
                  const courseLeads = leads.filter((lead) => String(lead.payload_course_id) === cid).length
                  const cc = clicksByCourse.get(cid) || 0
                  const ctr = cv > 0 ? `${((cc / cv) * 100).toFixed(1).replace('.', ',')}%` : '–'
                  const trend = trendByCourse.get(cid) || 0
                  const trendEl = trend > 0
                    ? <span style={{ color: 'var(--status-success)' }}>▲ {trend}</span>
                    : trend < 0
                      ? <span style={{ color: 'var(--status-error)' }}>▼ {Math.abs(trend)}</span>
                      : <span style={{ color: 'var(--text-meta)' }}>–</span>
                  return (
                    <tr key={course.id}>
                      <td style={{ ...cell, color: 'var(--text-strong)' }}>{course.name}</td>
                      <td style={cell}>{nf(cv)}</td>
                      <td style={cell}>{courseLeads}</td>
                      <td style={cell}>{ctr}</td>
                      <td style={cell}>{trendEl}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </>
  )
}
