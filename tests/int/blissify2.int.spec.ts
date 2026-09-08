import { describe, expect, it } from 'vitest'
import { BRAND_PRICING_FALLBACK, PRICING_FALLBACK } from '../../src/lib/pricing'
import { tierFeatures } from '../../src/lib/tier-features'

describe('Blissify 2.0 plans', () => {
  it('uses the PDF prices and public plan names', () => {
    expect(PRICING_FALLBACK.tiers.map(({ name, monthlyPrice, annualPrice }) => ({ name, monthlyPrice, annualPrice }))).toEqual([
      { name: 'Opleider Lite', monthlyPrice: 15, annualPrice: 150 },
      { name: 'Opleider Premium', monthlyPrice: 49, annualPrice: 490 },
      { name: 'Opleider Ultimate', monthlyPrice: 97, annualPrice: 970 },
    ])
    expect(BRAND_PRICING_FALLBACK.tiers.map(({ name, annualPrice }) => ({ name, annualPrice }))).toEqual([
      { name: 'Partner Lite', annualPrice: 490 },
      { name: 'Partner Premium', annualPrice: 890 },
      { name: 'Partner Ultimate', annualPrice: 1490 },
    ])
  })

  it('enforces the PDF course and Partner category limits', () => {
    expect(tierFeatures('trainer', 'basis').courseLimit).toBe(1)
    expect(tierFeatures('trainer', 'medium').courseLimit).toBe(5)
    expect(tierFeatures('trainer', 'premium').courseLimit).toBe(Infinity)
    expect(tierFeatures('brand', 'partner_listing')).toMatchObject({ courseLimit: 0, categoryLimit: 1 })
    expect(tierFeatures('brand', 'partner_professional')).toMatchObject({ courseLimit: 5, categoryLimit: 3 })
    expect(tierFeatures('brand', 'partner_premium')).toMatchObject({ courseLimit: Infinity, categoryLimit: Infinity })
  })

  it('reserves branding, priority and homepage exposure for Ultimate', () => {
    expect(tierFeatures('trainer', 'medium')).toMatchObject({ hasProfileBranding: false, hasHomepageExposure: false, hasPriorityRanking: false })
    expect(tierFeatures('trainer', 'premium')).toMatchObject({ hasProfileBranding: true, hasHomepageExposure: true, hasPriorityRanking: true })
    expect(tierFeatures('brand', 'partner_professional')).toMatchObject({ hasProfileBranding: false, hasAdvancedAnalytics: false })
    expect(tierFeatures('brand', 'partner_premium')).toMatchObject({ hasProfileBranding: true, hasAdvancedAnalytics: true, hasCoBrandedCourses: true })
  })
})
