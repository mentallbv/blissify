export type AccountRole = 'trainer' | 'brand'

export type TierFeatures = {
  courseLimit: number
  canPublishCourses: boolean
  hasAnalytics: boolean
  hasAdvancedAnalytics: boolean
  hasProfileBranding: boolean
  hasPremiumBadge: boolean
  hasHomepageExposure: boolean
  hasInPlatformRegistration: boolean
  hasResponseTemplates: boolean
  searchPriority: 0 | 1 | 2 | 3
}

const trainer: Record<string, TierFeatures> = {
  basis: { courseLimit: 1, canPublishCourses: true, hasAnalytics: false, hasAdvancedAnalytics: false, hasProfileBranding: false, hasPremiumBadge: false, hasHomepageExposure: false, hasInPlatformRegistration: false, hasResponseTemplates: false, searchPriority: 0 },
  medium: { courseLimit: 5, canPublishCourses: true, hasAnalytics: true, hasAdvancedAnalytics: false, hasProfileBranding: true, hasPremiumBadge: false, hasHomepageExposure: false, hasInPlatformRegistration: false, hasResponseTemplates: false, searchPriority: 1 },
  premium: { courseLimit: Infinity, canPublishCourses: true, hasAnalytics: true, hasAdvancedAnalytics: true, hasProfileBranding: true, hasPremiumBadge: true, hasHomepageExposure: true, hasInPlatformRegistration: false, hasResponseTemplates: true, searchPriority: 3 },
}

const brand: Record<string, TierFeatures> = {
  partner_listing: { courseLimit: 0, canPublishCourses: false, hasAnalytics: false, hasAdvancedAnalytics: false, hasProfileBranding: true, hasPremiumBadge: false, hasHomepageExposure: false, hasInPlatformRegistration: false, hasResponseTemplates: false, searchPriority: 0 },
  partner_professional: { courseLimit: 10, canPublishCourses: true, hasAnalytics: true, hasAdvancedAnalytics: true, hasProfileBranding: true, hasPremiumBadge: false, hasHomepageExposure: true, hasInPlatformRegistration: true, hasResponseTemplates: false, searchPriority: 2 },
  partner_premium: { courseLimit: Infinity, canPublishCourses: true, hasAnalytics: true, hasAdvancedAnalytics: true, hasProfileBranding: true, hasPremiumBadge: true, hasHomepageExposure: true, hasInPlatformRegistration: true, hasResponseTemplates: true, searchPriority: 3 },
}

export function tierFeatures(role: AccountRole, tier?: string | null): TierFeatures {
  return role === 'brand'
    ? brand[tier || 'partner_listing'] || brand.partner_listing
    : trainer[tier || 'basis'] || trainer.basis
}

export function tierForUser(user: { role?: string | null; subscriptionTier?: string | null; brandTier?: string | null }) {
  const role: AccountRole = user.role === 'brand' ? 'brand' : 'trainer'
  const tier = role === 'brand' ? user.brandTier || 'partner_listing' : user.subscriptionTier || 'basis'
  return { role, tier, features: tierFeatures(role, tier) }
}
