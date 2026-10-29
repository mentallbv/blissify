import React from 'react'

/**
 * SEO text + FAQ under a hub listing (copy 10/2026): H2 sections written as
 * search phrases, an FAQ with FAQPage structured data and internal links.
 */
export type HubSection = { h2: string; body: React.ReactNode; sub?: { h3: string; body: React.ReactNode }[] }

const h2: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 'clamp(24px, 2.6vw, 28px)', lineHeight: 1.2, color: 'var(--text-brand)', margin: '0 0 14px', textWrap: 'balance' }
const h3: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 16, color: 'var(--text-brand)', margin: '20px 0 6px' }
const p: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.75, color: 'var(--text-body)', margin: 0, maxWidth: '68ch' }

export function HubContent({ sections, faqTitle, faq, links }: { sections: HubSection[]; faqTitle: string; faq: [string, string][]; links?: { href: string; label: string }[] }) {
  const ld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  return (
    <section style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="bl-container" style={{ paddingTop: 72, paddingBottom: 88 }}>
        <div className="bl-faq-split" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 64, alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 40 }}>
            {sections.map((s) => (
              <div key={s.h2}>
                <h2 style={h2}>{s.h2}</h2>
                <div style={p}>{s.body}</div>
                {s.sub?.map((x) => (
                  <div key={x.h3}>
                    <h3 style={h3}>{x.h3}</h3>
                    <div style={p}>{x.body}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div>
            <h2 style={h2}>{faqTitle}</h2>
            <div style={{ display: 'grid', gap: 18 }}>
              {faq.map(([q, a]) => (
                <div key={q} style={{ borderTop: '0.5px solid var(--border-hairline)', paddingTop: 16 }}>
                  <h3 style={{ ...h3, margin: '0 0 6px' }}>{q}</h3>
                  <p style={p}>{a}</p>
                </div>
              ))}
            </div>
            {links?.length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', marginTop: 28, fontFamily: 'var(--font-ui)', fontSize: 14 }}>
                {links.map((l) => <a key={l.href} href={l.href} className="bl-textlink">{l.label}</a>)}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

/** Dark hub header, same as the course / vacancy / workspace overviews. */
export function HubHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return (
    <section style={{ background: 'var(--surface-dark)' }}>
      <div className="bl-container" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 'var(--type-label)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(225, 230, 234, 0.7)' }}>{eyebrow}</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 'clamp(30px, 4vw, 40px)', lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--blissify-chalk)', margin: '10px 0 0', textWrap: 'balance' }}>{title}</h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'rgba(225, 230, 234, 0.85)', margin: '12px 0 0', maxWidth: 680 }}>{intro}</p>
      </div>
    </section>
  )
}
