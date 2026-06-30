/**
 * Transactional email via the Resend REST API (https://resend.com/docs/api-reference).
 * Implemented with `fetch` so no SDK dependency is required. Sends are best-effort:
 * if RESEND_API_KEY is missing or the request fails, helpers resolve to `false`
 * instead of throwing, so form submissions never break on email errors.
 */

const RESEND_KEY = process.env.RESEND_API_KEY
const FROM = 'Blissify <noreply@blissify.be>'
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'lonne@blissify.be'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://blissify.be'

export function emailConfigured(): boolean {
  return Boolean(RESEND_KEY)
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string)
}

/** Wraps plain lines into a minimal branded HTML body. Each line is escaped. */
export function emailHtml(lines: string[]): string {
  const body = lines
    .map((l) => (l === '' ? '<div style="height:12px"></div>' : `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#2C3440">${escapeHtml(l)}</p>`))
    .join('')
  return `<div style="font-family:Arial,Helvetica,sans-serif;background:#F5F0EA;padding:32px"><div style="max-width:520px;margin:0 auto;background:#fff;border:0.5px solid #E8E3DC;border-radius:8px;padding:32px"><div style="font-size:22px;letter-spacing:-0.01em;color:#1A2E25;margin-bottom:20px">Blissify</div>${body}</div></div>`
}

/** Sends one email. Returns true on success, false otherwise (never throws). */
export async function sendEmail(opts: {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  replyTo?: string
}): Promise<boolean> {
  if (!RESEND_KEY) {
    console.warn('[email] RESEND_API_KEY ontbreekt - e-mail niet verstuurd naar', opts.to)
    return false
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        reply_to: opts.replyTo,
      }),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error(`[email] Resend ${res.status} bij verzenden naar ${JSON.stringify(opts.to)}: ${detail}`)
      return false
    }
    return true
  } catch (err) {
    console.error('[email] Verzenden mislukt naar', opts.to, err)
    return false
  }
}
