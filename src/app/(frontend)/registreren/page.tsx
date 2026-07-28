import React from 'react'
import type { Metadata } from 'next'
import { AuthView } from '@/components/site/AuthView'
import { getPricingCatalog } from '@/lib/data'

export const metadata: Metadata = { title: 'Account aanmaken' }

export default async function RegistrerenPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; tier?: string; billing?: string }>
}) {
  const params = await searchParams
  const catalog = await getPricingCatalog()
  return (
    <AuthView
      mode="registreren"
      initialRole={params.type === 'brand' ? 'brand' : 'trainer'}
      initialTier={params.tier}
      initialBilling={params.billing === 'monthly' ? 'monthly' : 'yearly'}
      registrationPricing={{
        trainer: catalog.opleiders.tiers.map(({ key, name, price }) => ({ key, name, price })),
        brand: catalog.brands.tiers.map(({ key, name, price }) => ({ key, name, price })),
      }}
    />
  )
}
