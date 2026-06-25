import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'opleider'
  )
}

/**
 * Public registration. POST /api/users is admin-only by design, so we create
 * the user + linked trainer/brand profile server-side via the Local API
 * (overrideAccess), restricting the role to trainer|brand. The browser then
 * logs in via Payload's /api/users/login to receive the auth cookie.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const role = body.role === 'brand' ? 'brand' : 'trainer'

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Vul je naam, e-mailadres en wachtwoord in.' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Het wachtwoord moet minstens 8 tekens bevatten.' }, { status: 400 })
    }

    const payload = await getPayload({ config: await config })

    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs.length > 0) {
      return NextResponse.json({ error: 'Er bestaat al een account met dit e-mailadres.' }, { status: 409 })
    }

    const user = await payload.create({
      collection: 'users',
      data: {
        name,
        email,
        password,
        role,
        subscriptionTier: 'basis',
        subscriptionStatus: 'inactive',
      } as never,
      overrideAccess: true,
    })

    const baseSlug = slugify(name)
    const slug = `${baseSlug}-${String(user.id).slice(-6)}`

    if (role === 'brand') {
      await payload.create({
        collection: 'brands',
        data: { name, slug, owner: user.id } as never,
        overrideAccess: true,
      })
    } else {
      await payload.create({
        collection: 'trainers',
        data: { displayName: name, slug, owner: user.id } as never,
        overrideAccess: true,
      })
    }

    return NextResponse.json({ ok: true, role })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registratie mislukt. Probeer het opnieuw.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
