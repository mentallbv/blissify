import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { resolveOwner } from '@/lib/course-form'
import { publicMediaUrl } from '@/lib/media'

/** GET /api/dashboard/collaborations/search?q= - opleiders a brand can invite, by name. */
export async function GET(req: Request) {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await getHeaders() })
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })
  const owner = await resolveOwner(payload, user)
  if (!owner || !('brand' in owner)) return NextResponse.json({ error: 'Alleen voor merken.' }, { status: 403 })

  const q = new URL(req.url).searchParams.get('q')?.trim() || ''
  if (q.length < 2) return NextResponse.json({ results: [] })
  const res = await payload.find({
    collection: 'trainers',
    where: { displayName: { like: q } } as never,
    depth: 1,
    limit: 10,
    sort: 'displayName',
    overrideAccess: true,
  })
  return NextResponse.json({
    results: res.docs.map((t) => ({
      id: Number(t.id),
      name: t.displayName,
      slug: t.slug,
      city: t.location?.city || '',
      image: t.photo && typeof t.photo === 'object' ? publicMediaUrl(t.photo as never) : null,
    })),
  })
}
