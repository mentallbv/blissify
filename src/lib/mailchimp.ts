import { createHash } from 'node:crypto'

/**
 * Mailchimp (newsletter + segments) via the Marketing REST API.
 * Best-effort: every helper is a no-op without configuration, so forms and
 * payment webhooks never break on newsletter errors.
 *
 * One audience, segmented with tags (Mailchimp bills per contact per audience,
 * so separate lists would count people twice). Build the "lists" in Mailchimp
 * as segments on these tags:
 *   Opleiders        Opleider + Opleider Lite / Premium / Ultimate
 *   Merken           Merk & leverancier + Partner Lite / Premium / Ultimate
 *   Gebruikers       Nieuwsbrief, Professional / Eindklant, Cursist, Kandidaat werkruimte
 *   Status           Actief abonnement, Opgezegd
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

export const TAGS = {
  newsletter: 'Nieuwsbrief',
  professional: 'Professional',
  consumer: 'Eindklant',
  student: 'Cursist',
  workspaceCandidate: 'Kandidaat werkruimte',
  trainer: 'Opleider',
  brand: 'Merk & leverancier',
  active: 'Actief abonnement',
  canceled: 'Opgezegd',
} as const

/** Plan tags, one per tier value in Users.subscriptionTier / brandTier. */
const PLAN_TAGS: Record<string, string> = {
  basis: 'Opleider Lite',
  medium: 'Opleider Premium',
  premium: 'Opleider Ultimate',
  partner_listing: 'Partner Lite',
  partner_professional: 'Partner Premium',
  partner_premium: 'Partner Ultimate',
}
const ALL_PLAN_TAGS = Object.values(PLAN_TAGS)

const memberUrl = (email: string) =>
  `https://${DC}.api.mailchimp.com/3.0/lists/${AUDIENCE}/members/${createHash('md5').update(email.trim().toLowerCase()).digest('hex')}`

const headers = () => ({
  Authorization: `Basic ${Buffer.from(`blissify:${KEY}`).toString('base64')}`,
  'Content-Type': 'application/json',
})

async function setTags(email: string, active: string[], inactive: string[] = []): Promise<boolean> {
  const tags = [
    ...active.map((name) => ({ name, status: 'active' })),
    ...inactive.filter((t) => !active.includes(t)).map((name) => ({ name, status: 'inactive' })),
  ]
  if (!tags.length) return true
  const res = await fetch(`${memberUrl(email)}/tags`, { method: 'POST', headers: headers(), body: JSON.stringify({ tags }) })
  return res.ok
}

/**
 * Add or update a contact and tag it. `status_if_new: 'pending'` means a new
 * address gets Mailchimp's confirmation mail (double opt-in, consent proof
 * under GDPR); existing contacts keep their status, so an unsubscribe sticks.
 */
async function upsert(email: string, tags: string[], opts: { name?: string; removeTags?: string[] } = {}): Promise<boolean> {
  if (!mailchimpConfigured()) return true
  try {
    const [first, ...rest] = (opts.name || '').trim().split(/\s+/)
    const res = await fetch(memberUrl(email), {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({
        email_address: email,
        status_if_new: 'pending',
        ...(first ? { merge_fields: { FNAME: first, LNAME: rest.join(' ') } } : {}),
      }),
    })
    if (!res.ok) return false
    return await setTags(email, tags, opts.removeTags)
  } catch {
    return false
  }
}

export type NewsletterResult = { ok: boolean; alreadySubscribed?: boolean }
export type Audience = 'professional' | 'consumer'

/** Footer signup, with the copy's "Waar ben je naar op zoek?" answer as a tag. */
export async function newsletterSignup(email: string, audience?: Audience): Promise<NewsletterResult> {
  if (!mailchimpConfigured()) return { ok: true }
  try {
    const current = await fetch(memberUrl(email), { headers: headers(), cache: 'no-store' })
    const alreadySubscribed = current.ok && ((await current.json()) as { status?: string }).status === 'subscribed'
    const tags: string[] = [TAGS.newsletter, ...(audience ? [TAGS[audience]] : [])]
    const ok = await upsert(email, tags)
    return { ok, alreadySubscribed }
  } catch {
    return { ok: false }
  }
}

/** Course enquiry or registration where the person ticked the newsletter box. */
export const mailchimpAddStudent = (email: string, name?: string) =>
  upsert(email, [TAGS.newsletter, TAGS.student], { name })

/** Workspace application where the person ticked the newsletter box. */
export const mailchimpAddWorkspaceCandidate = (email: string, name?: string) =>
  upsert(email, [TAGS.newsletter, TAGS.workspaceCandidate], { name })

/** Paid subscription (Mollie webhook): role, current plan and "Actief abonnement". */
export function mailchimpAddCustomer(email: string, role: string | undefined, tier: string, name?: string) {
  const plan = PLAN_TAGS[tier]
  const roleTag = role === 'brand' ? TAGS.brand : TAGS.trainer
  return upsert(email, [roleTag, TAGS.active, ...(plan ? [plan] : [])], {
    name,
    removeTags: [...ALL_PLAN_TAGS, TAGS.canceled],
  })
}

/** Cancelled subscription: keep the contact, swap "Actief abonnement" for "Opgezegd". */
export async function mailchimpMarkCanceled(email: string): Promise<boolean> {
  if (!mailchimpConfigured()) return true
  try {
    return await setTags(email, [TAGS.canceled], [TAGS.active])
  } catch {
    return false
  }
}
