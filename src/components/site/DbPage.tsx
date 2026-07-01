import React from 'react'
import { SiteChrome } from '@/components/site/SiteChrome'
import { PageBlocks } from '@/components/site/PageBlocks'
import type { PageDoc } from '@/lib/pages'

/** Renders a Pages-collection document (hero + blocks) inside the site chrome. */
export function DbPage({ page }: { page: PageDoc }) {
  const hero = page.hero
  return (
    <SiteChrome>
      {hero && (hero.title || hero.eyebrow) ? (
        <section className="bl-container" style={{ paddingTop: 96, paddingBottom: 48 }}>
          <div style={{ maxWidth: 920 }}>
          {hero.eyebrow ? (
            <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-accent)' }}>
              {hero.eyebrow}
            </span>
          ) : null}
          {hero.title ? (
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 56, lineHeight: 1.05, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: '18px 0 0', textWrap: 'balance' }}>
              {hero.title}
            </h1>
          ) : null}
          {hero.subtitle ? (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 18, lineHeight: 1.7, color: 'var(--text-body)', maxWidth: 680, margin: '24px 0 0' }}>
              {hero.subtitle}
            </p>
          ) : null}
          </div>
        </section>
      ) : null}
      <PageBlocks blocks={page.blocks || []} />
    </SiteChrome>
  )
}
