import React from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { DashSidebar } from '@/components/dashboard/DashSidebar'
import { getCurrentUser, getCurrentProfile, profileName } from '@/lib/session'
import { tierForUser } from '@/lib/tier-features'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/inloggen')
  if ((user as { role?: string }).role === 'admin') redirect('/admin')

  const profile = await getCurrentProfile(user)
  const name = profileName(profile)

  const u = user as { role?: string; subscriptionTier?: string; brandTier?: string }
  const features = tierForUser(u).features
  const showRegistrations = features.hasInPlatformRegistration

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-page)' }}>
      <DashSidebar providerName={name} showRegistrations={showRegistrations} showAnalytics={features.hasAnalytics} />
      <main style={{ flex: 1, minWidth: 0, padding: '40px 48px' }}>{children}</main>
    </div>
  )
}
