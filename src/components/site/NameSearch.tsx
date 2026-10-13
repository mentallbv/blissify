'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui'

/**
 * Search a listing directly by name (client round 2 #1.3). Writes `?q=` to the
 * URL after a short pause in typing, keeping the other active filters.
 */
export function NameSearch({ basePath, placeholder }: { basePath: string; placeholder: string }) {
  const router = useRouter()
  const sp = useSearchParams()
  const urlQ = sp.get('q') || ''
  const [value, setValue] = React.useState(urlQ)

  // Follow back/forward navigation and "clear" links that change the URL.
  React.useEffect(() => setValue(urlQ), [urlQ])

  React.useEffect(() => {
    const term = value.trim()
    if (term === urlQ.trim()) return
    const t = setTimeout(() => {
      const next = new URLSearchParams(Array.from(sp.entries()))
      if (term) next.set('q', term)
      else next.delete('q')
      const qs = next.toString()
      router.replace(qs ? `${basePath}?${qs}` : basePath, { scroll: false })
    }, 300)
    return () => clearTimeout(t)
  }, [value, urlQ, sp, router, basePath])

  return (
    <form role="search" onSubmit={(e) => e.preventDefault()} style={{ maxWidth: 480 }}>
      <Input
        type="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        icon={<i className="ti ti-search" />}
      />
    </form>
  )
}
