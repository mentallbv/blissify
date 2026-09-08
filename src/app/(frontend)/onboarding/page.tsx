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
    price: role === 'trainer' && params.billing === 'monthly' ? `€ ${Number(t.monthlyPrice || (t.annualPrice || 0) / 10).toLocaleString('nl-BE')}` : t.price,
    period: role === 'trainer' && params.billing === 'monthly' ? '/maand' : '/jaar',
    features: t.features,
    recommended: t.recommended,
  }))

  return (
    <OnboardingFlow
      tiers={onboardingTiers}
      role={role}
      initialTier={tiers.some((tier) => tier.key === params.tier) ? params.tier : undefined}
      billingCycle={role === 'trainer' && params.billing === 'monthly' && catalog.billing.monthlyEnabled ? 'monthly' : 'yearly'}
    />
  )
}
