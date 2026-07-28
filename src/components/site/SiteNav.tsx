'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

const LINKS = [
  { slug: 'opleidingen', label: 'Opleidingen', href: '/opleidingen' },
  { slug: 'opleiders', label: 'Opleiders', href: '/opleiders' },
  { slug: 'merken', label: 'Merken en Leveranciers', href: '/merken' },
]

export function SiteNav() {
  const pathname = usePathname() || '/'
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

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
          <a className="blnav-login" href="/inloggen">
            Inloggen
          </a>
          <a className="blnav-cta" href="/voor-aanbieders">
            Publiceer
          </a>
        </div>
      </div>
    </div>
  )
}
