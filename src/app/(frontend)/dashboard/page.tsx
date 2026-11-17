import React from 'react'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { CourseTable } from '@/components/dashboard/CourseTable'
import { MetricCard, ButtonLink } from '@/components/ui'
import { SubscriptionBanner } from '@/components/dashboard/SubscriptionActions'
import { getCurrentUser, getCurrentProfile, profileName } from '@/lib/session'
import { getMyCourses, getMyCourseCounts, getMyVacancies, getMyWorkspaces } from '@/lib/dashboard-data'
import { VacanciesManager } from '@/components/dashboard/VacanciesManager'
import { WorkspacesManager } from '@/components/dashboard/WorkspacesManager'
import { getLeadsForCourses, getProfileViewEvents, getCourseViewEvents, getClickEvents } from '@/lib/supabase'
import { countConversions, conversionRate } from '@/lib/conversion'
import { isEntitled } from '@/lib/entitlement'
import { tierForUser } from '@/lib/tier-features'
import { publicationLimit } from '@/lib/publications'

export const dynamic = 'force-dynamic'

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser()
  const profile = await getCurrentProfile(user)
  const name = profileName(profile)
  const sub = user as {
    role?: string
    subscriptionStatus?: string
    subscriptionExpiresAt?: string
    subscriptionTier?: string
    brandTier?: string
  } | null
  const canAddCourse = !(sub?.role === 'brand' && (sub.brandTier || 'partner_listing') === 'partner_listing')

  const [courses, counts, vacancies, workspaces] = await Promise.all([getMyCourses(profile), getMyCourseCounts(profile), getMyVacancies(profile), getMyWorkspaces(profile)])
  const vacancyLimit = publicationLimit((user || {}) as never, 'vacancies')
  const workspaceLimit = publicationLimit((user || {}) as never, 'workspaces')
  // Round 4 (1.1): vacatures and werkruimtes sit next to the opleidingen, for plans that allow them.
  const pubSections = [
    { show: vacancyLimit > 0 || vacancies.length > 0, title: 'Jouw vacatures', href: '/dashboard/vacatures', more: 'Beheer alle vacatures', empty: 'Je hebt nog geen vacatures.', add: '/dashboard/vacatures/nieuw', cta: 'Vacature toevoegen', list: <VacanciesManager rows={vacancies.slice(0, 4)} />, count: vacancies.length },
    { show: workspaceLimit > 0 || workspaces.length > 0, title: 'Jouw werkruimtes', href: '/dashboard/werkruimtes', more: 'Beheer alle werkruimtes', empty: 'Je hebt nog geen werkruimtes.', add: '/dashboard/werkruimtes/nieuw', cta: 'Werkruimte toevoegen', list: <WorkspacesManager rows={workspaces.slice(0, 4)} />, count: workspaces.length },
  ].filter((x) => x.show)
  const courseIds = courses.map((c) => c.id)
  const leads = await getLeadsForCourses(courseIds)
  // Statistics (views, request counts, conversion) are a Premium+ perk: Lite sees none.
  const hasAnalytics = tierForUser(sub || {}).features.hasAnalytics
  const ownerRef = profile?.kind === 'brand' ? { brandId: profile.doc.id } : profile?.kind === 'trainer' ? { trainerId: profile.doc.id } : {}
  const [views, courseViews, clicks] = hasAnalytics
    ? await Promise.all([getProfileViewEvents(ownerRef), getCourseViewEvents(courseIds), getClickEvents({ ...ownerRef, courseIds })])
    : [[], [], []]

  // enquiries per course
  const perCourse = new Map<string, number>()
  leads.forEach((l) => perCourse.set(l.payload_course_id, (perCourse.get(l.payload_course_id) || 0) + 1))
  const rows = courses
    .map((c) => ({
      ...c,
      enquiries: perCourse.get(String(c.id)) || 0,
      editHref: `/dashboard/opleidingen/${c.id}`,
      viewHref: `/opleidingen/${c.categorySlug}/${c.slug}`,
    }))
    .sort((a, b) => b.enquiries - a.enquiries)

  const viewCount = views.length
  const leadCount = leads.length
  const conversion = conversionRate(countConversions(clicks, leadCount), viewCount + courseViews.length)

  return (
    <>
      <SubscriptionBanner
        status={sub?.subscriptionStatus || 'inactive'}
        entitledUntil={isEntitled(sub) ? sub?.subscriptionExpiresAt || null : null}
        tier={sub?.role === 'brand' ? sub.brandTier || 'partner_listing' : sub?.subscriptionTier || 'basis'}
      />

      <div className="bl-dashboard-heading-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <PageTitle>Goedemorgen, {name}.</PageTitle>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {canAddCourse ? (
            <ButtonLink href="/dashboard/opleidingen/nieuw" variant="accent" size="sm" icon={<i className="ti ti-plus" />}>Opleiding</ButtonLink>
          ) : null}
          {vacancyLimit > 0 ? (
            <ButtonLink href="/dashboard/vacatures/nieuw" variant="ghost" size="sm" icon={<i className="ti ti-plus" />}>Vacature</ButtonLink>
          ) : null}
          {workspaceLimit > 0 ? (
            <ButtonLink href="/dashboard/werkruimtes/nieuw" variant="ghost" size="sm" icon={<i className="ti ti-plus" />}>Werkruimte</ButtonLink>
          ) : null}
        </div>
      </div>

      {hasAnalytics ? (
        <div className="bl-dashboard-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
          <MetricCard label="Profielweergaven" value={viewCount.toLocaleString('nl-BE')} change="0% t.o.v. vorige maand" />
          <MetricCard label="Aanvragen" value={leadCount.toLocaleString('nl-BE')} change={`${leadCount} totaal`} />
          <MetricCard label="Actieve opleidingen" value={String(counts.active)} change={`${counts.total} totaal`} />
          <MetricCard label="Conversieratio" value={conversion} change="klikken + formulieren ÷ weergaven" featured />
        </div>
      ) : (
        <div className="bl-dashboard-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
          <MetricCard label="Actieve opleidingen" value={String(counts.active)} change={`${counts.total} totaal`} />
          <div style={{ gridColumn: 'span 3', background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.6, color: 'var(--text-body)', margin: 0, maxWidth: 460 }}>
              Statistieken zoals profielweergaven, aanvragen en conversieratio zijn beschikbaar vanaf Premium.
            </p>
            <ButtonLink href="/dashboard/abonnement" variant="ghost" size="sm">
              Bekijk je abonnement
            </ButtonLink>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--text-brand)', margin: 0 }}>
          Jouw opleidingen
        </h2>
        <a href="/dashboard/opleidingen" className="bl-textlink">
          Beheer alle opleidingen
        </a>
      </div>
      {rows.length ? (
        <CourseTable rows={rows} limit={4} showEnquiries={hasAnalytics} />
      ) : (
        <EmptyCard
          text={
            canAddCourse
              ? 'Je hebt nog geen opleidingen. Voeg je eerste opleiding toe om aanvragen te ontvangen.'
              : 'Met Partner Lite kun je je merk professioneel presenteren, maar geen opleidingen publiceren. Upgrade naar Partner Premium of Ultimate om opleidingen toe te voegen.'
          }
          href={canAddCourse ? '/dashboard/opleidingen/nieuw' : undefined}
          cta={canAddCourse ? 'Opleiding toevoegen' : undefined}
        />
      )}

      {pubSections.map((p) => (
        <React.Fragment key={p.title}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: '40px 0 16px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--text-brand)', margin: 0 }}>{p.title}</h2>
            <a href={p.href} className="bl-textlink">{p.more}</a>
          </div>
          {p.count ? p.list : <EmptyCard text={p.empty} href={p.add} cta={p.cta} />}
        </React.Fragment>
      ))}

      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--text-brand)', margin: '40px 0 16px' }}>
        Recente aanvragen
      </h2>
      {leads.length ? (
        <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)' }}>
          {leads.slice(0, 5).map((e, i) => (
            <div
              key={e.id}
              style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: i < Math.min(leads.length, 5) - 1 ? '0.5px solid var(--border-hairline)' : 'none' }}
            >
              <span style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--surface-soft)', boxShadow: 'inset 0 0 0 1px rgba(90, 105, 124, 0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 17, color: 'var(--palette-slate-ink)' }}>
                {e.name[0]}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 14, color: 'var(--text-strong)' }}>{e.name}</div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-body)' }}>{e.email}</div>
              </div>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)' }}>{new Date(e.created_at).toLocaleDateString('nl-BE')}</span>
              {!e.read ? (
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-accent)', width: 80, textAlign: 'right' }}>Nieuw</span>
              ) : (
                <span style={{ width: 80 }} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyCard text="Nog geen aanvragen. Zodra cursisten je opleidingen ontdekken, verschijnen hun aanvragen hier." />
      )}
    </>
  )
}

function EmptyCard({ text, href, cta }: { text: string; href?: string; cta?: string }) {
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: '0.5px solid var(--border-hairline)',
        borderRadius: 'var(--radius-md)',
        padding: '72px 48px',
        minHeight: 340,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-meta)', margin: href ? '0 0 20px' : 0, maxWidth: 460 }}>
        {text}
      </p>
      {href && cta ? (
        <ButtonLink href={href} variant="primary" size="sm">
          {cta}
        </ButtonLink>
      ) : null}
    </div>
  )
}
