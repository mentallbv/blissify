import React from 'react'

/** "X mensen …" pill for the dark profile header (item 6). Renders nothing when count is null. */
export function SocialProof({ count }: { count: number | null }) {
  if (count == null) return null
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 'var(--radius-pill)', padding: '5px 11px', background: 'rgba(255, 255, 255, 0.16)', color: '#fff', fontFamily: 'var(--font-ui)', fontSize: 12 }}>
      <i className="ti ti-users" aria-hidden="true" />
      {count.toLocaleString('nl-BE')} mensen schreven zich in of vroegen info via Blissify
    </span>
  )
}
