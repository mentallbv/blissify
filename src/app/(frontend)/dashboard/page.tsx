import React from 'react'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { CourseTable } from '@/components/dashboard/CourseTable'
import { MetricCard, ButtonLink } from '@/components/ui'
import { getCurrentUser, getCurrentProfile, profileName } from '@/lib/session'
import { getMyCourses, getMyCourseCounts } from '@/lib/dashboard-data'
import { getLeadsForCourses, getProfileViewEvents } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser()
  const profile = await getCurrentProfile(user)
  const name = profileName(profile)

  const [courses, counts] = await Promise.all([getMyCourses(profile), getMyCourseCounts(profile)])
  const courseIds = courses.map((c) => c.id)
  const leads = await getLeadsForCourses(courseIds)
  const views = await getProfileViewEvents(
    profile?.kind === 'brand' ? { brandId: profile.doc.id } : profile?.kind === 'trainer' ? { trainerId: profile.doc.id } : {},
  )

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
  const conversion = viewCount > 0 ? `${((leadCount / viewCount) * 100).toFixed(1).replace('.', ',')}%` : '-'

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <PageTitle>Goedemorgen, {name}.</PageTitle>
        <ButtonLink href="/dashboard/opleidingen/nieuw" variant="accent" size="sm" icon={<i className="ti ti-plus" />}>
          Opleiding toevoegen
        </ButtonLink>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
        <MetricCard label="Profielweergaven" value={viewCount.toLocaleString('nl-BE')} change="0% t.o.v. vorige maand" />
        <MetricCard label="Aanvragen" value={leadCount.toLocaleString('nl-BE')} change={`${leadCount} totaal`} />
        <MetricCard label="Actieve opleidingen" value={String(counts.active)} change={`${counts.total} totaal`} />
        <MetricCard label="Conversieratio" value={conversion} change="leads ÷ weergaven" featured />
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--text-brand)', margin: 0 }}>
          Jouw opleidingen
        </h2>
        <a href="/dashboard/opleidingen" className="bl-textlink">
          Beheer alle opleidingen
        </a>
      </div>
      {rows.length ? (
        <CourseTable rows={rows} limit={4} />
      ) : (
        <EmptyCard text="Je hebt nog geen opleidingen. Voeg je eerste opleiding toe om aanvragen te ontvangen." href="/dashboard/opleidingen/nieuw" cta="Opleiding toevoegen" />
      )}

      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--text-brand)', margin: '40px 0 16px' }}>
        Recente aanvragen
      </h2>
      {leads.length ? (
        <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 8 }}>
          {leads.slice(0, 5).map((e, i) => (
            <div
              key={e.id}
              style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: i < Math.min(leads.length, 5) - 1 ? '0.5px solid var(--border-hairline)' : 'none' }}
            >
              <span style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--surface-dark)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 16, color: 'var(--blissify-chalk)' }}>
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
    <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 8, padding: 32, textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-meta)', margin: href ? '0 0 20px' : 0, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
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
