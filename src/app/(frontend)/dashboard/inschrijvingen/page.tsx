import React from 'react'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { getCurrentUser, getCurrentProfile } from '@/lib/session'
import { getMyCourses } from '@/lib/dashboard-data'
import { getRegistrationsForCourses, type Registration } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const meta = { fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)' } as const

function EmptyNotice({ text }: { text: string }) {
  return (
    <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '72px 48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-meta)', margin: 0, maxWidth: 420 }}>{text}</p>
    </div>
  )
}

export default async function DashboardRegistrationsPage() {
  const user = await getCurrentUser()
  const u = user as { role?: string; brandTier?: string } | null
  const eligible = u?.role === 'brand' && (u.brandTier === 'partner_professional' || u.brandTier === 'partner_premium')

  if (!eligible) {
    return (
      <>
        <PageTitle>Inschrijvingen</PageTitle>
        <EmptyNotice text="In-platform inschrijvingen zijn beschikbaar voor Merken & Leveranciers met een Partner Professional- of Partner Premium-abonnement." />
      </>
    )
  }

  const profile = await getCurrentProfile(user)
  const courses = await getMyCourses(profile)
  const titleById = new Map(courses.map((c) => [String(c.id), c.name]))
  const registrations = await getRegistrationsForCourses(courses.map((c) => c.id))

  // Group by course.
  const byCourse = new Map<string, Registration[]>()
  registrations.forEach((r) => {
    const arr = byCourse.get(r.payload_course_id) || []
    arr.push(r)
    byCourse.set(r.payload_course_id, arr)
  })

  return (
    <>
      <PageTitle>Inschrijvingen</PageTitle>
      {byCourse.size === 0 ? (
        <EmptyNotice text="Nog geen inschrijvingen. Zodra cursisten zich inschrijven voor je opleidingen, verschijnen ze hier." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {[...byCourse.entries()].map(([courseId, regs]) => (
            <div key={courseId} style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '16px 20px', borderBottom: '0.5px solid var(--border-hairline)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 18, color: 'var(--text-brand)' }}>
                  {titleById.get(courseId) || 'Opleiding'}
                </span>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 13, color: 'var(--text-accent)' }}>
                  {regs.length} {regs.length === 1 ? 'inschrijving' : 'inschrijvingen'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.4fr 1fr auto auto', gap: 0 }}>
                {['Naam', 'E-mail', 'Telefoon', 'Deelnemers', 'Datum'].map((h) => (
                  <div key={h} style={{ ...meta, fontWeight: 'var(--fw-ui-medium)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11, padding: '12px 20px', background: 'var(--surface-page)' }}>{h}</div>
                ))}
                {regs.map((r) => (
                  <React.Fragment key={r.id}>
                    <div style={{ padding: '14px 20px', borderTop: '0.5px solid var(--border-hairline)', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-strong)' }}>{r.name}</div>
                    <div style={{ padding: '14px 20px', borderTop: '0.5px solid var(--border-hairline)', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-body)' }}>{r.email}</div>
                    <div style={{ padding: '14px 20px', borderTop: '0.5px solid var(--border-hairline)', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-body)' }}>{r.phone || '-'}</div>
                    <div style={{ padding: '14px 20px', borderTop: '0.5px solid var(--border-hairline)', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-body)', textAlign: 'center' }}>{r.participant_count ?? '-'}</div>
                    <div style={{ padding: '14px 20px', borderTop: '0.5px solid var(--border-hairline)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)', whiteSpace: 'nowrap' }}>{new Date(r.created_at).toLocaleDateString('nl-BE')}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
