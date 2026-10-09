import type { Payload } from 'payload'

type ProfileUser = { id: number | string; role?: string | null; name?: string | null; email?: string | null }

const slugBase = (input: string): string =>
  input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || 'profiel'

/**
 * Returns the trainer/brand profile owned by `user`, creating an empty one when
 * it is missing.
 *
 * Signup creates the user and the profile in two separate steps, and accounts
 * can also be created straight in the admin panel, which never creates a
 * profile. Without one the dashboard has nothing to edit and publishing a
 * course fails with "Geen opleiderprofiel gevonden". Creating it lazily on first
 * use repairs those accounts without a data fix.
 */
export async function ensureProfile(
  payload: Payload,
  user: ProfileUser,
): Promise<{ collection: 'trainers' | 'brands'; doc: { id: number | string } & Record<string, unknown> } | null> {
  const role = user.role
  if (role !== 'trainer' && role !== 'brand') return null
  const collection = role === 'brand' ? 'brands' : 'trainers'

  const find = async () => {
    const res = await payload.find({ collection, where: { owner: { equals: user.id } }, limit: 1, depth: 1, overrideAccess: true })
    return res.docs[0] as unknown as ({ id: number | string } & Record<string, unknown>) | undefined
  }

  const existing = await find()
  if (existing) return { collection, doc: existing }

  // The caller may only hold id + role; fetch the name/email for a sensible title.
  let { name, email } = user
  if (!name && !email) {
    const full = await payload.findByID({ collection: 'users', id: user.id as never, depth: 0, overrideAccess: true }).catch(() => null)
    name = (full as { name?: string } | null)?.name
    email = (full as { email?: string } | null)?.email
  }
  const title = (name || email?.split('@')[0] || (role === 'brand' ? 'Merk' : 'Opleider')).trim()
  const slug = `${slugBase(title)}-${String(user.id).slice(-6)}`

  try {
    const created = await payload.create({
      collection,
      data: (role === 'brand' ? { name: title, slug, owner: user.id } : { displayName: title, slug, owner: user.id }) as never,
      overrideAccess: true,
    })
    return { collection, doc: created as unknown as { id: number | string } & Record<string, unknown> }
  } catch (err) {
    // A concurrent request may have created it first; otherwise surface the failure.
    const raced = await find()
    if (raced) return { collection, doc: raced }
    throw err
  }
}
