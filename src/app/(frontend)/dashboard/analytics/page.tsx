import React from 'react'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { LineChart } from '@/components/dashboard/LineChart'
import { MetricCard, Select } from '@/components/ui'
import { VIEWS_SERIES, VIEWS_LABELS } from '@/lib/dashboard'

export default function DashboardAnalyticsPage() {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <PageTitle>Analytics</PageTitle>
        <div style={{ width: 180 }}>
          <Select
            options={[
              { value: '12m', label: 'Laatste 12 maanden' },
              { value: '6m', label: 'Laatste 6 maanden' },
            ]}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <MetricCard label="Profielweergaven" value="7.640" change="+22% j.o.j." />
        <MetricCard label="Aanvragen" value="312" change="+14% j.o.j." />
        <MetricCard label="Gem. reactietijd" value="3,4u" change="−1,2u" changeTone="positive" />
        <MetricCard label="Conversieratio" value="3,1%" change="+0,4pt" />
      </div>

      <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 8, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)', margin: 0 }}>
            Profielweergaven
          </h2>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)' }}>Maandelijks · laatste 12 maanden</span>
        </div>
        <LineChart series={VIEWS_SERIES} labels={VIEWS_LABELS} />
      </div>
    </>
  )
}
