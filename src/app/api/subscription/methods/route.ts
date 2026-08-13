import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { listFirstPaymentMethods, mollieConfigured, type BillingCycle, type PlanTier } from '@/lib/mollie'
import { chargeAmount, resolvePlan } from '@/lib/subscription-plan'

/**
 * GET /api/subscription/methods?tier=&billingCycle= - payment methods the user
 * can pick for this plan. Only mandate-capable methods qualify; an empty list
 * means no such method is enabled on the Mollie account, which is a
 * configuration problem rather than a user error.
 */
export async function GET(req: Request) {
  try {
    if (!mollieConfigured()) return NextResponse.json({ methods: [] })

    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: await getHeaders() })
    if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })

    const u = user as { role?: string }
    if (u.role !== 'trainer' && u.role !== 'brand') {
      return NextResponse.json({ error: 'Alleen opleiders en merken kunnen een abonnement starten.' }, { status: 400 })
    }

    const url = new URL(req.url)
    const tier = (url.searchParams.get('tier') || '') as PlanTier
    const billingCycle: BillingCycle = url.searchParams.get('billingCycle') === 'monthly' ? 'monthly' : 'yearly'

    const plan = await resolvePlan(u.role, tier, billingCycle)
    if (!plan.ok) return NextResponse.json({ error: plan.error }, { status: plan.status })

    const methods = await listFirstPaymentMethods(chargeAmount(plan.amount, plan.catalog.billing.trialEnabled))
    return NextResponse.json({
      methods: methods.map((m) => ({ id: m.id, description: m.description, image: m.image?.svg || m.image?.size2x || null })),
    })
  } catch (err) {
    console.error('[mollie] listing payment methods failed', err)
    // A failed lookup must not block checkout - the caller falls back to
    // Mollie's own picker on the hosted checkout page.
    return NextResponse.json({ methods: [] })
  }
}
