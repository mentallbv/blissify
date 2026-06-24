import React from 'react'

/**
 * Blissify course card - the marketplace's core unit.
 * Forest image area with overlay category label; Freight Display title;
 * price / format footer. Renders as a link. Hover darkens border only (CSS).
 */
export function CourseCard({
  href = '#',
  title,
  category,
  provider,
  location,
  price,
  format,
  image = null,
}: {
  href?: string
  title: string
  category: string
  provider: string
  location: string
  price: string
  format: string
  image?: string | null
}) {
  return (
    <a href={href} className="bl-coursecard" style={{ display: 'block', overflow: 'hidden' }}>
      <div
        style={{
          position: 'relative',
          height: 200,
          background: 'var(--surface-dark)',
          backgroundImage: image ? `url(${image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: 14,
            bottom: 12,
            fontFamily: 'var(--font-ui)',
            fontWeight: 'var(--fw-ui-medium)',
            fontSize: 'var(--type-nano)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--track-label)',
            color: 'var(--blissify-chalk)',
            opacity: 0.7,
          }}
        >
          {category}
        </span>
      </div>
      <div style={{ padding: 16 }}>
        <h3
          style={{
            margin: '0 0 6px',
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--fw-display-regular)',
            fontSize: 18,
            color: 'var(--text-brand)',
            lineHeight: 'var(--lh-snug)',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: '0 0 12px',
            fontFamily: 'var(--font-ui)',
            fontWeight: 'var(--fw-ui-regular)',
            fontSize: 'var(--type-xs)',
            color: 'var(--text-body)',
            lineHeight: 1.4,
          }}
        >
          {provider} · {location}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 'var(--fw-ui-medium)',
              fontSize: 'var(--type-sm)',
              color: 'var(--text-brand)',
            }}
          >
            {price}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 'var(--fw-ui-medium)',
              fontSize: 'var(--type-micro)',
              textTransform: 'uppercase',
              letterSpacing: 'var(--track-meta)',
              color: 'var(--text-accent)',
            }}
          >
            {format}
          </span>
        </div>
      </div>
    </a>
  )
}
