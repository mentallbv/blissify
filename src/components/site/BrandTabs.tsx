'use client'

import React from 'react'
import { ProviderCard, CourseCard } from '@/components/ui'
import type { ProviderCardData, CourseCardData, BrandCardData } from '@/lib/data'

export function BrandTabs({
  brand,
  providers,
  courses,
}: {
  brand: BrandCardData
  providers: ProviderCardData[]
  courses: CourseCardData[]
}) {
  const tabs = [
    { id: 'providers', label: `Opleiders (${brand.providerCount})` },
    { id: 'courses', label: `Opleidingen (${brand.courseCount})` },
    { id: 'about', label: `Over ${brand.name}` },
  ] as const
  const [active, setActive] = React.useState<(typeof tabs)[number]['id']>('providers')

  return (
    <>
      <div style={{ borderBottom: '0.5px solid var(--border-hairline)', display: 'flex', gap: 28, marginBottom: 32 }}>
        {tabs.map((t) => {
          const on = active === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0 0 14px',
                fontFamily: 'var(--font-ui)',
                fontWeight: on ? 'var(--fw-ui-medium)' : 'var(--fw-ui-regular)',
                fontSize: 14,
                color: on ? 'var(--text-brand)' : 'var(--text-meta)',
                borderBottom: on ? '1.5px solid var(--blissify-terracotta)' : '1.5px solid transparent',
                marginBottom: '-0.5px',
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {active === 'providers' ? (
        <>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--text-brand)', margin: '0 0 24px' }}>
            Gecertificeerde {brand.name} opleiders
          </h2>
          {providers.length ? (
            <div className="bl-grid-3">
              {providers.map((p) => (
                <ProviderCard key={p.slug} {...p} />
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--text-meta)' }}>Nog geen gecertificeerde opleiders.</p>
          )}
        </>
      ) : null}

      {active === 'courses' ? (
        courses.length ? (
          <div className="bl-grid-3">
            {courses.map((c) => (
              <CourseCard key={c.slug} {...c} />
            ))}
          </div>
        ) : (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--text-meta)' }}>Nog geen gepubliceerde opleidingen.</p>
        )
      ) : null}

      {active === 'about' ? (
        <div style={{ maxWidth: 680 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--text-brand)', margin: '0 0 16px' }}>
            Over {brand.name}
          </h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)' }}>
            {brand.about ||
              `${brand.name} werkt samen met een netwerk van gecertificeerde Blissify-opleiders in de sector ${brand.sector.toLowerCase()}.`}
          </p>
        </div>
      ) : null}
    </>
  )
}
