import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { User, Trainer, Brand } from '@/payload-types'

export type Profile =
  | { kind: 'trainer'; doc: Trainer }
  | { kind: 'brand'; doc: Brand }
  | null

/** Reads the current authenticated user from the payload-token cookie, or null. */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: await getHeaders() })
    return (user as User) || null
  } catch {
    return null
  }
}

/** Fetches the trainer/brand document owned by the given user. */
export async function getCurrentProfile(user: User | null): Promise<Profile> {
  if (!user) return null
  const role = (user as { role?: string }).role
  if (role !== 'trainer' && role !== 'brand') return null
  try {
    const payload = await getPayload({ config: await config })
    const collection = role === 'brand' ? 'brands' : 'trainers'
    const res = await payload.find({
      collection,
      where: { owner: { equals: user.id } },
      limit: 1,
      depth: 1,
      overrideAccess: true,
    })
    const doc = res.docs[0]
    if (!doc) return null
    return role === 'brand' ? { kind: 'brand', doc: doc as Brand } : { kind: 'trainer', doc: doc as Trainer }
  } catch {
    return null
  }
}

export function profileName(profile: Profile): string {
  if (!profile) return 'Opleider'
  return profile.kind === 'brand' ? profile.doc.name : profile.doc.displayName
}
