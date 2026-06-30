import React from 'react'
import { SiteChrome } from '@/components/site/SiteChrome'
import { Listing } from '@/components/site/Listing'
import { getCourseFilterOptions, type CourseCardData } from '@/lib/data'

export async function CityLanding({
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
  const options = await getCourseFilterOptions()
  return (
    <SiteChrome>
      <Listing
        title={`Opleiding ${categoryName.toLowerCase()} in ${cityName}`}
        cards={cards}
        total={total}
        options={options}
        activeCategory={categorySlug}
        lockCategory
      />
    </SiteChrome>
  )
}
