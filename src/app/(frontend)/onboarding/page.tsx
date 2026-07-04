import React from 'react'
import { OnboardingFlow, type OnboardingTier } from '@/components/onboarding/OnboardingFlow'
import { getPricing } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const { tiers } = await getPricing()
  // Reuse the single-source pricing tiers for the subscription step.
  const onboardingTiers: OnboardingTier[] = tiers.map((t) => ({
    key: t.key as OnboardingTier['key'],
    name: t.name,
    tagline: t.tagline,
    price: t.price,
    period: t.period,
    features: t.features,
    recommended: t.recommended,
  }))

  return <OnboardingFlow tiers={onboardingTiers} />
}
