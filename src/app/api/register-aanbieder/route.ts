import { NextResponse } from 'next/server'
import { sendEmail, emailHtml, ADMIN_EMAIL, SITE_URL } from '@/lib/email'

const ROLE_LABEL: Record<string, string> = { trainer: 'trainer', brand: 'merk / academie' }

/** POST /api/register-aanbieder - welcome a new provider + notify the admin. */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim()
    const role = body.role === 'brand' ? 'brand' : 'trainer'
    if (!name || !email) return NextResponse.json({ error: 'Naam en e-mailadres zijn verplicht.' }, { status: 400 })

    // Welcome email to the new provider.
    await sendEmail({
      to: email,
      subject: 'Welkom bij Blissify',
      html: emailHtml([
        `Welkom ${name},`,
        `Jouw account is aangemaakt. Je kan nu inloggen en je eerste opleiding publiceren.`,
        `Inloggen: ${SITE_URL}/inloggen`,
      ]),
    })

    // Admin notification.
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `Nieuwe aanbieder geregistreerd - ${name}`,
      html: emailHtml([
        `${name} heeft zich geregistreerd als ${ROLE_LABEL[role]}.`,
        `Controleer en activeer hun account via het admin panel.`,
        `Link: ${SITE_URL}/admin`,
      ]),
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Er ging iets mis.' }, { status: 500 })
  }
}
