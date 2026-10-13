import React from 'react'

/** Blissify wordmark (MENTALL rebrand). `light` is the white version for dark surfaces. */
export function Logo({ height = 30, light = false }: { height?: number; light?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={light ? '/brand/logo-wit.svg' : '/brand/logo-blauw.svg'}
      alt="Blissify"
      height={height}
      width={Math.round(height * 2.95)}
      style={{ display: 'block', height, width: 'auto' }}
    />
  )
}
