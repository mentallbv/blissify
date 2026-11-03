import React from 'react'

/**
 * Salon / professional card. Same build as the brand card (soft media panel,
 * small label, Salsify name, quiet meta) so every overview reads alike.
 */
export function ProviderCard({
  href = '#',
  name,
  location,
  speciality,
  courseCount,
  logo = null,
}: {
  href?: string
  name: string
  initial?: string
  location: string
  speciality: string
  courseCount: number
  logo?: string | null
  type?: 'trainer' | 'brand'
}) {
  const label = [location, speciality].filter(Boolean).join(' · ')
  return (
    <a href={href} className="bl-wscard bl-brandcard">
      <div className="bl-wscard-media bl-brandcard-media">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="bl-brandcard-logo" src={logo} alt={`Logo ${name}`} />
        ) : (
          <span className="bl-brandcard-mark" aria-hidden="true">{name}</span>
        )}
      </div>
      <div className="bl-wscard-body">
        {label ? <div className="bl-brandcard-sector">{label}</div> : null}
        <h3 className="bl-brandcard-name">{name}</h3>
        {courseCount ? <div className="bl-brandcard-meta">{courseCount} {courseCount === 1 ? 'opleiding' : 'opleidingen'}</div> : null}
        <span className="bl-listrow-cta" style={{ marginTop: 'auto' }}>Bekijk profiel →</span>
      </div>
    </a>
  )
}
