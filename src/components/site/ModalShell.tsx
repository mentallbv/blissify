'use client'

import React from 'react'

/** Small accessible dialog used by the apply and report forms. */
export function ModalShell({ title, onClose, children, width = 520 }: { title: string; onClose: () => void; children: React.ReactNode; width?: number }) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])
  return (
    <div role="dialog" aria-modal="true" aria-label={title} onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(30, 36, 44, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: width, maxHeight: 'calc(100vh - 32px)', overflowY: 'auto', background: 'var(--surface-page)', borderRadius: 'var(--radius-md)', padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)', margin: 0 }}>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Sluiten" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-meta)' }}><i className="ti ti-x" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
