'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Input, Select, Button, FieldLabel, Tag } from '@/components/ui'

export type CourseFormValues = {
  title: string
  slug: string
  status: string
  category: string
  shortDescription: string
  description: string
  externalUrl: string
  city: string
  level: string
  accreditation: string
  certificate: boolean
  priceAmount: string
  priceOnRequest: boolean
  durationValue: string
  durationUnit: string
  format: string[]
  tags: string
}

const EMPTY: CourseFormValues = {
  title: '',
  slug: '',
  status: 'draft',
  category: '',
  shortDescription: '',
  description: '',
  externalUrl: '',
  city: '',
  level: '',
  accreditation: '',
  certificate: false,
  priceAmount: '',
  priceOnRequest: false,
  durationValue: '',
  durationUnit: 'days',
  format: [],
  tags: '',
}

const FORMATS = [
  { value: 'fysiek', label: 'In-persoon' },
  { value: 'online', label: 'Online' },
  { value: 'hybride', label: 'Hybride' },
]

export function CourseForm({
  categories,
  initial,
  courseId,
}: {
  categories: { id: number; name: string }[]
  initial?: Partial<CourseFormValues>
  courseId?: number
}) {
  const router = useRouter()
  const [v, setV] = React.useState<CourseFormValues>({ ...EMPTY, ...initial })
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const set = <K extends keyof CourseFormValues>(k: K, val: CourseFormValues[K]) => setV((s) => ({ ...s, [k]: val }))
  const toggleFormat = (f: string) => set('format', v.format.includes(f) ? v.format.filter((x) => x !== f) : [...v.format, f])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const url = courseId ? `/api/dashboard/courses/${courseId}` : '/api/dashboard/courses'
      const res = await fetch(url, {
        method: courseId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(v),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Opslaan mislukt.')
      router.push('/dashboard/opleidingen')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis.')
      setLoading(false)
    }
  }

  const card: React.CSSProperties = { background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 8, padding: 28, display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 20 }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 720 }}>
      {error ? (
        <div style={{ marginBottom: 20, fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.6, color: 'var(--status-warning)', background: '#FBF1E6', border: '0.5px solid #E9D8C2', borderRadius: 8, padding: '14px 16px' }}>
          {error}
        </div>
      ) : null}

      <div style={card}>
        <Input label="Titel" value={v.title} onChange={(e) => set('title', e.target.value)} required />
        <Input label="Slug (optioneel)" placeholder="wordt automatisch gegenereerd" value={v.slug} onChange={(e) => set('slug', e.target.value)} />
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Select
            label="Categorie"
            placeholder="Kies een categorie"
            value={v.category}
            onChange={(e) => set('category', e.target.value)}
            options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
          />
          <Select
            label="Status"
            value={v.status}
            onChange={(e) => set('status', e.target.value)}
            options={[
              { value: 'draft', label: 'Concept' },
              { value: 'published', label: 'Gepubliceerd' },
              { value: 'archived', label: 'Gearchiveerd' },
            ]}
          />
        </div>
        <div>
          <FieldLabel>Korte omschrijving</FieldLabel>
          <textarea value={v.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} maxLength={200} style={ta} />
        </div>
        <div>
          <FieldLabel>Volledige omschrijving</FieldLabel>
          <textarea value={v.description} onChange={(e) => set('description', e.target.value)} style={{ ...ta, minHeight: 140 }} />
        </div>
      </div>

      <div style={card}>
        <div>
          <FieldLabel>Lesvorm</FieldLabel>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FORMATS.map((f) => (
              <Tag key={f.value} as="button" active={v.format.includes(f.value)} onClick={() => toggleFormat(f.value)}>
                {f.label}
              </Tag>
            ))}
          </div>
        </div>
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input label="Stad" value={v.city} onChange={(e) => set('city', e.target.value)} />
          <Select
            label="Niveau"
            placeholder="Kies een niveau"
            value={v.level}
            onChange={(e) => set('level', e.target.value)}
            options={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'gevorderd', label: 'Gevorderd' },
              { value: 'expert', label: 'Expert' },
              { value: 'all', label: 'Alle niveaus' },
            ]}
          />
        </div>
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input label="Duur (aantal)" type="number" value={v.durationValue} onChange={(e) => set('durationValue', e.target.value)} />
          <Select
            label="Eenheid"
            value={v.durationUnit}
            onChange={(e) => set('durationUnit', e.target.value)}
            options={[
              { value: 'hours', label: 'Uren' },
              { value: 'days', label: 'Dagen' },
              { value: 'weeks', label: 'Weken' },
              { value: 'months', label: 'Maanden' },
            ]}
          />
        </div>
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'end' }}>
          <Input label="Prijs (€)" type="number" value={v.priceAmount} onChange={(e) => set('priceAmount', e.target.value)} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, height: 44, fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-body)' }}>
            <input type="checkbox" checked={v.priceOnRequest} onChange={(e) => set('priceOnRequest', e.target.checked)} />
            Prijs op aanvraag
          </label>
        </div>
        <Input label="Inschrijf-URL (extern)" placeholder="https://..." value={v.externalUrl} onChange={(e) => set('externalUrl', e.target.value)} required />
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-body)' }}>
          <input type="checkbox" checked={v.certificate} onChange={(e) => set('certificate', e.target.checked)} />
          Certificaat inbegrepen
        </label>
        <Input label="Trefwoorden (komma-gescheiden)" value={v.tags} onChange={(e) => set('tags', e.target.value)} />
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Opslaan…' : courseId ? 'Wijzigingen opslaan' : 'Opleiding aanmaken'}
        </Button>
        <a href="/dashboard/opleidingen" className="bl-textlink">
          Annuleren
        </a>
      </div>
    </form>
  )
}

const ta: React.CSSProperties = {
  width: '100%',
  minHeight: 80,
  border: '0.5px solid var(--neutral-200)',
  borderRadius: 6,
  background: 'var(--surface-card)',
  padding: '12px 16px',
  fontFamily: 'var(--font-ui)',
  fontWeight: 400,
  fontSize: 14,
  color: 'var(--text-strong)',
  lineHeight: 1.6,
  resize: 'vertical',
  outline: 'none',
}
