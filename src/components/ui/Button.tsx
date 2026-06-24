import React from 'react'

type Variant = 'primary' | 'accent' | 'ghost' | 'ghost-dark'
type Size = 'sm' | 'md' | 'lg'

const cls = (variant: Variant, size: Size, fullWidth: boolean) =>
  [
    'bl-btn',
    `bl-btn--${variant}`,
    size === 'sm' ? 'bl-btn--sm' : size === 'lg' ? 'bl-btn--lg' : '',
    fullWidth ? 'bl-btn--full' : '',
  ]
    .filter(Boolean)
    .join(' ')

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon = null,
  children,
  ...rest
}: {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={cls(variant, size, fullWidth)} {...rest}>
      {icon ? (
        <span aria-hidden="true" style={{ display: 'inline-flex', fontSize: 16 }}>
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  )
}

/** Link styled as a Blissify button. */
export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon = null,
  children,
  ...rest
}: {
  href: string
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a href={href} className={cls(variant, size, fullWidth)} {...rest}>
      {icon ? (
        <span aria-hidden="true" style={{ display: 'inline-flex', fontSize: 16 }}>
          {icon}
        </span>
      ) : null}
      {children}
    </a>
  )
}
