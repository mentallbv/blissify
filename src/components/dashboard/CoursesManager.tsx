'use client'

import React from 'react'
import { Tag, Select } from '@/components/ui'
import { CourseTable, type DashCourse } from './CourseTable'

const TABS: { label: string; value: 'all' | 'active' | 'draft' | 'archived' }[] = [
  { label: 'Alle', value: 'all' },
  { label: 'Actief', value: 'active' },
  { label: 'Concept', value: 'draft' },
  { label: 'Gearchiveerd', value: 'archived' },
]

export function CoursesManager({ rows }: { rows: DashCourse[] }) {
  const [filter, setFilter] = React.useState<'all' | 'active' | 'draft' | 'archived'>('all')
  const filtered = filter === 'all' ? rows : rows.filter((r) => r.status === filter)

  return (
    <>
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
      <CourseTable rows={filtered} />
    </>
  )
}
