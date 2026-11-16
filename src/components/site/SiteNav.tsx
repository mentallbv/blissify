'use client'

import React from 'react'
import { Logo } from '@/components/ui/Logo'
import { usePathname } from 'next/navigation'
import { useSavedCourses } from '@/lib/saved-courses'

// Main menu as Lonne proposed (Nov 2026): searching on the left, offering on the
// right. Visitors look for "Producten & materiaal"; providers are grouped under
// "Aanbieders".
const LINKS = [
  { slug: 'opleidingen', label: 'Opleidingen', href: '/opleidingen' },
  { slug: 'producten', label: 'Producten & materiaal', href: '/merken-leveranciers' },
  { slug: 'werkruimtes', label: 'Werkruimtes', href: '/werkruimtes' },
  { slug: 'vacatures', label: 'Vacatures', href: '/vacatures' },
]
const PROVIDERS = [
  { slug: 'salons', label: 'Salons en academies', href: '/salons-professionals' },
  { slug: 'merken', label: 'Merken en leveranciers', href: '/merken-leveranciers' },
]

export function SiteNav({ user = null }: { user?: { name?: string | null; role?: string | null } | null }) {
  const pathname = usePathname() || '/'
  const [scrolled, setScrolled] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [providersOpen, setProvidersOpen] = React.useState(false)
  const providersRef = React.useRef<HTMLDivElement>(null)
  const savedCount = useSavedCourses().length

  React.useEffect(() => {
    // Hysteresis: separate on/off thresholds so the bar doesn't flicker
    // between states when the scroll position hovers around one value.
    const onScroll = () => setScrolled((was) => (was ? window.scrollY > 24 : window.scrollY > 96))
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  React.useEffect(() => { setMobileOpen(false); setProvidersOpen(false) }, [pathname])

  // Close the Aanbieders menu on an outside click or Escape.
  React.useEffect(() => {
    if (!providersOpen) return
    const onDown = (e: MouseEvent) => { if (!providersRef.current?.contains(e.target as Node)) setProvidersOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setProvidersOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [providersOpen])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')
  const providersActive = PROVIDERS.some((p) => p.slug === 'salons' && isActive(p.href))
  const accountHref = user?.role === 'admin' ? '/admin' : '/dashboard'
  const accountLabel = user?.name?.trim() || 'Mijn dashboard'

  async function logout() {
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
    window.location.assign('/')
  }

  return (
    <div className={'blnav-wrap' + (scrolled ? ' is-scrolled' : '')}>
      <div className="blnav-inner">
        <a className="blnav-wm" href="/" aria-label="Blissify home">
          <Logo height={30} />
        </a>
        <nav className="blnav-links" aria-label="Hoofdmenu">
          {LINKS.map((l) => (
            <a key={l.slug} href={l.href} className={isActive(l.href) ? 'active' : ''}>
              {l.label}
            </a>
          ))}
          <div className={'blnav-dropdown' + (providersOpen ? ' is-open' : '')} ref={providersRef}>
            <button type="button" className={'blnav-dropdown-toggle' + (providersActive ? ' active' : '')} aria-expanded={providersOpen} aria-controls="blnav-providers" onClick={() => setProvidersOpen((o) => !o)}>
              Aanbieders <i className="ti ti-chevron-down" aria-hidden="true" />
            </button>
            <div id="blnav-providers" className="blnav-dropdown-menu">
              {PROVIDERS.map((p) => <a key={p.slug} href={p.href}>{p.label}</a>)}
            </div>
          </div>
          <span className="blnav-divider" aria-hidden="true" />
        </nav>
        <div className="blnav-right">
          {savedCount ? (
            // Saved courses (client round 2 #4.3), only once something is saved.
            <a className="blnav-saved" href="/favorieten" aria-label={`Mijn favorieten (${savedCount})`}>
              <i className="ti ti-heart-filled" aria-hidden="true" />
              <span className="blnav-saved-count">{savedCount}</span>
            </a>
          ) : null}
          {user ? (
            <>
              <a className="blnav-login blnav-account" href={accountHref}>
                {accountLabel}
              </a>
              <button type="button" className="blnav-logout" onClick={logout}>Uitloggen</button>
            </>
          ) : (
            <a className="blnav-login" href="/inloggen">Inloggen</a>
          )}
          <a className="blnav-cta" href="/abonnementen-tarieven">
            Plaats je aanbod
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
          <span>Aanbieders</span>
          {PROVIDERS.map((p) => <a key={p.slug} href={p.href}>{p.label}</a>)}
        </div>
        <div className="blnav-mobile-pricing">
          <a href="/abonnementen-tarieven">Plaats je aanbod</a>
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
