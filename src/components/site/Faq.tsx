'use client'

import React from 'react'

export type FaqItem = { q: string; a: string }

/** Single-open FAQ accordion. `variant="card"` = home (rounded cards); "list" = bordered rows. */
export function Faq({ items, variant = 'list', defaultOpen = 0 }: { items: FaqItem[]; variant?: 'card' | 'list'; defaultOpen?: number }) {
  const [open, setOpen] = React.useState(defaultOpen)
  const toggle = (i: number) => setOpen((cur) => (cur === i ? -1 : i))

  if (variant === 'card') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((f, i) => (
          <div key={f.q} className={'bl-faq-item' + (open === i ? ' is-open' : '')} style={{ background: 'var(--surface-page)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '22px 24px' }}>
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-expanded={open === i}
              aria-controls={`faq-card-${i}`}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, textAlign: 'left' }}
            >
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 19, color: 'var(--text-brand)', lineHeight: 1.25 }}>{f.q}</span>
              <i className="ti ti-plus bl-faq-icon" aria-hidden="true" style={{ fontSize: 20, color: 'var(--text-brand)', flex: 'none' }} />
            </button>
            <div id={`faq-card-${i}`} className="bl-faq-answer" aria-hidden={open !== i}>
              <div>
                <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-body)', margin: '14px 0 0' }}>{f.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ borderTop: '0.5px solid var(--border-hairline)' }}>
      {items.map((f, i) => (
        <div key={f.q} className={'bl-faq-item' + (open === i ? ' is-open' : '')} style={{ borderBottom: '0.5px solid var(--border-hairline)' }}>
          <button
            type="button"
            onClick={() => toggle(i)}
            aria-expanded={open === i}
            aria-controls={`faq-list-${i}`}
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, textAlign: 'left' }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 20, color: 'var(--text-brand)', lineHeight: 1.2 }}>{f.q}</span>
            <i className="ti ti-plus bl-faq-icon" aria-hidden="true" style={{ fontSize: 20, color: 'var(--text-accent)', flex: 'none' }} />
          </button>
          <div id={`faq-list-${i}`} className="bl-faq-answer" aria-hidden={open !== i}>
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-body)', margin: 0, padding: '0 0 24px', maxWidth: 680 }}>{f.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
