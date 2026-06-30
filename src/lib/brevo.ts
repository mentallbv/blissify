/**
 * Brevo (newsletter) helpers via REST. Best-effort: no-op without BREVO_API_KEY.
 */
const KEY = process.env.BREVO_API_KEY
const LIST_ID = parseInt(process.env.BREVO_LIST_ID || '0', 10)

export function brevoConfigured(): boolean {
  return Boolean(KEY && LIST_ID)
}

export type BrevoResult = { ok: boolean; duplicate?: boolean }

/** Add a contact to the configured list. */
export async function brevoAddContact(email: string): Promise<BrevoResult> {
  if (!brevoConfigured()) return { ok: true }
  try {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'api-key': KEY as string, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, listIds: [LIST_ID], updateEnabled: true }),
    })
    if (res.ok) return { ok: true }
    const data = await res.json().catch(() => ({}))
    if (res.status === 400 && String(data?.code || '').includes('duplicate')) return { ok: true, duplicate: true }
    return { ok: false }
  } catch {
    return { ok: false }
  }
}

/** Remove a contact from the configured list (keeps the contact, drops the list membership). */
export async function brevoRemoveFromList(email: string): Promise<boolean> {
  if (!brevoConfigured()) return true
  try {
    const res = await fetch(`https://api.brevo.com/v3/contacts/lists/${LIST_ID}/contacts/remove`, {
      method: 'POST',
      headers: { 'api-key': KEY as string, 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails: [email] }),
    })
    return res.ok
  } catch {
    return false
  }
}
