import { NextResponse } from 'next/server'

/** POST /api/newsletter - subscribe an email to the Brevo list. */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body.email || '').trim()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Vul een geldig e-mailadres in.' }, { status: 400 })
    }

    const key = process.env.BREVO_API_KEY
    const listId = parseInt(process.env.BREVO_LIST_ID || '0', 10)
    if (!key || !listId) {
      // Not configured yet: accept gracefully so the form works.
      return NextResponse.json({ success: true, message: 'Bedankt! Je bent ingeschreven voor de Blissify nieuwsbrief.' })
    }

    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, listIds: [listId], updateEnabled: false }),
    })

    if (res.ok) {
      return NextResponse.json({ success: true, message: 'Bedankt! Je bent ingeschreven voor de Blissify nieuwsbrief.' })
    }

    const data = await res.json().catch(() => ({}))
    if (res.status === 400 && String(data?.code || '').includes('duplicate')) {
      return NextResponse.json({ error: 'Dit e-mailadres is al ingeschreven.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Inschrijven mislukt. Probeer het later opnieuw.' }, { status: 502 })
  } catch {
    return NextResponse.json({ error: 'Er ging iets mis.' }, { status: 500 })
  }
}
