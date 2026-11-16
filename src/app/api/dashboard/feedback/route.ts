import { NextResponse } from 'next/server'
import { getCurrentUser, getCurrentProfile, profileName } from '@/lib/session'
import { sendEmail, emailHtml, ADMIN_EMAIL } from '@/lib/email'

const KINDS = ['Suggestie', 'Klacht'] as const

/** POST /api/dashboard/feedback - a provider sends a suggestion or complaint to the Blissify admin (round 4, 2.1). */
export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })
  try {
    const body = (await req.json()) as Record<string, unknown>
    const kind = KINDS.find((k) => k === body.kind)
    const message = String(body.message || '').trim().slice(0, 4000)
    if (!kind) return NextResponse.json({ error: 'Kies suggestie of klacht.' }, { status: 400 })
    if (message.length < 5) return NextResponse.json({ error: 'Schrijf je bericht.' }, { status: 400 })
    const profile = await getCurrentProfile(user)
    const name = profileName(profile) || '(onbekend)'
    const email = String((user as { email?: string }).email || '')
    const ok = await sendEmail({
      to: ADMIN_EMAIL,
      ...(email ? { replyTo: email } : {}),
      subject: `${kind} van ${name}`,
      html: emailHtml([`Nieuwe ${kind.toLowerCase()} via het dashboard.`, '', `Van: ${name}${email ? ` (${email})` : ''}`, '', message]),
    })
    if (!ok) return NextResponse.json({ error: 'Versturen lukte niet. Probeer het later opnieuw.' }, { status: 502 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Er ging iets mis.' }, { status: 500 })
  }
}
