'use client'

import React from 'react'
import { Input, Select, Button } from '@/components/ui'

const PLACEHOLDERS = ['massage...', 'nagelstyliste...', 'yoga...', 'aromatherapie...', 'reflexologie...']

/**
 * Hero search card. Category + location options come from live Payload data
 * (passed in by the server). Submits a GET to /opleidingen so the listing page
 * renders pre-applied filters from the URL.
 */
export function SearchCard({
  categories,
  cities,
}: {
  categories: { slug: string; name: string }[]
  cities: string[]
}) {
  const [idx, setIdx] = React.useState(0)
  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % PLACEHOLDERS.length), 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <form
      action="/opleidingen"
      method="get"
      style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 8, padding: 24 }}
    >
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)', marginBottom: 18 }}>
        Vind jouw opleiding
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input name="keyword" label="Wat wil je leren?" icon={<i className="ti ti-search" />} placeholder={PLACEHOLDERS[idx]} />
        <Select
          name="categorie"
          label="Categorie"
          placeholder="Alle categorieën"
          options={categories.map((c) => ({ value: c.slug, label: c.name }))}
        />
        <Select name="locatie" label="Locatie" placeholder="Overal in België" options={cities} />
        <div style={{ marginTop: 4 }}>
          <Button variant="accent" fullWidth type="submit">
            Zoek opleidingen
          </Button>
        </div>
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 12, color: 'var(--text-meta)', marginTop: 2 }}>
          847 opleidingen · 124 opleiders · 12 categorieën
        </div>
      </div>
    </form>
  )
}
