import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { resolveOwner } from '@/lib/course-form'
import { buildWorkspaceData, uniqueWorkspaceSlug } from '@/lib/workspace-form'

/** POST /api/dashboard/workspaces - create a workspace owned by the current user. */
export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: await getHeaders() })
    if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })
    const owner = await resolveOwner(payload, user)
    if (!owner) return NextResponse.json({ error: 'Geen profiel gevonden.' }, { status: 400 })

    const data = buildWorkspaceData(await req.json())
    data.slug = await uniqueWorkspaceSlug(payload, String(data.title), String(data.city))
    // Run as the user so access control and the plan limit apply.
    const created = await payload.create({ collection: 'workspaces', data: { ...data, ...owner } as never, user, overrideAccess: false })
    return NextResponse.json({ ok: true, id: created.id })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Aanmaken mislukt.' }, { status: 400 })
  }
}
