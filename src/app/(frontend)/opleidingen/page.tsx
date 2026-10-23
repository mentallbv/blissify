import React from 'react'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/SiteChrome'
import { Listing } from '@/components/site/Listing'
import { getCourseCards, getCourseFilterOptions } from '@/lib/data'
import { parseCourseFilters } from '@/lib/filters'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Alle wellness- en beautyopleidingen in België en Nederland',
  description:
    'Zoek en vergelijk wellness- en beautyopleidingen in België en Nederland. Massage, nagelstyliste, schoonheid, yoga, reflexologie en meer. Filter op locatie, lesmoment en certificaat.',
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
      <Listing title={`${total} wellness- en beautyopleidingen`} cards={cards} total={total} options={options} activeCategory={filters.categorySlug} />
    </SiteChrome>
  )
}
