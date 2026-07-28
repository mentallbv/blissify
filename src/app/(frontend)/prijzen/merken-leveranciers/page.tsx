import type { Metadata } from 'next'
import { PricingDetailPage } from '@/components/site/PricingDetailPage'
import { getPricingCatalog } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Prijzen voor merken en leveranciers | Blissify',
  description: 'Vergelijk de Blissify-partnerformules voor merken en leveranciers.',
}

export default async function MerkenPrijzenPage() {
  return <PricingDetailPage catalog={await getPricingCatalog()} audience="brands" />
}
