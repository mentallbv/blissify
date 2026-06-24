import React from 'react'
import { SiteChrome } from '@/components/site/SiteChrome'
import { Listing } from '@/components/site/Listing'
import type { CourseCardData } from '@/lib/data'

export function CityLanding({
  categoryName,
  categorySlug,
  cityName,
  cards,
  total,
}: {
  categoryName: string
  categorySlug: string
  cityName: string
  cards: CourseCardData[]
  total: number
  intro?: string
}) {
  return (
    <SiteChrome>
      <Listing title={`Opleiding ${categoryName.toLowerCase()} in ${cityName}`} cards={cards} total={total} activeCategory={categorySlug} />
    </SiteChrome>
  )
}
