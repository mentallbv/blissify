import React from 'react'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { VacanciesManager } from '@/components/dashboard/VacanciesManager'
import { ButtonLink } from '@/components/ui'
import { getCurrentUser, getCurrentProfile } from '@/lib/session'
import { getMyVacancies } from '@/lib/dashboard-data'
import { publicationLimit } from '@/lib/publications'

export const dynamic = 'force-dynamic'

export default async function DashboardVacanciesPage() {
  const user = await getCurrentUser()
  const profile = await getCurrentProfile(user)
  const rows = await getMyVacancies(profile)
  const limit = publicationLimit((user || {}) as never, 'vacancies')
  const online = rows.filter((r) => r.status === 'published').length

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <PageTitle>Vacatures</PageTitle>
        {limit > 0 ? (
          <ButtonLink href="/dashboard/vacatures/nieuw" variant="accent" size="sm" icon={<i className="ti ti-plus" />}>Vacature toevoegen</ButtonLink>
        ) : null}
      </div>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)', margin: '-8px 0 20px' }}>
        {limit === 0
          ? 'Met je huidige abonnement kun je geen vacatures plaatsen.'
          : limit === Infinity
            ? `${online} online · onbeperkt met je abonnement`
            : `${online} van ${limit} online met je abonnement`}
      </p>
      {limit === 0 ? (
        <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '56px 40px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-meta)', margin: '0 0 20px' }}>Upgrade naar Partner Premium of Ultimate om vacatures te plaatsen.</p>
          <ButtonLink href="/dashboard/abonnement" variant="primary" size="sm">Bekijk je abonnement</ButtonLink>
        </div>
      ) : rows.length ? (
        <VacanciesManager rows={rows} />
      ) : (
        <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '56px 40px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-meta)', margin: '0 0 20px' }}>Je hebt nog geen vacatures. Plaats je eerste vacature en vind de juiste professional.</p>
          <ButtonLink href="/dashboard/vacatures/nieuw" variant="primary" size="sm">Vacature toevoegen</ButtonLink>
        </div>
      )}
    </>
  )
}
