import React from 'react'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { ProfileForm } from '@/components/dashboard/ProfileForm'
import { getCurrentUser, getCurrentProfile } from '@/lib/session'
import { lexicalToHtml } from '@/lib/richtext'
import { tierForUser } from '@/lib/tier-features'
import type { UploadedImage } from '@/components/dashboard/ImageUploadField'

export const dynamic = 'force-dynamic'

/** Upload relationships arrive populated at depth 1, or as a bare id at depth 0. */
function toUploadedImage(value: unknown): UploadedImage {
  if (!value) return null
  if (typeof value === 'object') {
    const media = value as { id?: number | string; url?: string; sizes?: { thumbnail?: { url?: string } } }
    if (!media.id) return null
    return { id: media.id, url: media.sizes?.thumbnail?.url || media.url || '' }
  }
  return { id: value as number | string, url: '' }
}

export default async function DashboardProfilePage() {
  const user = await getCurrentUser()
  const profile = await getCurrentProfile(user)

  const doc = profile?.doc
  const initial = {
    role: profile?.kind || 'trainer',
    name: profile ? (profile.kind === 'brand' ? profile.doc.name : profile.doc.displayName) : '',
    city: (doc as { location?: { city?: string } } | undefined)?.location?.city || '',
    country: (doc as { location?: { country?: string } } | undefined)?.location?.country || 'be',
    website: (doc as { website?: string } | undefined)?.website || '',
    email: (doc as { email?: string } | undefined)?.email || '',
    phone: (doc as { phone?: string } | undefined)?.phone || '',
    about: profile ? lexicalToHtml(profile.kind === 'brand' ? profile.doc.description : profile.doc.bio) : '',
    accentColor: (doc as { profileAccentColor?: string | null } | undefined)?.profileAccentColor || '',
    // Medium+ perk; hidden rather than shown-and-ignored on Basis.
    canBrand: tierForUser((user || {}) as never).features.hasProfileBranding,
    photo: toUploadedImage(profile?.kind === 'brand' ? profile.doc.logo : profile?.doc.photo),
    coverImage: toUploadedImage(profile?.kind === 'brand' ? profile.doc.coverImage : null),
    partnerType: profile?.kind === 'brand' ? profile.doc.typePartner || '' : '',
    origin: profile?.kind === 'brand' ? profile.doc.herkomst || '' : '',
    producttype: profile?.kind === 'brand' ? ((profile.doc as { productType?: string[] }).productType || []) : [],
    // Category limit for the current tier (Lite 1 / Premium 3 / Ultimate ∞).
    // Infinity can't be JSON-serialised to the client, so send a large sentinel.
    categoryLimit: (() => {
      const lim = tierForUser((user || {}) as never).features.categoryLimit
      return lim === Infinity ? 999 : lim
    })(),
    instagram: (doc as { social?: { instagram?: string } } | undefined)?.social?.instagram || '',
    facebook: (doc as { social?: { facebook?: string } } | undefined)?.social?.facebook || '',
    tiktok: (doc as { social?: { tiktok?: string } } | undefined)?.social?.tiktok || '',
    gallery: profile?.kind === 'brand'
      ? ((profile.doc as { gallery?: { image?: unknown; caption?: string }[] }).gallery || []).map((g) => ({ image: toUploadedImage(g.image), caption: g.caption || '' }))
      : [],
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
