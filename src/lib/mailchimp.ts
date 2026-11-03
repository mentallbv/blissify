import { createHash } from 'node:crypto'

/**
 * Mailchimp (newsletter) via the Marketing REST API, replacing Brevo.
 * Best-effort: every helper is a no-op without configuration, so forms and
 * payment webhooks never break on newsletter errors.
 *
 * Env:
 *   MAILCHIMP_API_KEY      e.g. "abc123…-us21" (the part after the dash is the data center)
 *   MAILCHIMP_AUDIENCE_ID  the audience (list) id, Audience → Settings → "Audience ID"
 */
const KEY = process.env.MAILCHIMP_API_KEY || ''
const AUDIENCE = process.env.MAILCHIMP_AUDIENCE_ID || ''
const DC = KEY.split('-')[1] || ''

export function mailchimpConfigured(): boolean {
  return Boolean(KEY && AUDIENCE && DC)
}

const memberUrl = (email: string) =>
  `https://${DC}.api.mailchimp.com/3.0/lists/${AUDIENCE}/members/${createHash('md5').update(email.trim().toLowerCase()).digest('hex')}`

const headers = () => ({
  Authorization: `Basic ${Buffer.from(`blissify:${KEY}`).toString('base64')}`,
  'Content-Type': 'application/json',
})

export type NewsletterResult = { ok: boolean; alreadySubscribed?: boolean }

/**
 * Footer signup. Double opt-in: a new address gets status "pending" and
 * Mailchimp sends the confirmation email (consent proof under GDPR).
 */
export async function newsletterSignup(email: string): Promise<NewsletterResult> {
  if (!mailchimpConfigured()) return { ok: true }
  try {
    const current = await fetch(memberUrl(email), { headers: headers(), cache: 'no-store' })
    if (current.ok) {
      const member = (await current.json()) as { status?: string }
      if (member.status === 'subscribed') return { ok: true, alreadySubscribed: true }
    }
    const res = await fetch(memberUrl(email), {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ email_address: email, status_if_new: 'pending', status: 'pending' }),
    })
    return { ok: res.ok }
  } catch {
    return { ok: false }
  }
}

/** Paying customers (Mollie webhook): add or update them in the audience, tagged as customer. */
export async function mailchimpAddCustomer(email: string): Promise<boolean> {
  if (!mailchimpConfigured()) return true
  try {
    const res = await fetch(memberUrl(email), {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ email_address: email, status_if_new: 'subscribed' }),
    })
    if (!res.ok) return false
    await fetch(`${memberUrl(email)}/tags`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ tags: [{ name: 'Klant', status: 'active' }] }),
    })
    return true
  } catch {
    return false
  }
}

/** Cancelled subscription: archive the contact (removes them from the audience, keeps history). */
export async function mailchimpRemove(email: string): Promise<boolean> {
  if (!mailchimpConfigured()) return true
  try {
    const res = await fetch(memberUrl(email), { method: 'DELETE', headers: headers() })
    return res.ok || res.status === 404
  } catch {
    return false
  }
}
