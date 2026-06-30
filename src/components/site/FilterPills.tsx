'use client'

import React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Tag } from '@/components/ui'

/** A labeled row of single-select filter pills bound to one URL query param. */
export function FilterPills({
  paramKey,
  label,
  options,
}: {
  paramKey: string
  label?: string
  options: { value: string; label: string }[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const active = params.get(paramKey) || ''

  const select = (value: string) => {
    const next = new URLSearchParams(params.toString())
    if (active === value) next.delete(paramKey)
    else next.set(paramKey, value)
    router.push(next.toString() ? `${pathname}?${next.toString()}` : pathname, { scroll: false })
  }

  if (options.length === 0) return null

  return (
    <div style={{ marginBottom: 8 }}>
      {label ? (
        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-meta)', marginBottom: 10 }}>
          {label}
        </div>
      ) : null}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map((o) => (
          <Tag key={o.value} as="button" active={active === o.value} onClick={() => select(o.value)}>
            {o.label}
          </Tag>
        ))}
      </div>
    </div>
  )
}
