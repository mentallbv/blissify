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
    role: profile?.kind || 'trainer',
    name: profile ? (profile.kind === 'brand' ? profile.doc.name : profile.doc.displayName) : '',
    city: (doc as { location?: { city?: string } } | undefined)?.location?.city || '',
    website: (doc as { website?: string } | undefined)?.website || '',
    email: (doc as { email?: string } | undefined)?.email || '',
    phone: (doc as { phone?: string } | undefined)?.phone || '',
    about: profile ? lexicalToText(profile.kind === 'brand' ? profile.doc.description : profile.doc.bio) : '',
    partnerType: profile?.kind === 'brand' ? profile.doc.typePartner || '' : '',
    origin: profile?.kind === 'brand' ? profile.doc.herkomst || '' : '',
    instagram: (doc as { social?: { instagram?: string } } | undefined)?.social?.instagram || '',
    facebook: (doc as { social?: { facebook?: string } } | undefined)?.social?.facebook || '',
    tiktok: (doc as { social?: { tiktok?: string } } | undefined)?.social?.tiktok || '',
    localPartners: profile?.kind === 'brand'
      ? ((profile.doc as typeof profile.doc & { localPartners?: { name: string; country: string; website?: string }[] }).localPartners || []).map((partner) => ({
          name: partner.name,
          country: partner.country,
          website: partner.website || '',
        }))
      : [],
  }

  return (
    <>
      <PageTitle>Profiel</PageTitle>
      <ProfileForm initial={initial} />
    </>
  )
}
