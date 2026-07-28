'use client'

import React from 'react'
import { CourseCard, Tag } from '@/components/ui'
import type { HomepageCategorySection } from '@/lib/data'

/**
 * B3 - homepage "courses by category" explorer. Shows two main categories at a
 * time; a basic pill filter switches which two are shown. Data is already
 * tier-gated to homepage-exposure-eligible owners by the server.
 */
export function HomeCategoryExplorer({ sections }: { sections: HomepageCategorySection[] }) {
  const first = sections[0]?.slug
  const second = sections[1]?.slug ?? sections[0]?.slug
  const [selected, setSelected] = React.useState<[string, string]>([first, second])

  if (!sections.length) return null

  const pick = (slug: string) => {
    setSelected((cur) => (cur.includes(slug) ? cur : [cur[1], slug]))
  }

  const shown = selected
    .map((s) => sections.find((sec) => sec.slug === s))
    .filter((s): s is HomepageCategorySection => Boolean(s))

  return (
    <div>
      {sections.length > 1 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
          {sections.map((s) => (
            <Tag key={s.slug} as="button" active={selected.includes(s.slug)} onClick={() => pick(s.slug)}>
              {s.name}
            </Tag>
          ))}
        </div>
      ) : null}

      <div className="bl-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 40, alignItems: 'start' }}>
        {shown.map((sec) => (
          <div key={sec.slug}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--text-brand)', margin: '0 0 20px' }}>
              {sec.name}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {sec.courses.slice(0, 3).map((c) => (
                <CourseCard key={c.slug} {...c} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
