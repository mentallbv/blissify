import type { Metadata } from 'next'
import { PricingDetailPage } from '@/components/site/PricingDetailPage'
import { getPricingCatalog } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Prijzen voor opleiders | Blissify',
  description: 'Vergelijk de Blissify-abonnementen voor opleiders en kies jaarlijkse of maandelijkse betaling.',
}

export default async function OpleiderPrijzenPage() {
  return <PricingDetailPage catalog={await getPricingCatalog()} audience="opleiders" />
}
