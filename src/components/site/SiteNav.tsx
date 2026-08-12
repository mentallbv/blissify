'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

const LINKS = [
  { slug: 'opleidingen', label: 'Opleidingen', href: '/opleidingen' },
  { slug: 'opleiders', label: 'Opleiders', href: '/opleiders' },
  { slug: 'merken', label: 'Merken en Leveranciers', href: '/merken' },
]

export function SiteNav({ user = null }: { user?: { name?: string | null; role?: string | null } | null }) {
  const pathname = usePathname() || '/'
  const [scrolled, setScrolled] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  React.useEffect(() => setMobileOpen(false), [pathname])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')
  const accountHref = user?.role === 'admin' ? '/admin' : '/dashboard'
  const accountLabel = user?.name?.trim() || 'Mijn dashboard'

  async function logout() {
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
    window.location.assign('/')
  }

  return (
    <div className={'blnav-wrap' + (scrolled ? ' is-scrolled' : '')}>
      <div className="blnav-inner">
        <a className="blnav-wm" href="/">
          Blissify
        </a>
        <nav className="blnav-links">
          {LINKS.map((l) => (
            <a key={l.slug} href={l.href} className={isActive(l.href) ? 'active' : ''}>
              {l.label}
            </a>
          ))}
          <div className={'blnav-dropdown' + (isActive('/prijzen') ? ' active' : '')}>
            <a href="/prijzen/opleiders" className={isActive('/prijzen') ? 'active' : ''}>
              Prijzen <i className="ti ti-chevron-down" aria-hidden="true" />
            </a>
            <div className="blnav-dropdown-menu">
              <a href="/prijzen/opleiders" className={isActive('/prijzen/opleiders') ? 'active' : ''}>Voor opleiders</a>
              <a href="/prijzen/merken-leveranciers" className={isActive('/prijzen/merken-leveranciers') ? 'active' : ''}>Voor merken &amp; leveranciers</a>
            </div>
          </div>
        </nav>
        <div className="blnav-right">
          {user ? (
            <>
              <a className="blnav-login" href={accountHref}>
                {accountLabel}
              </a>
              <button type="button" className="blnav-logout" onClick={logout}>Uitloggen</button>
            </>
          ) : (
            <a className="blnav-login" href="/inloggen">Inloggen</a>
          )}
          <a className="blnav-cta" href="/voor-aanbieders">
            Publiceer
          </a>
          <button
            type="button"
            className="blnav-menu-toggle"
            aria-expanded={mobileOpen}
            aria-controls="blnav-mobile-menu"
            aria-label={mobileOpen ? 'Menu sluiten' : 'Menu openen'}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <i className={mobileOpen ? 'ti ti-x' : 'ti ti-menu-2'} aria-hidden="true" />
          </button>
        </div>
      </div>
      <nav id="blnav-mobile-menu" className={'blnav-mobile-menu' + (mobileOpen ? ' is-open' : '')} aria-hidden={!mobileOpen}>
        {LINKS.map((link) => (
          <a key={link.slug} href={link.href} className={isActive(link.href) ? 'active' : ''}>{link.label}</a>
        ))}
        <div className="blnav-mobile-pricing">
          <span>Prijzen</span>
          <a href="/prijzen/opleiders" className={isActive('/prijzen/opleiders') ? 'active' : ''}>Voor opleiders</a>
          <a href="/prijzen/merken-leveranciers" className={isActive('/prijzen/merken-leveranciers') ? 'active' : ''}>Voor merken &amp; leveranciers</a>
        </div>
        {user ? (
          <div className="blnav-mobile-account">
            <a href={accountHref}>{accountLabel}</a>
            <button type="button" onClick={logout}>Uitloggen</button>
          </div>
        ) : <a href="/inloggen">Inloggen</a>}
      </nav>
    </div>
  )
}
