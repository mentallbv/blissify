import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteChrome, SectionHead } from '@/components/site/SiteChrome'
import { TypeBadge, CourseCard, ButtonLink, Tag } from '@/components/ui'
import { RichTextContent } from '@/components/site/RichTextContent'
import { TrackPageView } from '@/components/site/TrackPageView'
import { TrackedLink } from '@/components/site/TrackedLink'
import { getProviderBySlug } from '@/lib/data'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const { provider } = await getProviderBySlug(slug)
  if (!provider) return {}
  return {
    title: `${provider.name} - Opleider | Blissify`,
    description: `${provider.name} is een opleider op Blissify in ${provider.location}, gespecialiseerd in ${provider.speciality.toLowerCase()}.`,
  }
}

export default async function ProviderProfilePage({ params }: Params) {
  const { slug } = await params
  const { provider: p, courses } = await getProviderBySlug(slug)
  if (!p) notFound()

  // Several Belgian cities share their province's name (Antwerpen, Luik...);
  // showing both would read as "Antwerpen, Antwerpen".
  const place = [p.location, p.province && p.province !== p.location ? p.province : ''].filter(Boolean).join(', ')
  return (
    <SiteChrome>
      {p.id != null ? <TrackPageView kind="trainer" id={p.id} /> : null}
      {/* Dark header */}
      <div>
      <header style={{ background: 'var(--surface-dark)', borderTop: '3px solid var(--blissify-forest)' }}>
        <div className="bl-container bl-provider-hero" style={{ paddingTop: 48, paddingBottom: 48, display: 'flex', gap: 24, alignItems: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 80px', overflow: 'hidden' }}>
            {p.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.logo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 40, color: 'var(--blissify-forest)' }}>
                {p.initial}
              </span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 48, lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--blissify-chalk)', margin: 0 }}>
              {p.name}
            </h1>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'rgba(245,240,234,0.7)', margin: '8px 0 12px' }}>
              {[place, p.speciality, p.online ? 'Ook online' : '']
                .filter(Boolean)
                .join(' · ')}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <TypeBadge type="trainer" style={{ background: 'transparent', border: '1px solid rgba(245,240,234,0.45)' }} />
              {p.hasPremiumBadge ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 'var(--radius-pill)', padding: '5px 11px', background: 'var(--blissify-chalk)', color: 'var(--text-brand)', fontFamily: 'var(--font-ui)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                  <i className="ti ti-crown" /> Premium
                </span>
              ) : null}
            </div>
          </div>
          {p.email ? (
            <div className="bl-provider-hero-cta">
              <ButtonLink href={`mailto:${p.email}`} variant="accent">Contacteer opleider</ButtonLink>
            </div>
          ) : null}
        </div>
      </header>

      {/* Bio + contact */}
      <section className="bl-container" style={{ paddingTop: 64, paddingBottom: 0 }}>
        <div className="bl-detail-split">
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 28, color: 'var(--text-brand)', margin: '0 0 16px' }}>
              Over {p.name}
            </h2>
            <div style={{ marginBottom: 24 }}>
              <RichTextContent data={p.bio} />
            </div>

            {p.specializations?.length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 36 }}>
                {p.specializations.map((s) => (
                  <Tag key={s} as="span">
                    {s}
                  </Tag>
                ))}
              </div>
            ) : null}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, borderTop: '0.5px solid var(--border-hairline)', paddingTop: 28, maxWidth: 560 }}>
              {([
                ['Locatie', place],
                ['Opleidingen op Blissify', `${p.courseCount} ${p.courseCount === 1 ? 'opleiding' : 'opleidingen'}`],
                ['Online lesgeven', p.online ? 'Ja' : ''],
                ['Website', p.website || ''],
              ] as [string, string][]).filter(([, value]) => Boolean(value)).map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 'var(--type-label)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-meta)', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 15, color: 'var(--text-strong)' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 24 }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 'var(--type-label)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-meta)', marginBottom: 14 }}>
              Contacteer opleider
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {([
                ['ti-map-pin', place, '', ''],
                ['ti-stack-2', `${p.courseCount} actieve ${p.courseCount === 1 ? 'opleiding' : 'opleidingen'}`, '', ''],
                ['ti-world', p.website, p.website ? (p.website.startsWith('http') ? p.website : `https://${p.website}`) : '', 'website_click'],
                ['ti-mail', p.email, p.email ? `mailto:${p.email}` : '', ''],
                ['ti-phone', p.phone, p.phone ? `tel:${p.phone.replace(/\s/g, '')}` : '', ''],
                ['ti-brand-instagram', p.social?.instagram, p.social?.instagram ? `https://instagram.com/${p.social.instagram.replace(/^@/, '')}` : '', 'social_click'],
                ['ti-brand-facebook', p.social?.facebook, p.social?.facebook || '', 'social_click'],
                ['ti-brand-tiktok', p.social?.tiktok, p.social?.tiktok ? `https://tiktok.com/@${p.social.tiktok.replace(/^@/, '')}` : '', 'social_click'],
                ['ti-brand-linkedin', p.social?.linkedin, p.social?.linkedin || '', 'social_click'],
              ] as [string, string, string, string][])
                .filter(([, text]) => Boolean(text))
                .map(([ic, text, href, track]) => (
                  <div key={text} style={{ display: 'flex', gap: 10, alignItems: 'center', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-body)' }}>
                    <i className={'ti ' + ic} style={{ fontSize: 17, color: 'var(--text-meta)', flex: 'none' }} />
                    {href ? (
                      track && href.startsWith('http') ? (
                        <TrackedLink kind="trainer" entityId={p.id} type={track as 'website_click' | 'social_click'} href={href} target="_blank" rel="noreferrer" style={{ color: 'var(--text-accent)', wordBreak: 'break-word' }}>
                          {text}
                        </TrackedLink>
                      ) : (
                        <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" style={{ color: 'var(--text-accent)', wordBreak: 'break-word' }}>
                          {text}
                        </a>
                      )
                    ) : (
                      text
                    )}
                  </div>
                ))}
            </div>
            {p.email ? (
              <ButtonLink href={`mailto:${p.email}?subject=${encodeURIComponent(`Vraag via Blissify - ${p.name}`)}`} variant="primary" fullWidth>
                Vraag informatie aan
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </section>

      {/* Courses by provider */}
      <section className="bl-container" style={{ paddingTop: 64, paddingBottom: 96 }}>
        <div style={{ marginBottom: 32 }}>
          <SectionHead size={28}>Opleidingen van deze opleider</SectionHead>
        </div>
        {courses.length ? (
          <div className="bl-grid-3">
            {courses.map((c) => (
              <CourseCard key={c.slug} {...c} />
            ))}
          </div>
        ) : (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--text-meta)' }}>
            Deze opleider heeft momenteel geen gepubliceerde opleidingen.
          </p>
        )}
      </section>
      </div>
    </SiteChrome>
  )
}
