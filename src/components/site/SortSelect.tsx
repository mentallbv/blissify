'use client'

import React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const OPTIONS = [
  { value: 'relevant', label: 'Meest relevant' },
  { value: 'price-asc', label: 'Prijs: laag naar hoog' },
  { value: 'recent', label: 'Nieuwst eerst' },
]

/** Sort dropdown that writes `sort` to the URL (server re-fetches in the new order). */
export function SortSelect() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const current = params.get('sort') || 'relevant'

  const onChange = (value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value === 'relevant') next.delete('sort')
    else next.set('sort', value)
    router.push(`${pathname}?${next.toString()}`, { scroll: false })
  }

  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: 200, height: 44, border: '0.5px solid var(--neutral-200)', borderRadius: 6, background: 'var(--surface-card)', padding: '0 14px', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-strong)', cursor: 'pointer', outline: 'none' }}
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
