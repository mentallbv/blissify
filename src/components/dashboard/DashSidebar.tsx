'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'

const NAV = [
  { id: 'overview', label: 'Overzicht', icon: 'ti-layout-dashboard', href: '/dashboard' },
  { id: 'courses', label: 'Opleidingen', icon: 'ti-stack-2', href: '/dashboard/opleidingen' },
  { id: 'leads', label: 'Aanvragen', icon: 'ti-inbox', href: '/dashboard/leads' },
  { id: 'analytics', label: 'Analytics', icon: 'ti-chart-line', href: '/dashboard/analytics' },
  { id: 'profile', label: 'Profiel', icon: 'ti-building-store', href: '/dashboard/profiel' },
  { id: 'subscription', label: 'Abonnement', icon: 'ti-credit-card', href: '/dashboard/abonnement' },
]

export function DashSidebar({ providerName = 'Opleider' }: { providerName?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const isActive = (href: string) => (href === '/dashboard' ? pathname === href : pathname.startsWith(href))

  async function logout() {
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
    router.push('/inloggen')
    router.refresh()
  }

  return (
    <aside
      style={{
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
        height: '100vh',
        width: 240,
        flex: '0 0 240px',
        background: 'var(--surface-dark)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <a
        href="/"
        style={{
          padding: '24px 24px 28px',
          fontFamily: 'var(--font-display)',
          fontWeight: 'var(--fw-display-light)',
          fontSize: 22,
          letterSpacing: '-0.01em',
          color: 'var(--blissify-chalk)',
        }}
      >
        Blissify
      </a>
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
        {NAV.map((n) => {
          const on = isActive(n.href)
          return (
            <a
              key={n.id}
              href={n.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: on ? 'rgba(245,240,234,0.08)' : 'transparent',
                fontFamily: 'var(--font-ui)',
                fontWeight: 'var(--fw-ui-regular)',
                fontSize: 14,
                color: on ? 'var(--blissify-chalk)' : 'rgba(245,240,234,0.6)',
              }}
            >
              <i className={'ti ' + n.icon} style={{ fontSize: 18 }} />
              <span style={{ flex: 1 }}>{n.label}</span>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: on ? 'var(--blissify-terracotta)' : 'transparent' }} />
            </a>
          )
        })}
      </nav>
      <div style={{ borderTop: '0.5px solid rgba(245,240,234,0.15)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(245,240,234,0.12)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--fw-display-light)',
            fontSize: 18,
            color: 'var(--blissify-chalk)',
          }}
        >
          {providerName[0] || 'O'}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 13, color: 'var(--blissify-chalk)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {providerName}
          </div>
          <button
            type="button"
            onClick={logout}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'rgba(245,240,234,0.5)' }}
          >
            Uitloggen
          </button>
        </div>
      </div>
    </aside>
  )
}

export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 40, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: '0 0 32px', lineHeight: 1.1 }}>
      {children}
    </h1>
  )
}
