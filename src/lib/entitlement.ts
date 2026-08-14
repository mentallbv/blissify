export type EntitlementUser = {
  subscriptionStatus?: string | null
  subscriptionExpiresAt?: string | null
}

/**
 * Whether an account may currently publish. Deliberately broader than
 * `subscriptionStatus === 'active'`: cancelling ends the renewal, not the period
 * already paid for, so a canceled account keeps its rights until
 * `subscriptionExpiresAt`. The scheduled sweep in /api/cron/subscriptions takes
 * courses offline once that date passes.
 */
export function isEntitled(user: EntitlementUser | null | undefined): boolean {
  if (!user) return false
  if (user.subscriptionStatus === 'active') return true
  if (user.subscriptionStatus === 'canceled' && user.subscriptionExpiresAt) {
    return new Date(user.subscriptionExpiresAt).getTime() > Date.now()
  }
  return false
}

/** True once a canceled subscription's paid period has run out. */
export function isExpiredCancellation(user: EntitlementUser): boolean {
  return user.subscriptionStatus === 'canceled' && !isEntitled(user)
}
