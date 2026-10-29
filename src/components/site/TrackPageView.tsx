'use client'

import React from 'react'

/** Fire-and-forget analytics page-view tracker. Renders nothing. */
export function TrackPageView({
  kind,
  id,
  owner,
}: {
  kind: 'course' | 'trainer' | 'brand' | 'vacancy'
  id: number | string | null | undefined
  /** For vacancies: the profile the view counts towards. */
  owner?: { kind: 'trainer' | 'brand'; id: number | string } | null
}) {
  React.useEffect(() => {
    if (id == null) return
    const controller = new AbortController()
    fetch('/api/analytics-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, id, ownerKind: owner?.kind, ownerId: owner?.id }),
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {})
    return () => controller.abort()
  }, [kind, id, owner?.kind, owner?.id])
  return null
}
