import React from 'react'
import { redirect } from 'next/navigation'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { WorkspaceForm } from '@/components/dashboard/WorkspaceForm'
import { getCurrentUser, getCurrentProfile, profileName } from '@/lib/session'
import { publicationLimit } from '@/lib/publications'

export const dynamic = 'force-dynamic'

export default async function NewWorkspacePage() {
  const user = await getCurrentUser()
  if (publicationLimit((user || {}) as never, 'workspaces') === 0) redirect('/dashboard/werkruimtes')
  const profile = await getCurrentProfile(user)
  const doc = profile?.doc as { location?: { city?: string; country?: string }; website?: string; email?: string } | undefined
  return (
    <>
      <PageTitle>Nieuwe werkruimte</PageTitle>
      <WorkspaceForm
        defaults={{
          companyName: profileName(profile) || '',
          city: doc?.location?.city || '',
          country: doc?.location?.country === 'nl' ? 'nl' : 'be',
          website: doc?.website || '',
          contactName: (user as { name?: string } | null)?.name || '',
          contactEmail: doc?.email || (user as { email?: string } | null)?.email || '',
        }}
      />
    </>
  )
}
