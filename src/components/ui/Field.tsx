import React from 'react'
import { FieldLabel } from './primitives'

/** Blissify text input. 44px, 0.5px border, radius 6px, Acumin Pro 400 14px. */
export function Input({
  label = null,
  icon = null,
  ...rest
}: {
  label?: React.ReactNode
  icon?: React.ReactNode
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label style={{ display: 'block', width: '100%' }}>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <span style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        {icon ? (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 14,
              display: 'inline-flex',
              color: 'var(--text-meta)',
              fontSize: 17,
              pointerEvents: 'none',
            }}
          >
            {icon}
          </span>
        ) : null}
        <input className="bl-input" style={{ padding: icon ? '0 16px 0 42px' : '0 16px' }} {...rest} />
      </span>
    </label>
  )
}

type Opt = string | { value: string; label: string }

/** Blissify select / dropdown - native select styled to the system. */
export function Select({
  label = null,
  options = [],
  placeholder = null,
  ...rest
}: {
  label?: React.ReactNode
  options?: Opt[]
  placeholder?: string | null
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label style={{ display: 'block', width: '100%' }}>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <span style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        <select
          className="bl-select"
          style={{ padding: '0 40px 0 16px', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
          defaultValue=""
          {...rest}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((o) => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o
            return (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            )
          })}
        </select>
        <span
          aria-hidden="true"
          className="ti ti-chevron-down"
          style={{
            position: 'absolute',
            right: 14,
            pointerEvents: 'none',
            color: 'var(--text-meta)',
            fontSize: 17,
          }}
        />
      </span>
    </label>
  )
}
