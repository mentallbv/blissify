import React from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthView } from '@/components/site/AuthView'
import { getCurrentUser } from '@/lib/session'

export const metadata: Metadata = { title: 'Inloggen' }

export default async function InloggenPage() {
  const user = await getCurrentUser()
  if (user) redirect(user.role === 'admin' ? '/admin' : '/dashboard')
  return <AuthView mode="inloggen" />
}
