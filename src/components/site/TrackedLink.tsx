'use client'

import React from 'react'

type TrackType = 'website_click' | 'social_click' | 'register_click'

/**
 * An anchor that fires a fire-and-forget analytics click event before letting
 * the navigation proceed. Used for website / social / inschrijf links on the
 * public profile and course pages so the dashboard can report clicks and CTR.
 */
export function TrackedLink({
  kind,
  entityId,
  type,
  children,
  ...rest
}: {
  kind: 'course' | 'trainer' | 'brand'
  entityId: number | string | null | undefined
  type: TrackType
  children: React.ReactNode
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (entityId != null) {
      try {
        const body = JSON.stringify({ kind, id: entityId, type })
        // sendBeacon survives the page unload of an outbound navigation.
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/analytics-events', new Blob([body], { type: 'application/json' }))
        } else {
          fetch('/api/analytics-events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {})
        }
      } catch {
        /* never block the click */
      }
    }
    rest.onClick?.(e)
  }
  return (
    <a {...rest} onClick={onClick}>
      {children}
    </a>
  )
}
