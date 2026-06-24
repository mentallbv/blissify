'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

const LINKS = [
  { slug: 'opleidingen', label: 'Opleidingen', href: '/opleidingen' },
  { slug: 'opleiders', label: 'Opleiders', href: '/opleiders' },
  { slug: 'merken', label: 'Merken', href: '/merken' },
  { slug: 'prijzen', label: 'Prijzen', href: '/prijzen' },
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
