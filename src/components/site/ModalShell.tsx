'use client'

import React from 'react'
import { createPortal } from 'react-dom'

/**
 * Dialog for the apply / report flows: a centred card on desktop and a
 * bottom sheet on phones (styles: .bl-dialog in blissify.css). Escape and the
 * backdrop close it; focus moves into it and back to the trigger. Rendered
 * into <body> so a sticky or transformed parent (the mobile apply bar)
 * cannot trap it in its own stacking context.
 */
export function ModalShell({ title, subtitle, onClose, children, width = 520 }: { title: string; subtitle?: React.ReactNode; onClose: () => void; children: React.ReactNode; width?: number }) {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.querySelector<HTMLElement>('input, textarea, select, button, a')?.focus({ preventScroll: true })
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      opener?.focus?.({ preventScroll: true })
    }
  }, [onClose])
  return createPortal(
    <div className="bl-dialog-backdrop" onClick={onClose}>
      <div ref={ref} className="bl-dialog" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} style={{ maxWidth: width }}>
        <div className="bl-dialog-head">
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 23, lineHeight: 1.2, color: 'var(--text-brand)', margin: 0, textWrap: 'balance' }}>{title}</h2>
            {subtitle ? <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-strong)', marginTop: 4 }}>{subtitle}</div> : null}
          </div>
          <button type="button" onClick={onClose} aria-label="Sluiten" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--text-strong)', padding: 4, marginRight: -4 }}><i className="ti ti-x" /></button>
        </div>
        <div className="bl-dialog-body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
