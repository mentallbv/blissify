import React from 'react'
import { Input, Select, Button } from '@/components/ui'
import { categoryTiles } from '@/lib/data'

/** Hero search card - posts as a GET to the listing page, works without JS. */
export function SearchCard() {
  return (
    <form
      action="/opleidingen"
      method="get"
      style={{
        background: 'var(--surface-card)',
        border: '0.5px solid var(--border-hairline)',
        borderRadius: 8,
        padding: 24,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 'var(--fw-display-regular)',
          fontSize: 22,
          color: 'var(--text-brand)',
          marginBottom: 18,
        }}
      >
        Vind jouw opleiding
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input name="q" label="Wat wil je leren?" icon={<i className="ti ti-search" />} placeholder="bijv. massage, nagelstyliste, yoga…" />
        <Select
          name="categorie"
          label="Categorie"
          placeholder="Alle categorieën"
          options={categoryTiles.map((c) => ({ value: c.slug, label: c.name }))}
        />
        <Input name="locatie" label="Locatie" placeholder="Stad of online" />
        <div style={{ marginTop: 4 }}>
          <Button variant="accent" fullWidth type="submit">
            Zoek opleidingen
          </Button>
        </div>
      </div>
    </form>
  )
}
