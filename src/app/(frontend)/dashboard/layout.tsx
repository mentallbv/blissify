import React from 'react'
import type { Metadata } from 'next'
import { DashSidebar } from '@/components/dashboard/DashSidebar'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-page)' }}>
      <DashSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '40px 48px' }}>{children}</main>
    </div>
  )
}
