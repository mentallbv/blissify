'use client'

import React from 'react'

/** Fire-and-forget analytics page-view tracker. Renders nothing. */
export function TrackPageView({ kind, id }: { kind: 'course' | 'trainer' | 'brand'; id: number | string | null | undefined }) {
  React.useEffect(() => {
    if (id == null) return
    const controller = new AbortController()
    fetch('/api/analytics-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, id }),
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {})
    return () => controller.abort()
  }, [kind, id])
  return null
}
