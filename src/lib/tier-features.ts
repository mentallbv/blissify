export type AccountRole = 'trainer' | 'brand'

export type TierFeatures = {
  courseLimit: number
  /** Vacatures and werkruimtes visible at the same time (copy 10/2026). */
  vacancyLimit: number
  workspaceLimit: number
  categoryLimit: number
  canPublishCourses: boolean
  hasAnalytics: boolean
  hasAdvancedAnalytics: boolean
  hasProfileBranding: boolean
  hasPremiumBadge: boolean
  hasHomepageExposure: boolean
  hasInPlatformRegistration: boolean
  hasResponseTemplates: boolean
  hasPriorityRanking: boolean
  hasProductLaunchHighlighting: boolean
  hasCoBrandedCourses: boolean
  searchPriority: 0 | 1 | 2 | 3
}

const trainer: Record<string, TierFeatures> = {
  basis: { courseLimit: 1, vacancyLimit: 1, workspaceLimit: 1, categoryLimit: Infinity, canPublishCourses: true, hasAnalytics: false, hasAdvancedAnalytics: false, hasProfileBranding: false, hasPremiumBadge: false, hasHomepageExposure: false, hasInPlatformRegistration: false, hasResponseTemplates: false, hasPriorityRanking: false, hasProductLaunchHighlighting: false, hasCoBrandedCourses: false, searchPriority: 0 },
  medium: { courseLimit: 5, vacancyLimit: 2, workspaceLimit: 2, categoryLimit: Infinity, canPublishCourses: true, hasAnalytics: true, hasAdvancedAnalytics: false, hasProfileBranding: false, hasPremiumBadge: false, hasHomepageExposure: false, hasInPlatformRegistration: false, hasResponseTemplates: false, hasPriorityRanking: false, hasProductLaunchHighlighting: false, hasCoBrandedCourses: false, searchPriority: 0 },
  premium: { courseLimit: Infinity, vacancyLimit: Infinity, workspaceLimit: Infinity, categoryLimit: Infinity, canPublishCourses: true, hasAnalytics: true, hasAdvancedAnalytics: true, hasProfileBranding: true, hasPremiumBadge: true, hasHomepageExposure: true, hasInPlatformRegistration: false, hasResponseTemplates: false, hasPriorityRanking: true, hasProductLaunchHighlighting: false, hasCoBrandedCourses: false, searchPriority: 3 },
}

const brand: Record<string, TierFeatures> = {
  partner_listing: { courseLimit: 0, vacancyLimit: 0, workspaceLimit: 0, categoryLimit: 1, canPublishCourses: false, hasAnalytics: false, hasAdvancedAnalytics: false, hasProfileBranding: false, hasPremiumBadge: false, hasHomepageExposure: false, hasInPlatformRegistration: false, hasResponseTemplates: false, hasPriorityRanking: false, hasProductLaunchHighlighting: false, hasCoBrandedCourses: false, searchPriority: 0 },
  partner_professional: { courseLimit: 5, vacancyLimit: 2, workspaceLimit: 2, categoryLimit: 3, canPublishCourses: true, hasAnalytics: true, hasAdvancedAnalytics: false, hasProfileBranding: false, hasPremiumBadge: false, hasHomepageExposure: false, hasInPlatformRegistration: false, hasResponseTemplates: false, hasPriorityRanking: false, hasProductLaunchHighlighting: false, hasCoBrandedCourses: false, searchPriority: 0 },
  partner_premium: { courseLimit: Infinity, vacancyLimit: Infinity, workspaceLimit: Infinity, categoryLimit: Infinity, canPublishCourses: true, hasAnalytics: true, hasAdvancedAnalytics: true, hasProfileBranding: true, hasPremiumBadge: true, hasHomepageExposure: true, hasInPlatformRegistration: false, hasResponseTemplates: false, hasPriorityRanking: true, hasProductLaunchHighlighting: true, hasCoBrandedCourses: true, searchPriority: 3 },
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
