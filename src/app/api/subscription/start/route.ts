import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { createCustomer, createFirstPayment, mollieConfigured, TIER_LABEL, type Tier } from '@/lib/mollie'
import { SITE_URL } from '@/lib/email'

const TIERS: Tier[] = ['basis', 'medium', 'premium']

/** POST /api/subscription/start { tier } - create/reuse Mollie customer + first payment. */
export async function POST(req: Request) {
  try {
    if (!mollieConfigured()) {
      return NextResponse.json({ error: 'Betalingen zijn nog niet geconfigureerd (MOLLIE_API_KEY ontbreekt).' }, { status: 503 })
    }
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: await getHeaders() })
    if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })

    const u = user as { id: number; email: string; name?: string; role?: string; mollieCustomerId?: string }
    if (u.role !== 'trainer' && u.role !== 'brand') {
      return NextResponse.json({ error: 'Alleen opleiders kunnen een abonnement starten.' }, { status: 400 })
    }

    const body = await req.json()
    const tier = body.tier as Tier
    if (!TIERS.includes(tier)) return NextResponse.json({ error: 'Ongeldige formule.' }, { status: 400 })

    // Reuse the customer if we already created one for this user.
    let customerId = u.mollieCustomerId
    if (!customerId) {
      const customer = await createCustomer(u.name || u.email, u.email)
      customerId = customer.id
      await payload.update({ collection: 'users', id: u.id, data: { mollieCustomerId: customerId } as never, overrideAccess: true })
    }

    const payment = await createFirstPayment({
      customerId,
      tier,
      description: `Blissify abonnement - ${TIER_LABEL[tier]}`,
      redirectUrl: `${SITE_URL}/dashboard/abonnement?betaling=verwerkt`,
      metadata: { userId: u.id, tier },
    })

    const checkoutUrl = payment._links?.checkout?.href
    if (!checkoutUrl) return NextResponse.json({ error: 'Kon de betaling niet starten.' }, { status: 502 })
    return NextResponse.json({ checkoutUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Er ging iets mis.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
