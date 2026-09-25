import React from 'react'

/**
 * Small (i) marker that reveals an explanation on hover or keyboard focus.
 * Pure CSS (see `.bl-info` in blissify.css) so it works in both server and
 * client components without extra JS. Used to explain subscription/pricing
 * line items the client flagged as sometimes unclear.
 */
export function InfoTooltip({ text, label }: { text: string; label?: string }) {
  return (
    <span className="bl-info" tabIndex={0} role="note" aria-label={label ? `${label}: ${text}` : text}>
      <i className="ti ti-info-circle" aria-hidden="true" />
      <span className="bl-info-pop" role="tooltip">
        {text}
      </span>
    </span>
  )
}
