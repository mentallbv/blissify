import React from 'react'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { CheckoutButton, CancelButton } from '@/components/dashboard/SubscriptionActions'
import { getCurrentUser, getCurrentProfile } from '@/lib/session'
import { getMyCourseCounts, TIER_LIMITS } from '@/lib/dashboard-data'
import { getPricing } from '@/lib/data'

export const dynamic = 'force-dynamic'

const TIER_LABEL: Record<string, string> = { basis: 'Basis', medium: 'Medium', premium: 'Premium' }
const STATUS_LABEL: Record<string, string> = { active: 'Actief', inactive: 'Inactief', canceled: 'Geannuleerd', past_due: 'Verlopen' }

export default async function DashboardSubscriptionPage() {
  const user = await getCurrentUser()
  const profile = await getCurrentProfile(user)
  const counts = await getMyCourseCounts(profile)
  const { tiers } = await getPricing()

  const u = user as { subscriptionTier?: string; subscriptionStatus?: string; subscriptionExpiresAt?: string } | null
  const tier = u?.subscriptionTier || 'basis'
  const status = u?.subscriptionStatus || 'inactive'
  const limit = TIER_LIMITS[tier] ?? 1
  const limitLabel = limit === Infinity ? 'onbeperkt' : String(limit)
  const expires = u?.subscriptionExpiresAt ? new Date(u.subscriptionExpiresAt).toLocaleDateString('nl-BE') : null

  return (
    <>
      <PageTitle>Abonnement</PageTitle>

      <div style={{ maxWidth: 640, marginBottom: 32 }}>
        <div style={{ background: 'var(--surface-dark)', borderRadius: 'var(--radius-md)', padding: 28 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(245,240,234,0.6)', marginBottom: 12 }}>
            Huidig abonnement
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 36, letterSpacing: '-0.01em', color: 'var(--blissify-chalk)' }}>
              {TIER_LABEL[tier] || tier}
            </span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'rgba(245,240,234,0.7)' }}>
              {STATUS_LABEL[status] || status}
              {expires ? ` · verlengt ${expires}` : ''}
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'rgba(245,240,234,0.7)', margin: '16px 0 0' }}>
            {counts.total} van {limitLabel} opleidingen gebruikt
          </p>
        </div>
        {status === 'active' ? (
          <div style={{ marginTop: 16 }}>
            <CancelButton />
          </div>
        ) : null}
      </div>

      <div className="bl-grid-3" style={{ maxWidth: 900 }}>
        {tiers.map((t) => {
          const current = t.key === tier
          return (
            <div key={t.key} style={{ border: '0.5px solid ' + (current ? 'var(--blissify-forest)' : 'var(--border-hairline)'), borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', padding: 24 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 20, color: 'var(--text-brand)' }}>{t.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '10px 0 16px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 32, color: 'var(--text-brand)' }}>{t.price}</span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)' }}>/jaar</span>
              </div>
              {current && status === 'active' ? (
                <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 12, color: 'var(--status-success)' }}>Huidig plan</div>
              ) : (
                <CheckoutButton tier={t.key} label={current ? 'Activeren' : t.key === 'basis' ? 'Kies Basis' : 'Upgrade'} variant={t.recommended ? 'accent' : 'primary'} />
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
