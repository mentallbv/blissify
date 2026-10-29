'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

/** Min / max rent filter (spec: minimumprijs, maximumprijs). Combine with "Huurprijs per". */
export function PriceRange({ basePath }: { basePath: string }) {
  const router = useRouter()
  const sp = useSearchParams()
  const [min, setMin] = React.useState(sp.get('prijsMin') || '')
  const [max, setMax] = React.useState(sp.get('prijsMax') || '')
  const apply = (e: React.FormEvent) => {
    e.preventDefault()
    const next = new URLSearchParams(Array.from(sp.entries()))
    for (const [k, v] of [['prijsMin', min], ['prijsMax', max]] as const) {
      if (v.trim()) next.set(k, v.trim())
      else next.delete(k)
    }
    router.push(`${basePath}?${next.toString()}`, { scroll: false })
  }
  const input: React.CSSProperties = { width: 96, height: 38, padding: '0 10px', border: '0.5px solid var(--neutral-200)', borderRadius: 'var(--radius-pill)', background: 'var(--surface-card)', fontFamily: 'var(--font-ui)', fontSize: 13 }
  return (
    <form onSubmit={apply} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)' }}>
      Huurprijs
      <input type="number" min={0} inputMode="decimal" placeholder="Min €" aria-label="Minimumprijs" value={min} onChange={(e) => setMin(e.target.value)} style={input} />
      –
      <input type="number" min={0} inputMode="decimal" placeholder="Max €" aria-label="Maximumprijs" value={max} onChange={(e) => setMax(e.target.value)} style={input} />
      <button type="submit" className="bl-textlink" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 13 }}>Toepassen</button>
    </form>
  )
}
