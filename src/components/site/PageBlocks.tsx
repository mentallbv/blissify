import React from 'react'
import { ButtonLink } from '@/components/ui'

/* Loose block types - the Pages collection is admin-defined; payload-types
   gains the exact shape after `payload generate:types` runs against the DB. */
type Block = { blockType: string; [k: string]: unknown }

function lexToParagraphs(rt: unknown): string[] {
  const root = (rt as { root?: { children?: unknown[] } })?.root
  if (!root?.children) return []
  return root.children
    .map((p) => {
      const kids = (p as { children?: { text?: string }[] }).children || []
      return kids.map((k) => k.text || '').join('')
    })
    .filter(Boolean)
}

const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])

export function PageBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.blockType) {
          case 'richText':
            return (
              <section key={i} className="bl-container" style={{ paddingTop: 48, paddingBottom: 48 }}>
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                  {lexToParagraphs(b.content).map((p, j) => (
                    <p key={j} style={{ fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', margin: '0 0 14px' }}>
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            )
          case 'stats':
            return (
              <section key={i} style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)', borderBottom: '0.5px solid var(--border-hairline)' }}>
                <div className="bl-container" style={{ paddingTop: 72, paddingBottom: 72, display: 'grid', gridTemplateColumns: `repeat(${Math.min(arr(b.items).length || 1, 4)}, 1fr)`, gap: 32, textAlign: 'center' }}>
                  {arr<{ value: string; label: string }>(b.items).map((s, j) => (
                    <div key={j}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 64, lineHeight: 1, letterSpacing: '-0.01em', color: 'var(--text-brand)' }}>{s.value}</div>
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-meta)', marginTop: 10 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </section>
            )
          case 'features':
            return (
              <section key={i} className="bl-container" style={{ paddingTop: 64, paddingBottom: 64 }}>
                <div className="bl-grid-3">
                  {arr<{ icon?: string; title: string; body?: string }>(b.items).map((f, j) => (
                    <div key={j} style={{ border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 28, background: 'var(--surface-card)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {f.icon ? <i className={f.icon} style={{ fontSize: 26, color: 'var(--text-accent)' }} /> : null}
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)', lineHeight: 1.2 }}>{f.title}</div>
                      {f.body ? <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.6, color: 'var(--text-body)', margin: 0 }}>{f.body}</p> : null}
                    </div>
                  ))}
                </div>
              </section>
            )
          case 'testimonial':
            return (
              <section key={i} className="bl-container" style={{ paddingTop: 88, paddingBottom: 88, textAlign: 'center' }}>
                <div style={{ maxWidth: 920, margin: '0 auto' }}>
                  <blockquote style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 32, lineHeight: 1.35, color: 'var(--text-brand)', margin: 0, textWrap: 'balance' }}>
                    “{String(b.quote || '')}”
                  </blockquote>
                  {b.author ? (
                    <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 14, color: 'var(--text-body)', marginTop: 20 }}>
                      {String(b.author)}
                      {b.company ? ` · ${String(b.company)}` : ''}
                    </div>
                  ) : null}
                </div>
              </section>
            )
          case 'cta': {
            const dark = b.background !== 'chalk'
            return (
              <section key={i} style={{ background: dark ? 'var(--surface-dark)' : 'var(--surface-page)' }}>
                <div className="bl-container" style={{ paddingTop: 80, paddingBottom: 80, textAlign: 'center' }}>
                  <div style={{ maxWidth: 920, margin: '0 auto' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 44, letterSpacing: '-0.01em', lineHeight: 1.1, margin: 0, color: dark ? 'var(--blissify-chalk)' : 'var(--text-brand)' }}>
                    {String(b.title || '')}
                  </h2>
                  {b.body ? (
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1.7, margin: '16px auto 28px', maxWidth: 480, color: dark ? 'rgba(245,240,234,0.7)' : 'var(--text-body)' }}>
                      {String(b.body)}
                    </p>
                  ) : null}
                  {b.buttonLabel ? (
                    <ButtonLink href={String(b.buttonUrl || '#')} variant="accent">
                      {String(b.buttonLabel)}
                    </ButtonLink>
                  ) : null}
                  </div>
                </div>
              </section>
            )
          }
          case 'pricingTiers':
            return (
              <section key={i} className="bl-container" style={{ paddingTop: 64, paddingBottom: 64 }}>
                <div className="bl-grid-3" style={{ alignItems: 'start' }}>
                  {arr<{ name: string; price: string; period?: string; recommended?: boolean; features?: { feature?: string }[]; ctaLabel?: string; ctaUrl?: string }>(b.items).map((t, j) => (
                    <div key={j} style={{ border: '0.5px solid ' + (t.recommended ? 'var(--blissify-forest)' : 'var(--border-hairline)'), borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', padding: 28 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)' }}>{t.name}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '12px 0 18px' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 44, color: 'var(--text-brand)' }}>{t.price}</span>
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-meta)' }}>{t.period || '/jaar'}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                        {arr<{ feature?: string }>(t.features).map((f, k) => (
                          <div key={k} style={{ display: 'flex', gap: 10, alignItems: 'center', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-body)' }}>
                            <i className="ti ti-check" style={{ fontSize: 16, color: 'var(--text-accent)' }} />
                            {f.feature}
                          </div>
                        ))}
                      </div>
                      {t.ctaLabel ? (
                        <ButtonLink href={String(t.ctaUrl || '#')} variant={t.recommended ? 'accent' : 'primary'} fullWidth>
                          {t.ctaLabel}
                        </ButtonLink>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            )
          case 'comparison': {
            const rows = arr<{ feature: string; v1?: string; v2?: string; v3?: string }>(b.rows)
            const cell: React.CSSProperties = { padding: '14px 20px', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-body)', textAlign: 'center', borderTop: '0.5px solid var(--border-hairline)' }
            return (
              <section key={i} className="bl-container" style={{ paddingTop: 48, paddingBottom: 48 }}>
                <div style={{ border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--surface-card)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', background: 'var(--surface-page)' }}>
                    {['Functie', String(b.col1 || 'Basis'), String(b.col2 || 'Medium'), String(b.col3 || 'Premium')].map((h, k) => (
                      <div key={k} style={{ padding: '14px 20px', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: k === 0 ? 11 : 13, textTransform: k === 0 ? 'uppercase' : 'none', letterSpacing: k === 0 ? '0.1em' : '0', color: k === 0 ? 'var(--text-meta)' : 'var(--text-strong)', textAlign: k === 0 ? 'left' : 'center' }}>
                        {h}
                      </div>
                    ))}
                  </div>
                  {rows.map((r, k) => (
                    <div key={k} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                      <div style={{ ...cell, textAlign: 'left', color: 'var(--text-strong)' }}>{r.feature}</div>
                      <div style={cell}>{r.v1 || '–'}</div>
                      <div style={cell}>{r.v2 || '–'}</div>
                      <div style={cell}>{r.v3 || '–'}</div>
                    </div>
                  ))}
                </div>
              </section>
            )
          }
          case 'faq':
            return (
              <section key={i} className="bl-container" style={{ paddingTop: 64, paddingBottom: 64 }}>
                <div style={{ maxWidth: 820, margin: '0 auto', borderTop: '0.5px solid var(--border-hairline)' }}>
                  {arr<{ question: string; answer: string }>(b.items).map((f, j) => (
                    <div key={j} style={{ borderBottom: '0.5px solid var(--border-hairline)', padding: '22px 0' }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 20, color: 'var(--text-brand)', margin: '0 0 8px' }}>{f.question}</h3>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-body)', margin: 0 }}>{f.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )
          case 'logos':
            return (
              <section key={i} className="bl-container" style={{ paddingTop: 48, paddingBottom: 48 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
                  {arr<{ logo?: { url?: string } }>(b.items).map((l, j) =>
                    l.logo?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={j} src={l.logo.url} alt="" style={{ height: 36, width: 'auto' }} />
                    ) : null,
                  )}
                </div>
              </section>
            )
          default:
            return null
        }
      })}
    </>
  )
}
