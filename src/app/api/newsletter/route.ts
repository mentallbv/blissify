import { NextResponse } from 'next/server'
import { mailchimpConfigured, newsletterSignup, type Audience } from '@/lib/mailchimp'

/** POST /api/newsletter - subscribe an email to the Mailchimp audience. */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body.email || '').trim()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Vul een geldig e-mailadres in.' }, { status: 400 })
    }
    const audience: Audience | undefined = body.audience === 'professional' || body.audience === 'consumer' ? body.audience : undefined

    const result = await newsletterSignup(email, audience)
    if (result.alreadySubscribed) {
      return NextResponse.json({ success: true, message: 'Je bent al ingeschreven voor de Blissify nieuwsbrief.' })
    }
    if (result.ok) {
      // Double opt-in: Mailchimp sends the confirmation mail (only once it is configured).
      const message = mailchimpConfigured()
        ? 'Bedankt! Bevestig je inschrijving via de e-mail die we je net stuurden.'
        : 'Bedankt! Je bent ingeschreven voor de Blissify nieuwsbrief.'
      return NextResponse.json({ success: true, message })
    }
    return NextResponse.json({ error: 'Inschrijven mislukt. Probeer het later opnieuw.' }, { status: 502 })
  } catch {
    return NextResponse.json({ error: 'Er ging iets mis.' }, { status: 500 })
  }
}
