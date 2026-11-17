import React from 'react'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { CopyLink } from '@/components/dashboard/CopyLink'
import { ButtonLink } from '@/components/ui'
import { getCurrentUser, getCurrentProfile } from '@/lib/session'
import { getMyCourses } from '@/lib/dashboard-data'
import { SITE_URL } from '@/lib/email'

export const dynamic = 'force-dynamic'

const text: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.7, color: 'var(--text-body)' }

/** Meeting Nov 2026, item 8: one shareable review link per published opleiding. */
export default async function DashboardReviewsPage() {
  const user = await getCurrentUser()
  const profile = await getCurrentProfile(user)
  const courses = (await getMyCourses(profile)).filter((c) => c.status === 'active')

  return (
    <>
      <PageTitle>Reviews verzamelen</PageTitle>
      <p style={{ ...text, margin: '-8px 0 24px', maxWidth: 660 }}>
        Deel de reviewlink van een opleiding met je deelnemers, bijvoorbeeld in een mail na afloop of via WhatsApp. Ze bevestigen hun review via e-mail en Blissify controleert ze voordat ze op je opleidingspagina verschijnt.
      </p>
      {courses.length === 0 ? (
        <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <p style={{ ...text, margin: 0 }}>Reviews horen bij een opleiding. Zodra je een opleiding online hebt, vind je hier de reviewlink.</p>
          <ButtonLink href="/dashboard/opleidingen" variant="ghost" size="sm">Naar je opleidingen</ButtonLink>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {courses.map((c) => (
            <div key={c.id} style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '18px 20px', display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
                <strong style={{ fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 15, color: 'var(--text-brand)' }}>{c.name}</strong>
                <a href={`/review/${c.id}`} target="_blank" rel="noopener" className="bl-textlink" style={{ fontFamily: 'var(--font-ui)', fontSize: 13 }}>Voorbeeld bekijken</a>
              </div>
              <CopyLink url={`${SITE_URL}/review/${c.id}`} />
            </div>
          ))}
        </div>
      )}
    </>
  )
}
