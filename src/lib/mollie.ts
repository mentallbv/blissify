/**
 * Mollie integration via the REST API (https://docs.mollie.com/reference/v2).
 * Implemented with `fetch` (no SDK dependency). Works with a test_ or live_
 * MOLLIE_API_KEY transparently - swap the env value to go live, no code change.
 * All calls are server-side only; the key is never exposed to the client.
 */

const API = 'https://api.mollie.com/v2'
const KEY = process.env.MOLLIE_API_KEY
export const MOLLIE_WEBHOOK_URL = process.env.MOLLIE_WEBHOOK_URL || ''

export type Tier = 'basis' | 'medium' | 'premium'

/** Yearly price per Opleider tier, as Mollie expects amounts: { currency, value:"99.00" }. */
export const TIER_AMOUNT: Record<Tier, string> = {
  basis: '150.00',
  medium: '490.00',
  premium: '970.00',
}
export const TIER_LABEL: Record<Tier, string> = { basis: 'Opleider Lite', medium: 'Opleider Premium', premium: 'Opleider Ultimate' }

/** Merk & Leverancier (Brand) tiers - separate ladder, annual only. */
export type BrandTier = 'partner_listing' | 'partner_professional' | 'partner_premium'
export const BRAND_TIER_AMOUNT: Record<BrandTier, string> = {
  partner_listing: '490.00',
  partner_professional: '890.00',
  partner_premium: '1490.00',
}
export const BRAND_TIER_LABEL: Record<BrandTier, string> = {
  partner_listing: 'Partner Lite',
  partner_professional: 'Partner Premium',
  partner_premium: 'Partner Ultimate',
}
export type PlanTier = Tier | BrandTier
export type BillingCycle = 'yearly' | 'monthly'

export function isTrainerTier(tier: string): tier is Tier {
  return tier in TIER_AMOUNT
}

export function isBrandTier(tier: string): tier is BrandTier {
  return tier in BRAND_TIER_AMOUNT
}

export function planLabel(tier: PlanTier): string {
  return isTrainerTier(tier) ? TIER_LABEL[tier] : BRAND_TIER_LABEL[tier]
}

export function mollieConfigured(): boolean {
  return Boolean(KEY)
}

async function mollie<T>(path: string, init?: RequestInit): Promise<T> {
  if (!KEY) throw new Error('MOLLIE_API_KEY ontbreekt')
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...(init?.headers || {}) },
    cache: 'no-store',
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Mollie ${res.status} ${path}: ${detail}`)
  }
  return (await res.json()) as T
}

export type MollieCustomer = { id: string }
export type MolliePayment = {
  id: string
  status: 'open' | 'paid' | 'failed' | 'expired' | 'canceled' | 'pending' | 'authorized'
  sequenceType?: 'oneoff' | 'first' | 'recurring'
  customerId?: string
  mandateId?: string
  metadata?: Record<string, unknown>
  _links?: { checkout?: { href: string } }
}
export type MollieSubscription = { id: string; status: string; customerId?: string }

export function createCustomer(name: string, email: string): Promise<MollieCustomer> {
  return mollie<MollieCustomer>('/customers', { method: 'POST', body: JSON.stringify({ name, email }) })
}

export type MollieMethod = { id: string; description: string; image?: { size2x?: string; svg?: string } }

/**
 * Payment methods the account can actually use for the given amount. Filtered by
 * `sequenceType: 'first'` because a subscription needs a mandate-capable method -
 * the list is narrower than what a one-off payment would offer, and is empty
 * unless a mandate-capable method (credit card, SEPA Direct Debit) is enabled.
 */
export async function listFirstPaymentMethods(amount: string): Promise<MollieMethod[]> {
  const query = new URLSearchParams({
    sequenceType: 'first',
    'amount[value]': amount,
    'amount[currency]': 'EUR',
    locale: 'nl_BE',
  })
  const res = await mollie<{ _embedded?: { methods?: MollieMethod[] } }>(`/methods?${query}`)
  return res._embedded?.methods || []
}

/** First (mandate-creating) payment. Returns the hosted checkout URL via _links.checkout. */
export function createFirstPayment(opts: {
  customerId: string
  tier: PlanTier
  trialEnabled: boolean
  amount: string
  description: string
  redirectUrl: string
  method?: string
  metadata: Record<string, unknown>
}): Promise<MolliePayment> {
  return mollie<MolliePayment>(`/customers/${opts.customerId}/payments`, {
    method: 'POST',
    body: JSON.stringify({
      // A small authorization payment creates the mandate before a free trial.
      // €0.02 also supports Bancontact's documented minimum amount.
      amount: { currency: 'EUR', value: opts.trialEnabled ? '0.02' : opts.amount },
      description: opts.description,
      sequenceType: 'first',
      // Omitted -> Mollie's hosted checkout shows the method picker itself.
      method: opts.method || undefined,
      redirectUrl: opts.redirectUrl,
      webhookUrl: MOLLIE_WEBHOOK_URL || undefined,
      metadata: opts.metadata,
    }),
  })
}

export function getPayment(id: string): Promise<MolliePayment> {
  return mollie<MolliePayment>(`/payments/${id}`)
}

/** Recurring yearly subscription tied to the customer + active mandate. */
export function createSubscription(opts: {
  customerId: string
  tier: PlanTier
  description: string
  amount: string
  billingCycle: BillingCycle
  startDate?: string
}): Promise<MollieSubscription> {
  return mollie<MollieSubscription>(`/customers/${opts.customerId}/subscriptions`, {
    method: 'POST',
    body: JSON.stringify({
      amount: { currency: 'EUR', value: opts.amount },
      interval: opts.billingCycle === 'monthly' ? '1 month' : '12 months',
      startDate: opts.startDate,
      description: opts.description,
      webhookUrl: MOLLIE_WEBHOOK_URL || undefined,
      metadata: { tier: opts.tier },
    }),
  })
}

export function getSubscription(customerId: string, subscriptionId: string): Promise<MollieSubscription> {
  return mollie<MollieSubscription>(`/customers/${customerId}/subscriptions/${subscriptionId}`)
}

export function cancelSubscription(customerId: string, subscriptionId: string): Promise<MollieSubscription> {
  return mollie<MollieSubscription>(`/customers/${customerId}/subscriptions/${subscriptionId}`, { method: 'DELETE' })
}

/** Update what Mollie will charge at the next renewal without changing the paid period. */
export function updateSubscription(opts: {
  customerId: string
  subscriptionId: string
  tier: PlanTier
  amount: string
  billingCycle: BillingCycle
  userId: number
}): Promise<MollieSubscription> {
  return mollie<MollieSubscription>(`/customers/${opts.customerId}/subscriptions/${opts.subscriptionId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      amount: { currency: 'EUR', value: opts.amount },
      interval: opts.billingCycle === 'monthly' ? '1 month' : '12 months',
      description: `Blissify abonnement - ${planLabel(opts.tier)}`,
      metadata: { tier: opts.tier, userId: opts.userId, billingCycle: opts.billingCycle },
    }),
  })
}
