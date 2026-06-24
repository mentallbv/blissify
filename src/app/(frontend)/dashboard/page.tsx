import React from 'react'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { CourseTable } from '@/components/dashboard/CourseTable'
import { MetricCard, Button } from '@/components/ui'
import { DASH_COURSES, ENQUIRIES } from '@/lib/dashboard'

export default function DashboardOverviewPage() {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <PageTitle>Goedemorgen, Academia Van der Berg.</PageTitle>
        <Button variant="accent" size="sm" icon={<i className="ti ti-plus" />}>
          Opleiding toevoegen
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
        <MetricCard label="Profielweergaven" value="1.020" change="+17% t.o.v. vorige maand" />
        <MetricCard label="Aanvragen" value="64" change="+9% t.o.v. vorige maand" />
        <MetricCard label="Actieve opleidingen" value="9" change="+1 deze maand" />
        <MetricCard label="Conversieratio" value="3,1%" change="+0,4% t.o.v. vorige maand" featured />
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--text-brand)', margin: 0 }}>
          Jouw opleidingen
        </h2>
        <a href="/dashboard/opleidingen" className="bl-textlink">
          Beheer alle opleidingen
        </a>
      </div>
      <CourseTable rows={DASH_COURSES} limit={4} />

      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--text-brand)', margin: '40px 0 16px' }}>
        Recente aanvragen
      </h2>
      <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 8 }}>
        {ENQUIRIES.map((e, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '16px 20px',
              borderBottom: i < ENQUIRIES.length - 1 ? '0.5px solid var(--border-hairline)' : 'none',
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 6,
                background: 'var(--surface-dark)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontWeight: 'var(--fw-display-light)',
                fontSize: 16,
                color: 'var(--blissify-chalk)',
              }}
            >
              {e.name[0]}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 14, color: 'var(--text-strong)' }}>{e.name}</div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-body)' }}>{e.course}</div>
            </div>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)' }}>{e.when}</span>
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontWeight: 'var(--fw-ui-medium)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: e.status === 'Nieuw' ? 'var(--text-accent)' : 'var(--text-meta)',
                width: 90,
                textAlign: 'right',
              }}
            >
              {e.status}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}
