import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { ownsCourse, resolveOwner } from '@/lib/course-form'
import { buildVacancyData } from '@/lib/vacancy-form'

async function context(id: string) {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await getHeaders() })
  if (!user) return { error: NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 }) }
  const owner = await resolveOwner(payload, user)
  if (!owner) return { error: NextResponse.json({ error: 'Geen profiel gevonden.' }, { status: 400 }) }
  const existing = await payload.findByID({ collection: 'vacancies', id, depth: 0, overrideAccess: true }).catch(() => null)
  if (!existing) return { error: NextResponse.json({ error: 'Vacature niet gevonden.' }, { status: 404 }) }
  // Same ownership rule as courses: the trainer/brand relationship.
  if (!ownsCourse(existing as never, owner)) return { error: NextResponse.json({ error: 'Geen toegang tot deze vacature.' }, { status: 403 }) }
  return { payload, user, existing }
}

/**
 * PATCH /api/dashboard/vacancies/[id] - full update from the form, or
 * `{ status }` alone to switch it on/off from the list.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const ctx = await context(id)
    if ('error' in ctx) return ctx.error
    const body = (await req.json()) as Record<string, unknown>
    const onlyStatus = Object.keys(body).length === 1 && 'status' in body
    const data = onlyStatus ? { status: body.status === 'published' ? 'published' : 'draft' } : buildVacancyData(body)
    const updated = await ctx.payload.update({ collection: 'vacancies', id, data: data as never, user: ctx.user, overrideAccess: false })
    return NextResponse.json({ ok: true, id: updated.id })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Opslaan mislukt.' }, { status: 400 })
  }
}

/** DELETE /api/dashboard/vacancies/[id] - remove a vacancy the user owns. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const ctx = await context(id)
    if ('error' in ctx) return ctx.error
    await ctx.payload.delete({ collection: 'vacancies', id, user: ctx.user, overrideAccess: false })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Verwijderen mislukt.' }, { status: 400 })
  }
}
