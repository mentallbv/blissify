import React from 'react'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { LineChart } from '@/components/dashboard/LineChart'
import { MetricCard } from '@/components/ui'
import { InfoTooltip } from '@/components/site/InfoTooltip'
import { getCurrentUser, getCurrentProfile } from '@/lib/session'
import { getMyCourses, getMyVacancies, getMyWorkspaces } from '@/lib/dashboard-data'
import { getProfileViewEvents, getCourseViewEvents, getVacancyViewEvents, getWorkspaceViewEvents, getClickEvents, getLeadsForCourses, supabaseConfigured } from '@/lib/supabase'
import { tierForUser } from '@/lib/tier-features'
import { countConversions, conversionRate } from '@/lib/conversion'
import { PERIODS, parsePeriod, inPeriod, periodLabels, periodSeries } from '@/lib/analytics-period'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const DAY = 86_400_000

export default async function DashboardAnalyticsPage({ searchParams }: { searchParams: Promise<{ periode?: string }> }) {
  const period = parsePeriod((await searchParams).periode)
  const periodInfo = PERIODS.find((x) => x.id === period)!
  const user = await getCurrentUser()
  const entitlement = user ? tierForUser(user) : null
  if (!user || !entitlement?.features.hasAnalytics) redirect('/dashboard/abonnement')
  const hasAdvancedAnalytics = entitlement.features.hasAdvancedAnalytics
  const profile = await getCurrentProfile(user)
  const courses = await getMyCourses(profile)
  const courseIds = courses.map((c) => c.id)
  const [myVacancies, myWorkspaces] = hasAdvancedAnalytics ? await Promise.all([getMyVacancies(profile), getMyWorkspaces(profile)]) : [[], []]

  const ownerRef = profile?.kind === 'brand' ? { brandId: profile.doc.id } : profile?.kind === 'trainer' ? { trainerId: profile.doc.id } : {}
  const [allViews, allCourseViews, allLeads, allClicks, allVacancyViews, allWorkspaceViews] = await Promise.all([
    getProfileViewEvents(profile?.kind === 'brand' ? { brandId: profile.doc.id } : profile?.kind === 'trainer' ? { trainerId: profile.doc.id } : {}),
    getCourseViewEvents(courseIds),
    getLeadsForCourses(courseIds),
    getClickEvents({
      trainerId: profile?.kind === 'trainer' ? profile.doc.id : undefined,
      brandId: profile?.kind === 'brand' ? profile.doc.id : undefined,
      courseIds,
    }),
    getVacancyViewEvents(ownerRef),
    getWorkspaceViewEvents(ownerRef),
  ])
  // Werkruimte contact requests are stored as leads keyed "workspace:<id>"; vacatures store none (applicants mail the poster directly).
  const allWorkspaceLeads = await getLeadsForCourses(myWorkspaces.map((w) => `workspace:${w.id}`))

  // Item 11: every figure follows the chosen period; trends always compare the last 30 days with the 30 before.
  const now = new Date()
  const views = inPeriod(allViews, period, now)
  const courseViews = inPeriod(allCourseViews, period, now)
  const leads = inPeriod(allLeads, period, now)
  const clicks = inPeriod(allClicks, period, now)
  const vacancyViews = inPeriod(allVacancyViews, period, now)
  const workspaceViews = inPeriod(allWorkspaceViews, period, now)
  const workspaceLeads = inPeriod(allWorkspaceLeads, period, now)

  // charts: views of the profile + opleidingen, and conversions (website/inschrijven clicks + sent forms)
  const conversionEvents = [...new Map(clicks.filter((c) => c.event_type === 'website_click' || c.event_type === 'register_click').map((c) => [c.id, c])).values()]
  const labels = periodLabels(period, [...allViews, ...allCourseViews, ...allLeads, ...allClicks].map((r) => r.created_at), now)
  const viewSeries = periodSeries([...views, ...courseViews], period, labels, now)
  const conversionSeries = periodSeries([...conversionEvents, ...leads], period, labels, now)

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
  allCourseViews.forEach((ev) => {
    const k = String(ev.payload_course_id)
    const t = new Date(ev.created_at).getTime()
    if (t >= nowMs - 30 * DAY) trendByCourse.set(k, (trendByCourse.get(k) || 0) + 1)
    else if (t >= nowMs - 60 * DAY) trendByCourse.set(k, (trendByCourse.get(k) || 0) - 1)
  })

  // Round 4 (3.3): the same per-item view, for vacatures and werkruimtes. Their events carry "vacancy:<id>" / "workspace:<id>".
  const perItem = (events: typeof courseViews, all: typeof courseViews) => {
    const total = new Map<string, number>()
    const trend = new Map<string, number>()
    events.forEach((ev) => {
      const k = String(ev.payload_course_id)
      total.set(k, (total.get(k) || 0) + 1)
    })
    all.forEach((ev) => {
      const k = String(ev.payload_course_id)
      const t = new Date(ev.created_at).getTime()
      if (t >= nowMs - 30 * DAY) trend.set(k, (trend.get(k) || 0) + 1)
      else if (t >= nowMs - 60 * DAY) trend.set(k, (trend.get(k) || 0) - 1)
    })
    return { total, trend }
  }
  const vacStats = perItem(vacancyViews, allVacancyViews)
  const wsStats = perItem(workspaceViews, allWorkspaceViews)
  const wsLeads = new Map<string, number>()
  workspaceLeads.forEach((l) => wsLeads.set(String(l.payload_course_id), (wsLeads.get(String(l.payload_course_id)) || 0) + 1))
  const itemTables = [
    { title: 'Per vacature', col: 'Vacature', withLeads: false, rows: myVacancies.map((v) => ({ id: v.id, name: v.title, key: `vacancy:${v.id}` })), stats: vacStats },
    { title: 'Per werkruimte', col: 'Werkruimte', withLeads: true, rows: myWorkspaces.map((w) => ({ id: w.id, name: w.title, key: `workspace:${w.id}` })), stats: wsStats },
  ].filter((t) => t.rows.length > 0)

  const topCourses = [...courses]
    .map((c) => ({ ...c, views: viewsByCourse.get(String(c.id)) || 0 }))
    .filter((c) => c.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)

  const nf = (n: number) => n.toLocaleString('nl-BE')
  const hasData = supabaseConfigured() && allViews.length + allCourseViews.length > 0
  const totalViews = views.length
  const conversions = countConversions(clicks, leads.length)
  const conversion = conversionRate(conversions, totalViews + courseViews.length)

  const cell: React.CSSProperties = { padding: '12px', borderBottom: '1px solid var(--border-hairline)' }
  const trendCell = (trend: number) => trend > 0
    ? <span style={{ color: 'var(--status-success)' }}>▲ {trend}</span>
    : trend < 0
      ? <span style={{ color: 'var(--status-error)' }}>▼ {Math.abs(trend)}</span>
      : <span style={{ color: 'var(--text-meta)' }}>–</span>

  return (
    <>
      <PageTitle>Analytics</PageTitle>
      {/* Item 11: period filter. Round 4 (3.2): say which period each figure covers. */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', margin: '-8px 0 20px' }}>
        <nav aria-label="Periode" className="bl-period-tabs">
          {PERIODS.map((x) => (
            <a key={x.id} href={x.id === 'maand' ? '/dashboard/analytics' : `/dashboard/analytics?periode=${x.id}`} aria-current={x.id === period ? 'page' : undefined} className={x.id === period ? 'is-active' : undefined}>
              {x.label}
            </a>
          ))}
        </nav>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, lineHeight: 1.6, color: 'var(--text-meta)', margin: 0, maxWidth: 560 }}>
          Alle cijfers gelden voor {periodInfo.note}. De trend vergelijkt altijd de laatste 30 dagen met de 30 dagen daarvoor.
        </p>
      </div>

      <div className="bl-dashboard-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
        <MetricCard
          label={"Profiel\u00ADweergaven"}
          value={nf(totalViews)}
          info="Het aantal keren dat je profiel is bekeken."
        />
        <MetricCard
          label={"Opleidings\u00ADweergaven"}
          value={nf(courseViews.length)}
          info="Het aantal keren dat je opleidingspagina's zijn bekeken."
        />
        <MetricCard
          label={"Vacature\u00ADweergaven"}
          value={nf(vacancyViews.length)}
          info="Het aantal keren dat je vacaturepagina's zijn bekeken."
        />
        <MetricCard
          label={"Werkruimte\u00ADweergaven"}
          value={nf(workspaceViews.length)}
          info="Het aantal keren dat je werkruimtepagina's zijn bekeken."
        />
        <MetricCard
          label="Aanvragen"
          value={nf(leads.length)}
          info="Het aantal keer dat bezoekers via je profiel of een opleiding rechtstreeks informatie hebben aangevraagd."
        />
        <MetricCard
          label={"Website\u00ADklikken"}
          value={nf(websiteClicks)}
          info="Het aantal keer dat bezoekers op je websitelink klikten, op je profiel of op een opleiding."
        />
        <MetricCard
          label={"Social\u00ADklikken"}
          value={nf(socialClicks)}
          info="Het aantal keer dat bezoekers op een van je socialmedialinks (Instagram, Facebook, TikTok) klikten."
        />
        <MetricCard
          label={"Conversie\u00ADratio"}
          value={conversion}
          info={`Het percentage weergaven dat leidt tot een conversie. Een conversie is een klik naar je website of inschrijvingslink, of een verstuurd contactformulier (${nf(conversions)} in deze periode). Berekening: conversies ÷ weergaven van je profiel en opleidingen. Bijvoorbeeld 5 conversies op 100 weergaven = 5%.`}
        />
      </div>

      <div className="bl-analytics-charts">
        {[
          { title: 'Weergaven', series: viewSeries, info: 'Hoe vaak je profiel en je opleidingspagina\'s samen werden bekeken. Zo zie je of je zichtbaarheid stijgt of daalt.' },
          { title: 'Conversies', series: conversionSeries, info: 'Klikken naar je website of inschrijvingslink en verstuurde contactformulieren.' },
        ].map((c) => (
          <div key={c.title} style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 24, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)', margin: 0 }}>
                {c.title}
                <InfoTooltip text={c.info} label={c.title} />
              </h2>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)', textAlign: 'right' }}>{periodInfo.label} · {periodInfo.note}</span>
            </div>
            {hasData ? (
              <LineChart series={c.series} labels={labels} />
            ) : (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-meta)', margin: '0 auto', maxWidth: 460 }}>
                  Nog geen gegevens. Zodra bezoekers je profiel en opleidingen bekijken, verschijnt hier je grafiek.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Populairste opleidingen (analytics #2) */}
      {topCourses.length ? (
        <div style={{ marginTop: 24, background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)', margin: '0 0 4px' }}>
            Populairste opleidingen
            <InfoTooltip text="Je opleidingen gerangschikt op aantal weergaven in de gekozen periode." label="Populairste opleidingen" />
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
              Vergelijk prestaties per opleiding, vacature en werkruimte: weergaven, aanvragen, CTR en trend.
            </p>
          </div>
          <div className="bl-analytics-table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-ui)', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-meta)' }}>
                  <th style={cell}>Opleiding</th>
                  <th style={cell}>Weergaven</th>
                  <th style={cell}>Aanvragen</th>
                  <th style={cell}>
                    CTR
                    <InfoTooltip text="Click-through ratio: het percentage weergaven van deze opleiding dat doorklikt naar je website of de inschrijving. Een streepje betekent nog geen weergaven." label="CTR" placement="below" />
                  </th>
                  <th style={cell}>
                    Trend
                    <InfoTooltip text="Verandering in weergaven van de laatste 30 dagen t.o.v. de 30 dagen daarvoor." label="Trend" placement="below" align="end" />
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
          {itemTables.map((t) => (
            <div key={t.title} style={{ marginTop: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 18, color: 'var(--text-brand)', margin: '0 0 8px' }}>{t.title}</h3>
              <div className="bl-analytics-table-scroll">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-ui)', fontSize: 13 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--text-meta)' }}>
                      <th style={cell}>{t.col}</th>
                      <th style={cell}>Weergaven</th>
                      {t.withLeads ? <th style={cell}>Aanvragen</th> : null}
                      <th style={cell}>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {t.rows.map((r) => (
                      <tr key={r.id}>
                        <td style={{ ...cell, color: 'var(--text-strong)' }}>{r.name}</td>
                        <td style={cell}>{nf(t.stats.total.get(r.key) || 0)}</td>
                        {t.withLeads ? <td style={cell}>{wsLeads.get(r.key) || 0}</td> : null}
                        <td style={cell}>{trendCell(t.stats.trend.get(r.key) || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </>
  )
}
