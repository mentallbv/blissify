import React from 'react'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { WorkspacesManager } from '@/components/dashboard/WorkspacesManager'
import { ButtonLink } from '@/components/ui'
import { getCurrentUser, getCurrentProfile } from '@/lib/session'
import { getMyWorkspaces } from '@/lib/dashboard-data'
import { publicationLimit } from '@/lib/publications'

export const dynamic = 'force-dynamic'

export default async function DashboardWorkspacesPage() {
  const user = await getCurrentUser()
  const profile = await getCurrentProfile(user)
  const rows = await getMyWorkspaces(profile)
  const limit = publicationLimit((user || {}) as never, 'workspaces')
  const online = rows.filter((r) => r.status === 'published').length

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <PageTitle>Werkruimtes</PageTitle>
        {limit > 0 ? (
          <ButtonLink href="/dashboard/werkruimtes/nieuw" variant="accent" size="sm" icon={<i className="ti ti-plus" />}>Werkruimte toevoegen</ButtonLink>
        ) : null}
      </div>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)', margin: '-8px 0 20px' }}>
        {limit === 0
          ? 'Met je huidige abonnement kun je geen werkruimtes aanbieden.'
          : limit === Infinity
            ? `${online} online · onbeperkt met je abonnement`
            : `${online} van ${limit} online met je abonnement`}
      </p>
      {limit === 0 ? (
        <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '56px 40px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-meta)', margin: '0 0 20px' }}>Upgrade naar Partner Premium of Ultimate om werkruimtes aan te bieden.</p>
          <ButtonLink href="/dashboard/abonnement" variant="primary" size="sm">Bekijk je abonnement</ButtonLink>
        </div>
      ) : rows.length ? (
        <WorkspacesManager rows={rows} />
      ) : (
        <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '56px 40px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-meta)', margin: '0 0 20px' }}>Je hebt nog geen werkruimtes. Bied een stoel, behandelruimte of salon aan aan professionals die een werkplek zoeken.</p>
          <ButtonLink href="/dashboard/werkruimtes/nieuw" variant="primary" size="sm">Werkruimte toevoegen</ButtonLink>
        </div>
      )}
    </>
  )
}
