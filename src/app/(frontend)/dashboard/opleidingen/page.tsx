import React from 'react'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { CoursesManager } from '@/components/dashboard/CoursesManager'
import { ButtonLink } from '@/components/ui'
import { getCurrentUser, getCurrentProfile } from '@/lib/session'
import { getMyCourses } from '@/lib/dashboard-data'

export const dynamic = 'force-dynamic'

export default async function DashboardCoursesPage() {
  const user = await getCurrentUser()
  const account = user as { role?: string; brandTier?: string } | null
  const canAddCourse = !(account?.role === 'brand' && (account.brandTier || 'partner_listing') === 'partner_listing')
  const profile = await getCurrentProfile(user)
  const courses = await getMyCourses(profile)
  const rows = courses.map((c) => ({
    ...c,
    editHref: `/dashboard/opleidingen/${c.id}`,
    viewHref: `/opleidingen/${c.categorySlug}/${c.slug}`,
  }))

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <PageTitle>Opleidingen</PageTitle>
        {canAddCourse ? (
          <ButtonLink href="/dashboard/opleidingen/nieuw" variant="accent" size="sm" icon={<i className="ti ti-plus" />}>
            Opleiding toevoegen
          </ButtonLink>
        ) : null}
      </div>
      {rows.length ? (
        <CoursesManager rows={rows} />
      ) : (
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
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-meta)', margin: canAddCourse ? '0 0 20px' : 0, maxWidth: 460 }}>
            {canAddCourse
              ? 'Je hebt nog geen opleidingen aangemaakt.'
              : 'Met Partner Listing kun je je merk presenteren, maar geen opleidingen publiceren. Upgrade naar Partner Professional of Premium om opleidingen toe te voegen.'}
          </p>
          {canAddCourse ? (
            <ButtonLink href="/dashboard/opleidingen/nieuw" variant="primary" size="sm">
              Maak je eerste opleiding
            </ButtonLink>
          ) : null}
        </div>
      )}
    </>
  )
}
