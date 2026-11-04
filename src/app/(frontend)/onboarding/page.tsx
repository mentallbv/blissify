import React from 'react'
import { OnboardingFlow, type OnboardingTier } from '@/components/onboarding/OnboardingFlow'
import { getPricingCatalog } from '@/lib/data'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; billing?: string }>
}) {
  const [catalog, user, params] = await Promise.all([getPricingCatalog(), getCurrentUser(), searchParams])
  const role = (user as { role?: string } | null)?.role === 'brand' ? 'brand' : 'trainer'
  const { tiers } = role === 'brand' ? catalog.brands : catalog.opleiders
  // Reuse the single-source pricing tiers for the subscription step.
  const onboardingTiers: OnboardingTier[] = tiers.map((t) => ({
    key: t.key,
    name: t.name,
    tagline: t.tagline,
    price: params.billing === 'monthly' ? `€ ${Number(t.monthlyPrice || (t.annualPrice || 0) / 10).toLocaleString('nl-BE')}` : t.price,
    period: params.billing === 'monthly' ? '/maand' : '/jaar',
    features: t.features,
    recommended: t.recommended,
  }))

  const u = (user || {}) as { name?: string; billingCompanyName?: string; billingStreet?: string; billingPostalCode?: string; billingCity?: string; billingCountry?: string; vatNumber?: string; chamberOfCommerceNumber?: string }

  return (
    <OnboardingFlow
      billing={{
        billingCompanyName: u.billingCompanyName || '',
        billingStreet: u.billingStreet || '',
        billingPostalCode: u.billingPostalCode || '',
        billingCity: u.billingCity || '',
        billingCountry: ['BE', 'NL', 'EU'].includes(u.billingCountry || '') ? (u.billingCountry as string) : 'BE',
        vatNumber: u.vatNumber || '',
        chamberOfCommerceNumber: u.chamberOfCommerceNumber || '',
      }}
      tiers={onboardingTiers}
      role={role}
      initialTier={tiers.some((tier) => tier.key === params.tier) ? params.tier : undefined}
      billingCycle={params.billing === 'monthly' && catalog.billing.monthlyEnabled ? 'monthly' : 'yearly'}
    />
  )
}
