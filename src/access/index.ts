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