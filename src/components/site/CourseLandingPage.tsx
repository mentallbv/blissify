import React from 'react'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/SiteChrome'
import { Listing } from '@/components/site/Listing'
import { HubContent } from '@/components/site/HubContent'
import { getCourseCards, getCourseFilterOptions } from '@/lib/data'
import { parseCourseFilters } from '@/lib/filters'
import type { CourseLanding } from '@/lib/course-landings'
import { LANDING_INDEX_MIN } from '@/lib/vacancy-landings'

const SITE = 'https://blissify.vercel.app'
type SP = Record<string, string | string[] | undefined>

/** Indexed as its own page from five courses; below that, canonical to /opleidingen (copy 10/2026). */
export async function courseLandingMetadata(l: CourseLanding): Promise<Metadata> {
  const { total } = await getCourseCards({ categorySlugs: l.categories, limit: 1 })
  const own = total >= LANDING_INDEX_MIN
  return {
    title: l.title,
    description: l.description,
    alternates: { canonical: own ? `${SITE}/opleidingen/${l.key}` : `${SITE}/opleidingen` },
    robots: own ? undefined : { index: false, follow: true },
  }
}

// Internal links the copy asks for on these pages.
const RELATED: Record<string, { href: string; label: string }[]> = {
  schoonheidsspecialiste: [{ href: '/vacatures/schoonheidsspecialiste', label: 'Vacature schoonheidsspecialiste' }, { href: '/werkruimtes', label: 'Werkruimtes' }, { href: '/opleidingen/pedicure', label: 'Opleiding pedicure' }, { href: '/opleidingen/massage', label: 'Massage opleiding' }],
  nagelstyliste: [{ href: '/vacatures/nagelstyliste', label: 'Vacature nagelstyliste' }, { href: '/werkruimtes/stoelhuur', label: 'Stoelhuur' }],
  pedicure: [{ href: '/vacatures/pedicure', label: 'Vacature pedicure' }, { href: '/werkruimtes/behandelruimte', label: 'Behandelruimte' }, { href: '/opleidingen/reflexologie', label: 'Voetreflexologie opleiding' }],
  massage: [{ href: '/vacatures/masseur', label: 'Vacature masseur' }, { href: '/werkruimtes/behandelruimte', label: 'Behandelruimte' }, { href: '/opleidingen/reflexologie', label: 'Voetreflexologie opleiding' }],
  yoga: [{ href: '/werkruimtes', label: 'Werkruimtes' }, { href: '/opleidingen/massage', label: 'Massage opleiding' }],
  reflexologie: [{ href: '/opleidingen/massage', label: 'Massage opleiding' }, { href: '/opleidingen/pedicure', label: 'Opleiding pedicure' }],
}

export async function CourseLandingPage({ landing: l, searchParams }: { landing: CourseLanding; searchParams: SP }) {
  const filters = { ...parseCourseFilters(searchParams), categorySlug: undefined, categorySlugs: l.categories }
  const [{ cards, total }, options] = await Promise.all([getCourseCards({ ...filters, limit: 24 }), getCourseFilterOptions()])
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Opleidingen', item: `${SITE}/opleidingen` },
      { '@type': 'ListItem', position: 2, name: l.h1, item: `${SITE}/opleidingen/${l.key}` },
    ],
  }
  return (
    <SiteChrome>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Listing
        title={l.h1}
        header={{ eyebrow: 'Opleidingen', title: l.h1, intro: l.intro }}
        cards={cards}
        total={total}
        options={options}
        lockCategory
      />
      <HubContent
        sections={l.sections.map((s) => ({ h2: s.h2, body: s.body, sub: s.sub.map((x) => ({ h3: x.h3, body: x.body })) }))}
        faqTitle={l.faqTitle}
        faq={l.faq}
        links={[{ href: '/opleidingen', label: 'Alle opleidingen' }, ...(RELATED[l.key] || []), { href: '/abonnementen-tarieven', label: 'Zelf een opleiding aanbieden' }]}
      />
    </SiteChrome>
  )
}
