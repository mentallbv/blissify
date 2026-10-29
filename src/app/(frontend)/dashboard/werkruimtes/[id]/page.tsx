import React from 'react'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { WorkspaceForm } from '@/components/dashboard/WorkspaceForm'
import { getCurrentUser, getCurrentProfile } from '@/lib/session'
import { workspaceToForm } from '@/lib/workspace-form'

export const dynamic = 'force-dynamic'

export default async function EditWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  const profile = await getCurrentProfile(user)
  if (!profile) notFound()
  const payload = await getPayload({ config: await config })
  const doc = await payload.findByID({ collection: 'workspaces', id, depth: 1, overrideAccess: true }).catch(() => null)
  const ownerId = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : v)
  const owns = doc && (profile.kind === 'brand' ? ownerId(doc.brand) === profile.doc.id : ownerId(doc.trainer) === profile.doc.id)
  if (!doc || !owns) notFound()
  return (
    <>
      <PageTitle>Werkruimte bewerken</PageTitle>
      <WorkspaceForm workspaceId={doc.id} initial={workspaceToForm(doc as never)} />
    </>
  )
}
