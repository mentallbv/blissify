'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Input, Select, Button } from '@/components/ui'

const PLACEHOLDERS = ['massage...', 'nagelstyliste...', 'yoga...', 'aromatherapie...', 'reflexologie...']

/**
 * Hero search card. The scope selector (Alle Categorieën / Opleiders / Merken)
 * routes the search to the matching directory. Location options come from live
 * Payload data; the counts strip is fully dynamic (passed by the server).
 */
export function SearchCard({
  cities,
  counts,
}: {
  categories?: { slug: string; name: string }[]
  cities: string[]
  counts: { courses: number; opleiders: number; merken: number }
}) {
  const router = useRouter()
  const [idx, setIdx] = React.useState(0)
  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % PLACEHOLDERS.length), 2200)
    return () => clearInterval(t)
  }, [])

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const scope = String(fd.get('scope') || '')
    const keyword = String(fd.get('keyword') || '').trim()
    const locatie = String(fd.get('locatie') || '').trim()
    const path = scope === 'opleiders' ? '/opleiders' : scope === 'merken' ? '/merken' : '/opleidingen'
    const params = new URLSearchParams()
    if (keyword) params.set('keyword', keyword)
    if (locatie) params.set('locatie', locatie)
    const qs = params.toString()
    router.push(qs ? `${path}?${qs}` : path)
  }

  const nf = (n: number) => n.toLocaleString('nl-BE')

  return (
    <form
      onSubmit={onSubmit}
      style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-lg)', padding: 24 }}
    >
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)', marginBottom: 18 }}>
        Vind jouw opleiding
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input name="keyword" label="Wat wil je leren?" icon={<i className="ti ti-search" />} placeholder={PLACEHOLDERS[idx]} />
        <Select
          name="scope"
          label="Categorie"
          options={[
            { value: '', label: 'Alle Categorieën' },
            { value: 'opleiders', label: 'Opleiders' },
            { value: 'merken', label: 'Merken' },
          ]}
        />
        <Select name="locatie" label="Locatie" placeholder="Overal in België" options={cities} />
        <div style={{ marginTop: 4 }}>
          <Button variant="accent" fullWidth type="submit">
            Zoek opleidingen
          </Button>
        </div>
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 12, color: 'var(--text-meta)', marginTop: 2 }}>
          {nf(counts.courses)} opleidingen · {nf(counts.opleiders)} opleiders · {nf(counts.merken)} Merken
        </div>
      </div>
    </form>
  )
}
