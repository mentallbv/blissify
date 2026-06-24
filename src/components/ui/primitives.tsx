import React from 'react'

/* Eyebrow / category label - Acumin Pro 500, 11px, uppercase, +0.12em. */
export function Eyebrow({
  tone = 'default',
  children,
}: {
  tone?: 'default' | 'accent' | 'meta'
  children: React.ReactNode
}) {
  const colors = {
    default: 'var(--text-body)',
    accent: 'var(--text-accent)',
    meta: 'var(--text-meta)',
  } as const
  return (
    <span
      style={{
        fontFamily: 'var(--font-ui)',
        fontWeight: 'var(--fw-ui-medium)',
        fontSize: 'var(--type-label)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--track-eyebrow)',
        color: colors[tone],
        lineHeight: 1.4,
      }}
    >
      {children}
    </span>
  )
}

/* Uppercase form label - Acumin Pro 500, 12px, +0.06em. */
export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'block',
        fontFamily: 'var(--font-ui)',
        fontWeight: 'var(--fw-ui-medium)',
        fontSize: 'var(--type-xs)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--track-meta)',
        color: 'var(--text-strong)',
        marginBottom: 'var(--space-2)',
      }}
    >
      {children}
    </span>
  )
}

/* Category tag / pill - default chalk surface; active = forest. */
export function Tag({
  active = false,
  as = 'span',
  children,
  ...rest
}: {
  active?: boolean
  as?: 'span' | 'button' | 'a'
  children: React.ReactNode
} & React.HTMLAttributes<HTMLElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: 'var(--font-ui)',
    fontWeight: 'var(--fw-ui-medium)',
    fontSize: 'var(--type-label)',
    textTransform: 'uppercase',
    letterSpacing: 'var(--track-tag)',
    lineHeight: 1,
    padding: '5px 12px',
    borderRadius: 'var(--radius-pill)',
    border: 'none',
    cursor: as === 'span' ? 'default' : 'pointer',
    background: active ? 'var(--blissify-forest)' : 'var(--neutral-100)',
    color: active ? 'var(--blissify-chalk)' : 'var(--text-body)',
    transition: 'background-color .18s ease, color .18s ease',
  }
  const Comp = as as React.ElementType
  return (
    <Comp style={style} {...rest}>
      {children}
    </Comp>
  )
}

/* Dismissible active-filter pill. */
export function FilterPill({
  children,
  onDismiss,
}: {
  children: React.ReactNode
  onDismiss?: () => void
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        fontFamily: 'var(--font-ui)',
        fontWeight: 'var(--fw-ui-medium)',
        fontSize: 'var(--type-label)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--track-tag)',
        padding: '5px 8px 5px 12px',
        borderRadius: 'var(--radius-pill)',
        background: 'var(--blissify-forest)',
        color: 'var(--blissify-chalk)',
      }}
    >
      {children}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Filter verwijderen"
        className="ti ti-x"
        style={{
          display: 'inline-flex',
          background: 'none',
          border: 'none',
          padding: 0,
          color: 'var(--blissify-chalk)',
          cursor: 'pointer',
          fontSize: 14,
          opacity: 0.8,
        }}
      />
    </span>
  )
}

/* Status pill - active / draft / archived. */
const TONES = {
  active: { bg: 'var(--status-success-bg)', fg: 'var(--status-success)' },
  published: { bg: 'var(--status-success-bg)', fg: 'var(--status-success)' },
  draft: { bg: 'var(--status-neutral-bg)', fg: 'var(--text-body)' },
  archived: { bg: 'var(--status-error-bg)', fg: 'var(--status-error)' },
} as const

export function StatusPill({
  status = 'draft',
  children,
}: {
  status?: keyof typeof TONES
  children?: React.ReactNode
}) {
  const tone = TONES[status] || TONES.draft
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'var(--font-ui)',
        fontWeight: 'var(--fw-ui-medium)',
        fontSize: 'var(--type-micro)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--track-tag)',
        lineHeight: 1,
        padding: '3px 10px',
        borderRadius: 'var(--radius-pill)',
        background: tone.bg,
        color: tone.fg,
      }}
    >
      {children || status}
    </span>
  )
}

/* Provider avatar / logo tile - forest square with Freight Display initial. */
export function Avatar({
  initial = 'B',
  src = null,
  size = 44,
  radius = 6,
}: {
  initial?: string
  src?: string | null
  size?: number
  radius?: number
}) {
  const box: React.CSSProperties = {
    width: size,
    height: size,
    flex: `0 0 ${size}px`,
    borderRadius: radius,
    overflow: 'hidden',
    background: 'var(--surface-dark)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
  if (src) {
    return (
      <span style={box}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </span>
    )
  }
  return (
    <span style={box}>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 'var(--fw-display-light)',
          fontSize: Math.round(size * 0.5),
          color: 'var(--blissify-chalk)',
          lineHeight: 1,
        }}
      >
        {initial}
      </span>
    </span>
  )
}

/* Verified-provider badge - terracotta check + label. */
export function VerifiedBadge({ children = 'Geverifieerde opleider' }: { children?: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        fontFamily: 'var(--font-ui)',
        fontWeight: 'var(--fw-ui-medium)',
        fontSize: 'var(--type-label)',
        letterSpacing: 'var(--track-tag)',
        textTransform: 'uppercase',
        color: 'var(--text-accent)',
      }}
    >
      <span className="ti ti-rosette-discount-check-filled" style={{ fontSize: 15 }} aria-hidden="true" />
      {children}
    </span>
  )
}

/* Base card - white surface on chalk, 0.5px border, radius 8px, no shadow. */
export function Card({
  padding = 24,
  dark = false,
  hover = false,
  style = {},
  children,
  ...rest
}: {
  padding?: number | string
  dark?: boolean
  hover?: boolean
  style?: React.CSSProperties
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={hover ? 'bl-card bl-card-hover' : 'bl-card'}
      style={{
        background: dark ? 'var(--surface-dark)' : 'var(--surface-card)',
        border: dark ? 'none' : '0.5px solid var(--border-hairline)',
        padding: typeof padding === 'number' ? `${padding}px` : padding,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
