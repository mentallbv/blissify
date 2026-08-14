import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

/**
 * POST /api/dashboard/media - image upload for dashboard users.
 *
 * Wraps the Media collection rather than letting the dashboard POST to it
 * directly: `alt` is required, and the collection itself enforces no size or
 * type ceiling on the authenticated-user create rule.
 */
export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: await getHeaders() })
    if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })

    const form = await req.formData()
    const file = form.get('file')
    if (!(file instanceof File)) return NextResponse.json({ error: 'Geen bestand ontvangen.' }, { status: 400 })

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'Alleen JPG, PNG, WebP of AVIF is toegestaan.' }, { status: 415 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Maximaal 5 MB per afbeelding.' }, { status: 413 })
    }

    const alt = typeof form.get('alt') === 'string' ? (form.get('alt') as string).trim() : ''
    const created = await payload.create({
      collection: 'media',
      data: { alt: alt || file.name.replace(/\.[^.]+$/, '') } as never,
      file: {
        data: Buffer.from(await file.arrayBuffer()),
        mimetype: file.type,
        name: file.name,
        size: file.size,
      },
      user,
      overrideAccess: false,
    })

    return NextResponse.json({ ok: true, id: created.id, url: created.url, thumbnail: created.sizes?.thumbnail?.url || created.url })
  } catch (err) {
    console.error('[media] upload failed', err)
    return NextResponse.json({ error: 'Uploaden mislukt. Probeer een andere afbeelding.' }, { status: 500 })
  }
}
