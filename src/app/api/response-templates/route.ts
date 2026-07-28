import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { tierForUser } from '@/lib/tier-features'

type ResponseTemplateInput = {
  name?: unknown
  subject?: unknown
  body?: unknown
}

export async function PATCH(req: Request) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: await getHeaders() })
    if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })
    if (!tierForUser(user).features.hasResponseTemplates) {
      return NextResponse.json({ error: 'Antwoordsjablonen zijn alleen beschikbaar met Premium.' }, { status: 403 })
    }

    const body = (await req.json()) as { templates?: ResponseTemplateInput[] }
    if (!Array.isArray(body.templates)) {
      return NextResponse.json({ error: 'Ongeldige sjablonen.' }, { status: 400 })
    }

    const templates = body.templates
      .slice(0, 10)
      .map((template) => ({
        name: typeof template.name === 'string' ? template.name.trim().slice(0, 80) : '',
        subject: typeof template.subject === 'string' ? template.subject.trim().slice(0, 180) : '',
        body: typeof template.body === 'string' ? template.body.trim().slice(0, 5000) : '',
      }))

    if (templates.some((template) => !template.name || !template.subject || !template.body)) {
      return NextResponse.json({ error: 'Vul voor elk sjabloon een naam, onderwerp en bericht in.' }, { status: 400 })
    }

    await payload.update({
      collection: 'users',
      id: user.id,
      data: { responseTemplates: templates },
      overrideAccess: true,
    })

    return NextResponse.json({ ok: true, templates })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Opslaan mislukt.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
