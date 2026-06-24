import React from 'react'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/SiteChrome'
import { Listing } from '@/components/site/Listing'
import { getCourseCards } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Wellness opleidingen in België - Alle categorieën',
  description:
    'Zoek en vergelijk wellnessopleidingen in België. Massage, nagelstyliste, schoonheid, yoga, reflexologie en meer. Filter op locatie, lesmoment en erkenning.',
}

export default async function OpleidingenPage() {
  const { cards, total } = await getCourseCards({ limit: 24 })
  return (
    <SiteChrome>
      <Listing title={`${total} opleidingen in België`} cards={cards} total={total} />
    </SiteChrome>
  )
}
