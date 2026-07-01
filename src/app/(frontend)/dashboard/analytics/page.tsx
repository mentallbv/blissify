import React from 'react'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { LineChart } from '@/components/dashboard/LineChart'
import { MetricCard } from '@/components/ui'
import { getCurrentUser, getCurrentProfile } from '@/lib/session'
import { getMyCourses } from '@/lib/dashboard-data'
import { getProfileViewEvents, getLeadsForCourses, supabaseConfigured } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']

export default async function DashboardAnalyticsPage() {
  const user = await getCurrentUser()
  const profile = await getCurrentProfile(user)
  const courses = await getMyCourses(profile)

  const views = await getProfileViewEvents(
    profile?.kind === 'brand' ? { brandId: profile.doc.id } : profile?.kind === 'trainer' ? { trainerId: profile.doc.id } : {},
  )
  const leads = await getLeadsForCourses(courses.map((c) => c.id))

  // bucket last 12 months
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

  const hasData = supabaseConfigured() && views.length > 0
  const conversion = views.length > 0 ? `${((leads.length / views.length) * 100).toFixed(1).replace('.', ',')}%` : '-'

  return (
    <>
      <PageTitle>Analytics</PageTitle>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <MetricCard label="Profielweergaven" value={views.length.toLocaleString('nl-BE')} />
        <MetricCard label="Aanvragen" value={leads.length.toLocaleString('nl-BE')} />
        <MetricCard label="Actieve opleidingen" value={String(courses.filter((c) => c.status === 'active').length)} />
        <MetricCard label="Conversieratio" value={conversion} />
      </div>

      <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)', margin: 0 }}>Profielweergaven</h2>
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
    </>
  )
}
