import React from 'react'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { ProfileForm } from '@/components/dashboard/ProfileForm'
import { getCurrentUser, getCurrentProfile } from '@/lib/session'

export const dynamic = 'force-dynamic'

function lexicalToText(rt: unknown): string {
  try {
    const root = (rt as { root?: { children?: unknown[] } })?.root
    if (!root?.children) return ''
    const parts: string[] = []
    const walk = (nodes: unknown[]) => {
      for (const n of nodes) {
        const node = n as { text?: string; children?: unknown[] }
        if (node.text) parts.push(node.text)
        if (node.children) walk(node.children)
      }
    }
    walk(root.children)
    return parts.join(' ').trim()
  } catch {
    return ''
  }
}

export default async function DashboardProfilePage() {
  const user = await getCurrentUser()
  const profile = await getCurrentProfile(user)

  const doc = profile?.doc
  const initial = {
    name: profile ? (profile.kind === 'brand' ? profile.doc.name : profile.doc.displayName) : '',
    city: (doc as { location?: { city?: string } } | undefined)?.location?.city || '',
    website: (doc as { website?: string } | undefined)?.website || '',
    email: (doc as { email?: string } | undefined)?.email || '',
    phone: (doc as { phone?: string } | undefined)?.phone || '',
    about: profile ? lexicalToText(profile.kind === 'brand' ? profile.doc.description : profile.doc.bio) : '',
  }

  return (
    <>
      <PageTitle>Profiel</PageTitle>
      <ProfileForm initial={initial} />
    </>
  )
}
