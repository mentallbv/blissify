import type { Access } from 'payload'

export const isAdmin: Access = ({ req }) => {
  const user = req.user as any
  return user?.role === 'admin'
}

export const isAdminOrSelf: Access = ({ req }) => {
  const user = req.user as any
  if (!user) return false
  if (user.role === 'admin') return true
  return { id: { equals: user.id } }
}

export const isLoggedIn: Access = ({ req }) => {
  return Boolean(req.user)
}

export const isPublic: Access = () => true

// Resolves the trainer document ID linked to the current user
export async function getTrainerIdForUser(req: any): Promise<string | null> {
  if (!req.user) return null
  const result = await req.payload.find({
    collection: 'trainers',
    where: { owner: { equals: req.user.id } },
    limit: 1,
    depth: 0,
  })
  return result.docs[0]?.id ?? null
}

// Resolves the brand document ID linked to the current user
export async function getBrandIdForUser(req: any): Promise<string | null> {
  if (!req.user) return null
  const result = await req.payload.find({
    collection: 'brands',
    where: { owner: { equals: req.user.id } },
    limit: 1,
    depth: 0,
  })
  return result.docs[0]?.id ?? null
}
