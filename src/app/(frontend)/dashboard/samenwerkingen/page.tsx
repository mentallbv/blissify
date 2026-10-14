import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { CollaborationsManager } from '@/components/dashboard/CollaborationsManager'
import { getCurrentUser, getCurrentProfile } from '@/lib/session'
import { brandOwnerCanCollaborate, listCollaborationsFor } from '@/lib/collaborations'

export const dynamic = 'force-dynamic'

/** Samenwerkingen opleider ↔ merk (client round 2, section 5). */
export default async function DashboardCollaborationsPage() {
  const user = await getCurrentUser()
  const profile = await getCurrentProfile(user)
  if (!profile) {
    return (
      <>
        <PageTitle>Samenwerkingen</PageTitle>
        <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-meta)' }}>Geen profiel gevonden.</p>
      </>
    )
  }
  const payload = await getPayload({ config: await config })
  const owner = profile.kind === 'brand' ? { brand: Number(profile.doc.id) } : { trainer: Number(profile.doc.id) }
  const rows = await listCollaborationsFor(payload, owner)
  const canInvite = profile.kind === 'brand' && brandOwnerCanCollaborate(user as never)

  return (
    <>
      <PageTitle>Samenwerkingen</PageTitle>
      <CollaborationsManager role={profile.kind} canInvite={canInvite} initialRows={rows} />
    </>
  )
}
