import React from 'react'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/SiteChrome'
import { Listing } from '@/components/site/Listing'
import { getCourseCards, getCourseFilterOptions } from '@/lib/data'
import { parseCourseFilters } from '@/lib/filters'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Wellness opleidingen in België - Alle categorieën',
  description:
    'Zoek en vergelijk wellnessopleidingen in België. Massage, nagelstyliste, schoonheid, yoga, reflexologie en meer. Filter op locatie, lesmoment en erkenning.',
}

type SP = Promise<Record<string, string | string[] | undefined>>

export default async function OpleidingenPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const filters = parseCourseFilters(sp)
  const [{ cards, total }, options] = await Promise.all([
    getCourseCards({ ...filters, limit: 24 }),
    getCourseFilterOptions(),
  ])

  return (
    <SiteChrome>
      <Listing title={`${total} opleidingen in België`} cards={cards} total={total} options={options} activeCategory={filters.categorySlug} />
    </SiteChrome>
  )
}
