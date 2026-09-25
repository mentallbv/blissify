'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Tag, Select } from '@/components/ui'
import { CourseTable, type DashCourse } from './CourseTable'

const TABS: { label: string; value: 'all' | 'active' | 'draft' | 'archived' }[] = [
  { label: 'Alle', value: 'all' },
  { label: 'Actief', value: 'active' },
  { label: 'Concept', value: 'draft' },
  { label: 'Gearchiveerd', value: 'archived' },
]

export function CoursesManager({ rows }: { rows: DashCourse[] }) {
  const router = useRouter()
  const [filter, setFilter] = React.useState<'all' | 'active' | 'draft' | 'archived'>('all')
  const [busyId, setBusyId] = React.useState<number | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  // Local copy so the table updates instantly after a mutation; router.refresh()
  // then re-syncs from the server in the background. Kept in sync when the
  // server sends new rows.
  const [items, setItems] = React.useState<DashCourse[]>(rows)
  React.useEffect(() => setItems(rows), [rows])
  const filtered = filter === 'all' ? items : items.filter((r) => r.status === filter)

  const duplicate = async (id: number) => {
    setError(null)
    setBusyId(id)
    try {
      const res = await fetch(`/api/dashboard/courses/${id}/duplicate`, { method: 'POST', credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Dupliceren mislukt.')
      // Optimistically insert the copy right after its source, then re-sync.
      const src = items.find((r) => r.id === id)
      if (src && data?.id) {
        const copy: DashCourse = { ...src, id: data.id, name: `${src.name} (kopie)`, status: 'draft', enquiries: 0, editHref: `/dashboard/opleidingen/${data.id}`, viewHref: undefined }
        setItems((prev) => {
          const i = prev.findIndex((r) => r.id === id)
          const next = [...prev]
          next.splice(i + 1, 0, copy)
          return next
        })
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis.')
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (id: number) => {
    if (!window.confirm('Weet je zeker dat je deze opleiding definitief wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) return
    setError(null)
    setBusyId(id)
    try {
      const res = await fetch(`/api/dashboard/courses/${id}`, { method: 'DELETE', credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Verwijderen mislukt.')
      setItems((prev) => prev.filter((r) => r.id !== id)) // instant removal
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      {error ? (
        <div style={{ marginBottom: 16, fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--status-warning)', background: '#FBF1E6', border: '0.5px solid #E9D8C2', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          {error}
        </div>
      ) : null}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {TABS.map((t) => (
            <Tag key={t.value} as="button" active={filter === t.value} onClick={() => setFilter(t.value)}>
              {t.label}
            </Tag>
          ))}
        </div>
        <div style={{ width: 200 }}>
          <Select
            options={[
              { value: 'recent', label: 'Nieuwst eerst' },
              { value: 'enquiries', label: 'Meeste aanvragen' },
            ]}
          />
        </div>
      </div>
      <CourseTable rows={filtered} onDuplicate={duplicate} onDelete={remove} busyId={busyId} />
    </>
  )
}
