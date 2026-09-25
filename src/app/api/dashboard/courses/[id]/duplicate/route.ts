import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { resolveOwner, ownsCourse } from '@/lib/course-form'

/** Recursively drop array-row `id` keys so a copied doc creates fresh rows. */
function stripIds(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripIds)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k === 'id') continue
      out[k] = stripIds(v)
    }
    return out
  }
  return value
}

/**
 * POST /api/dashboard/courses/[id]/duplicate - copy a course the user owns
 * (client #5: "opleiding kopiëren"). The copy is created as a draft with a
 * "(kopie)" title and a unique slug so the owner only has to adjust the details.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: await getHeaders() })
    if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })

    const owner = await resolveOwner(payload, user)
    if (!owner) return NextResponse.json({ error: 'Geen opleiderprofiel gevonden.' }, { status: 400 })

    const existing = await payload.findByID({ collection: 'courses', id, depth: 0, overrideAccess: true }).catch(() => null)
    if (!existing) return NextResponse.json({ error: 'Opleiding niet gevonden.' }, { status: 404 })
    if (!ownsCourse(existing as never, owner)) return NextResponse.json({ error: 'Geen toegang tot deze opleiding.' }, { status: 403 })

    const source = stripIds(existing) as Record<string, unknown>
    delete source.id
    delete source.createdAt
    delete source.updatedAt

    // Unique slug: base-kopie, then -2, -3, … until free.
    const baseSlug = `${(existing as { slug?: string }).slug || 'opleiding'}-kopie`
    let slug = baseSlug
    for (let n = 2; n < 100; n++) {
      const clash = await payload.find({ collection: 'courses', where: { slug: { equals: slug } }, limit: 1, depth: 0, overrideAccess: true })
      if (clash.docs.length === 0) break
      slug = `${baseSlug}-${n}`
    }

    const data = {
      ...source,
      ...owner,
      title: `${(existing as { title?: string }).title || 'Opleiding'} (kopie)`,
      slug,
      status: 'draft',
    }

    // Run as the user so the tier course-limit hook applies to the copy too.
    const created = await payload.create({ collection: 'courses', data: data as never, user, overrideAccess: false })
    return NextResponse.json({ ok: true, id: created.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Dupliceren mislukt.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
