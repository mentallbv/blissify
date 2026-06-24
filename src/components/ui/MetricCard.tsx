import React from 'react'

/**
 * Dashboard metric card. Uppercase label, Freight Display value, optional
 * change indicator. `featured` paints the forest surface for the hero metric.
 */
export function MetricCard({
  label,
  value,
  change = null,
  changeTone = 'positive',
  featured = false,
}: {
  label: string
  value: string
  change?: string | null
  changeTone?: 'positive' | 'negative'
  featured?: boolean
}) {
  const onDark = featured
  const changeColor = changeTone === 'negative' ? 'var(--status-error)' : 'var(--status-success)'
  return (
    <div
      style={{
        background: featured ? 'var(--surface-dark)' : 'var(--surface-card)',
        border: featured ? 'none' : '0.5px solid var(--border-hairline)',
        borderRadius: 'var(--radius-md)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 148,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-ui)',
          fontWeight: 'var(--fw-ui-medium)',
          fontSize: 'var(--type-label)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--track-label)',
          lineHeight: 1.3,
          minHeight: '2.6em',
          color: onDark ? 'rgba(245,240,234,0.6)' : 'var(--text-meta)',
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--fw-display-light)',
            fontSize: 44,
            lineHeight: 1,
            letterSpacing: 'var(--track-display)',
            color: onDark ? 'var(--blissify-chalk)' : 'var(--text-brand)',
          }}
        >
          {value}
        </div>
        {change ? (
          <div
            style={{
              marginTop: 'var(--space-3)',
              fontFamily: 'var(--font-ui)',
              fontWeight: 'var(--fw-ui-regular)',
              fontSize: 'var(--type-xs)',
              color: onDark ? 'rgba(245,240,234,0.7)' : changeColor,
            }}
          >
            {change}
          </div>
        ) : null}
      </div>
    </div>
  )
}
