'use client'

import React from 'react'

/** Read-only link with a copy button (review links, item 8). */
export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = React.useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked: the field stays selectable */
    }
  }
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        aria-label="Reviewlink"
        style={{ flex: '1 1 260px', minWidth: 0, border: '0.5px solid var(--neutral-200)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-page)', padding: '9px 12px', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-body)' }}
      />
      <button type="button" onClick={copy} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '0.5px solid var(--border-hairline)', borderRadius: 999, background: 'var(--surface-card)', padding: '8px 14px', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-brand)', cursor: 'pointer' }}>
        <i className={copied ? 'ti ti-check' : 'ti ti-copy'} aria-hidden="true" />
        <span aria-live="polite">{copied ? 'Gekopieerd' : 'Kopieer link'}</span>
      </button>
    </div>
  )
}
