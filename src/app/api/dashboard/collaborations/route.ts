import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { resolveOwner } from '@/lib/course-form'
import { brandOwnerCanCollaborate, listCollaborationsFor } from '@/lib/collaborations'
import { emailHtml, sendEmail, SITE_URL } from '@/lib/email'

/**
 * Samenwerkingen in the dashboard (client round 2, section 5).
 * GET  - the current brand's or opleider's collaborations, newest first.
 * POST - a Partner Ultimate brand invites an opleider: { trainerId }.
 */

export async function GET() {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await getHeaders() })
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })
  const owner = await resolveOwner(payload, user)
  if (!owner) return NextResponse.json({ error: 'Geen profiel gevonden.' }, { status: 400 })
  return NextResponse.json({ rows: await listCollaborationsFor(payload, owner) })
}

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: await getHeaders() })
    if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })
    const owner = await resolveOwner(payload, user)
    if (!owner || !('brand' in owner)) return NextResponse.json({ error: 'Alleen merken kunnen een samenwerking aanvragen.' }, { status: 403 })
    if (!brandOwnerCanCollaborate(user as never)) {
      return NextResponse.json({ error: 'Samenwerkingen aanvragen kan met Partner Ultimate.' }, { status: 403 })
    }

    const body = (await req.json().catch(() => ({}))) as { trainerId?: unknown }
    const trainerId = Number(body.trainerId)
    if (!Number.isFinite(trainerId)) return NextResponse.json({ error: 'Kies een opleider.' }, { status: 400 })
    const trainer = await payload.findByID({ collection: 'trainers', id: trainerId, depth: 0, overrideAccess: true }).catch(() => null)
    if (!trainer) return NextResponse.json({ error: 'Opleider niet gevonden.' }, { status: 404 })

    // One record per pair: re-inviting reopens a declined or ended one.
    const existing = await payload.find({
      collection: 'collaborations',
      where: { and: [{ brand: { equals: owner.brand } }, { trainer: { equals: trainerId } }] } as never,
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })
    const current = existing.docs[0]
    if (current && (current.status === 'pending' || current.status === 'approved')) {
      return NextResponse.json({ error: current.status === 'approved' ? 'Jullie werken al samen.' : 'Er staat al een aanvraag open.' }, { status: 409 })
    }
    const data = { brand: owner.brand, trainer: trainerId, status: 'pending', endedBy: null, respondedAt: null }
    const saved = current
      ? await payload.update({ collection: 'collaborations', id: current.id, data: data as never, overrideAccess: true })
      : await payload.create({ collection: 'collaborations', data: data as never, overrideAccess: true })

    // Best-effort notification to the opleider (skipped when email is not configured).
    const brand = await payload.findByID({ collection: 'brands', id: owner.brand, depth: 0, overrideAccess: true }).catch(() => null)
    const ownerRel = (trainer as { owner?: unknown }).owner
    const ownerId = ownerRel && typeof ownerRel === 'object' ? (ownerRel as { id: number }).id : ownerRel
    const trainerUser = ownerId ? await payload.findByID({ collection: 'users', id: ownerId as never, depth: 0, overrideAccess: true }).catch(() => null) : null
    const to = (trainerUser as { email?: string } | null)?.email || (trainer as { email?: string }).email
    if (to && brand) {
      await sendEmail({
        to,
        subject: `${brand.name} wil met je samenwerken op Blissify`,
        html: emailHtml([
          `Hallo ${trainer.displayName},`,
          `${brand.name} heeft je een samenwerkingsverzoek gestuurd op Blissify.`,
          'Na je goedkeuring verschijnt de samenwerking op beide profielen en kunnen jullie elkaar koppelen aan opleidingen.',
          `Bekijk en beantwoord het verzoek in je dashboard: ${SITE_URL}/dashboard/samenwerkingen`,
        ]),
      })
    }
    return NextResponse.json({ ok: true, id: saved.id })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Aanvraag mislukt.' }, { status: 400 })
  }
}
