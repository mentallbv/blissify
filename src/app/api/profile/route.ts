import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

import { htmlToLexical } from '@/lib/richtext'

/** Media id from the dashboard, or null to clear the field. */
function mediaId(value: unknown): number | null | undefined {
  if (value === null) return null
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) return Number(value)
  return undefined
}

/** PATCH /api/profile - updates the trainer/brand profile owned by the current user. */
export async function PATCH(req: Request) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: await getHeaders() })
    if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })

    const role = (user as { role?: string }).role
    if (role === 'admin') return NextResponse.json({ error: 'Admins beheren via /admin.' }, { status: 400 })

    const body = await req.json()
    const collection = role === 'brand' ? 'brands' : 'trainers'
    const found = await payload.find({
      collection,
      where: { owner: { equals: user.id } },
      limit: 1,
      overrideAccess: true,
    })
    const doc = found.docs[0]
    if (!doc) return NextResponse.json({ error: 'Profiel niet gevonden.' }, { status: 404 })

    const data: Record<string, unknown> = {}
    if (typeof body.name === 'string' && body.name.trim()) {
      if (role === 'brand') data.name = body.name.trim()
      else data.displayName = body.name.trim()
    }
    if (typeof body.city === 'string') data.location = { city: body.city }
    if (Array.isArray(body.specializations) && role === 'trainer') data.specializations = body.specializations
    if (Array.isArray(body.tags) && role === 'brand') data.tags = body.tags
    if (typeof body.website === 'string') data.website = body.website
    if (typeof body.email === 'string') data.email = body.email
    if (typeof body.phone === 'string') data.phone = body.phone
    if (typeof body.about === 'string' && body.about.trim()) {
      const rich = await htmlToLexical(body.about)
      if (role === 'brand') data.description = rich
      else data.bio = rich
    }

    // Trainers have `photo`; brands use `logo` plus a wide `coverImage`.
    const photo = mediaId(body.photo)
    if (photo !== undefined) data[role === 'brand' ? 'logo' : 'photo'] = photo
    if (role === 'brand') {
      const cover = mediaId(body.coverImage)
      if (cover !== undefined) data.coverImage = cover
    }
    if (role === 'brand') {
      const partnerTypes = ['productmerken', 'apparatuurmerken', 'groothandels_distributeurs', 'leveranciers']
      const origins = ['belgisch', 'nederlands', 'europees', 'internationaal']
      if (partnerTypes.includes(body.partnerType)) data.typePartner = body.partnerType
      if (origins.includes(body.origin)) data.herkomst = body.origin
      data.social = {
        instagram: typeof body.instagram === 'string' ? body.instagram.trim() : '',
        facebook: typeof body.facebook === 'string' ? body.facebook.trim() : '',
        tiktok: typeof body.tiktok === 'string' ? body.tiktok.trim() : '',
      }
      if (Array.isArray(body.localPartners)) {
        data.localPartners = body.localPartners
          .map((partner: Record<string, unknown>) => ({
            name: typeof partner.name === 'string' ? partner.name.trim() : '',
            country: typeof partner.country === 'string' ? partner.country.trim() : '',
            website: typeof partner.website === 'string' ? partner.website.trim() : '',
          }))
          .filter((partner: { name: string; country: string }) => partner.name && partner.country)
          .slice(0, 20)
      }
    }

    const updated = await payload.update({
      collection,
      id: doc.id,
      data: data as never,
      overrideAccess: true,
    })

    return NextResponse.json({ ok: true, id: updated.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Opslaan mislukt.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
