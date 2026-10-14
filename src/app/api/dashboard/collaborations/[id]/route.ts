import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { resolveOwner } from '@/lib/course-form'
import { emailHtml, sendEmail, SITE_URL } from '@/lib/email'

/**
 * PATCH /api/dashboard/collaborations/[id] - { action }
 *  - accept / decline: the opleider answers a pending request
 *  - remove: either side ends an approved collaboration (or the brand withdraws its request)
 * Ending a collaboration also unlinks the pair's courses, so no course keeps
 * pointing at a partner it no longer works with.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: await getHeaders() })
    if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })
    const owner = await resolveOwner(payload, user)
    if (!owner) return NextResponse.json({ error: 'Geen profiel gevonden.' }, { status: 400 })

    const collab = await payload.findByID({ collection: 'collaborations', id, depth: 1, overrideAccess: true }).catch(() => null)
    if (!collab) return NextResponse.json({ error: 'Samenwerking niet gevonden.' }, { status: 404 })
    const relId = (v: unknown) => (v && typeof v === 'object' ? Number((v as { id: unknown }).id) : Number(v))
    const brandId = relId(collab.brand)
    const trainerId = relId(collab.trainer)
    const side = 'brand' in owner && owner.brand === brandId ? 'brand' : 'trainer' in owner && owner.trainer === trainerId ? 'trainer' : null
    if (!side) return NextResponse.json({ error: 'Geen toegang tot deze samenwerking.' }, { status: 403 })

    const { action } = (await req.json().catch(() => ({}))) as { action?: string }
    const now = new Date().toISOString()
    let data: Record<string, unknown>
    if (action === 'accept' || action === 'decline') {
      if (side !== 'trainer') return NextResponse.json({ error: 'Alleen de opleider kan een verzoek beantwoorden.' }, { status: 403 })
      if (collab.status !== 'pending') return NextResponse.json({ error: 'Dit verzoek is al beantwoord.' }, { status: 409 })
      data = { status: action === 'accept' ? 'approved' : 'declined', respondedAt: now }
    } else if (action === 'remove') {
      const allowed = collab.status === 'approved' || (collab.status === 'pending' && side === 'brand')
      if (!allowed) return NextResponse.json({ error: 'Deze samenwerking is niet actief.' }, { status: 409 })
      data = { status: 'removed', endedBy: side, respondedAt: now }
    } else {
      return NextResponse.json({ error: 'Onbekende actie.' }, { status: 400 })
    }

    await payload.update({ collection: 'collaborations', id, data: data as never, overrideAccess: true })

    if (data.status === 'removed') {
      await payload.update({
        collection: 'courses',
        where: { and: [{ trainer: { equals: trainerId } }, { collaborationBrand: { equals: brandId } }] } as never,
        data: { collaborationBrand: null } as never,
        overrideAccess: true,
      })
      await payload.update({
        collection: 'courses',
        where: { and: [{ brand: { equals: brandId } }, { deliveredByTrainer: { equals: trainerId } }] } as never,
        data: { deliveredByTrainer: null } as never,
        overrideAccess: true,
      })
    }

    // Tell the brand how the opleider answered (best-effort).
    if (data.status === 'approved' || data.status === 'declined') {
      const brand = collab.brand && typeof collab.brand === 'object' ? (collab.brand as { name: string; owner?: unknown; email?: string }) : null
      const trainer = collab.trainer && typeof collab.trainer === 'object' ? (collab.trainer as { displayName: string }) : null
      const ownerRel = brand?.owner
      const ownerId = ownerRel && typeof ownerRel === 'object' ? (ownerRel as { id: number }).id : ownerRel
      const brandUser = ownerId ? await payload.findByID({ collection: 'users', id: ownerId as never, depth: 0, overrideAccess: true }).catch(() => null) : null
      const to = (brandUser as { email?: string } | null)?.email || brand?.email
      if (to && brand && trainer) {
        const approved = data.status === 'approved'
        await sendEmail({
          to,
          subject: approved ? `${trainer.displayName} heeft je samenwerking aanvaard` : `${trainer.displayName} heeft je samenwerkingsverzoek geweigerd`,
          html: emailHtml([
            `Hallo ${brand.name},`,
            approved
              ? `${trainer.displayName} heeft je samenwerkingsverzoek aanvaard. De samenwerking staat nu op beide profielen en je kunt de opleider koppelen aan je opleidingen.`
              : `${trainer.displayName} heeft je samenwerkingsverzoek geweigerd.`,
            `Je samenwerkingen: ${SITE_URL}/dashboard/samenwerkingen`,
          ]),
        })
      }
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Bijwerken mislukt.' }, { status: 400 })
  }
}
