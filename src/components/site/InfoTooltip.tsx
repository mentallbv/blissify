import React from 'react'

/**
 * Small (i) marker that reveals an explanation on hover or keyboard focus.
 * Pure CSS (see `.bl-info` in blissify.css) so it works in both server and
 * client components without extra JS. Used to explain subscription/pricing
 * line items the client flagged as sometimes unclear.
 */
export function InfoTooltip({
  text,
  label,
  placement = 'above',
  align = 'center',
}: {
  text: string
  label?: string
  /** 'below' for markers at the top of a scroll box (e.g. table headers), which clips anything above it. */
  placement?: 'above' | 'below'
  /** 'end' right-aligns the bubble, for markers near the right edge of a box. */
  align?: 'center' | 'end'
}) {
  const cls = 'bl-info' + (placement === 'below' ? ' bl-info--below' : '') + (align === 'end' ? ' bl-info--end' : '')
  return (
    <span className={cls} tabIndex={0} role="note" aria-label={label ? `${label}: ${text}` : text}>
      <i className="ti ti-info-circle" aria-hidden="true" />
      <span className="bl-info-pop" role="tooltip">
        {text}
      </span>
    </span>
  )
}
