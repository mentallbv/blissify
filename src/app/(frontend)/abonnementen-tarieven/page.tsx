import type { Metadata } from 'next'
import { PricingDetailPage } from '@/components/site/PricingDetailPage'
import { getPricingCatalog } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Abonnementen & tarieven',
  description: 'Publiceer opleidingen, vacatures en werkruimtes of presenteer je merk. Vergelijk Lite, Premium en Ultimate, vanaf €15 per maand excl. btw.',
}

type SP = Promise<Record<string, string | string[] | undefined>>

/** One page for both plan families (copy 10/2026); ?voor=merken opens the brand tab. */
export default async function AbonnementenTarievenPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const audience = sp.voor === 'merken' ? 'brands' : 'opleiders'
  return <PricingDetailPage catalog={await getPricingCatalog()} audience={audience} />
}
