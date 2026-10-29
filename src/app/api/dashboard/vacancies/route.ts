import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { resolveOwner } from '@/lib/course-form'
import { buildVacancyData, uniqueVacancySlug } from '@/lib/vacancy-form'

/** POST /api/dashboard/vacancies - create a vacancy owned by the current user. */
export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: await getHeaders() })
    if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })
    const owner = await resolveOwner(payload, user)
    if (!owner) return NextResponse.json({ error: 'Geen profiel gevonden.' }, { status: 400 })

    const data = buildVacancyData(await req.json())
    data.slug = await uniqueVacancySlug(payload, String(data.title), String(data.city))
    // Run as the user so access control and the plan limit apply.
    const created = await payload.create({ collection: 'vacancies', data: { ...data, ...owner } as never, user, overrideAccess: false })
    return NextResponse.json({ ok: true, id: created.id })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Aanmaken mislukt.' }, { status: 400 })
  }
}
