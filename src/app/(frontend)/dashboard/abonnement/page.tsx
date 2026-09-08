import React from 'react'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { CheckoutButton, CancelButton } from '@/components/dashboard/SubscriptionActions'
import { getCurrentUser, getCurrentProfile } from '@/lib/session'
import { getMyCourseCounts } from '@/lib/dashboard-data'
import { getPricingCatalog } from '@/lib/data'
import { tierFeatures } from '@/lib/tier-features'

export const dynamic = 'force-dynamic'

const TIER_LABEL: Record<string, string> = { basis: 'Opleider Lite', medium: 'Opleider Premium', premium: 'Opleider Ultimate' }
const BRAND_TIER_LABEL: Record<string, string> = { partner_listing: 'Partner Lite', partner_professional: 'Partner Premium', partner_premium: 'Partner Ultimate' }
const STATUS_LABEL: Record<string, string> = { active: 'Actief', inactive: 'Inactief', canceled: 'Geannuleerd', past_due: 'Verlopen' }

export default async function DashboardSubscriptionPage() {
  const user = await getCurrentUser()
  const profile = await getCurrentProfile(user)
  const counts = await getMyCourseCounts(profile)
  const catalog = await getPricingCatalog()

  const u = user as { role?: string; subscriptionTier?: string; brandTier?: string; subscriptionStatus?: string; subscriptionExpiresAt?: string; subscriptionBillingCycle?: string; pendingSubscriptionTier?: string; pendingSubscriptionEffectiveAt?: string } | null
  const isBrand = u?.role === 'brand'
  const tiers = isBrand ? catalog.brands.tiers : catalog.opleiders.tiers
  const tier = isBrand ? u?.brandTier || 'partner_listing' : u?.subscriptionTier || 'basis'
  const status = u?.subscriptionStatus || 'inactive'
  const limit = tierFeatures(isBrand ? 'brand' : 'trainer', tier).courseLimit
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
              {(isBrand ? BRAND_TIER_LABEL[tier] : TIER_LABEL[tier]) || tier}
            </span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'rgba(245,240,234,0.7)' }}>
              {STATUS_LABEL[status] || status}
              {expires ? ` · ${status === 'canceled' ? 'eindigt' : 'verlengt'} ${expires}` : ''}
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'rgba(245,240,234,0.7)', margin: '16px 0 0' }}>
            {counts.total} van {limitLabel} opleidingen gebruikt
          </p>
          {u?.pendingSubscriptionTier && u.pendingSubscriptionEffectiveAt ? <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'rgba(245,240,234,0.85)', margin: '12px 0 0' }}>Wijzigt op {new Date(u.pendingSubscriptionEffectiveAt).toLocaleDateString('nl-BE')} naar {(isBrand ? BRAND_TIER_LABEL : TIER_LABEL)[u.pendingSubscriptionTier] || u.pendingSubscriptionTier}.</p> : null}
          {u?.subscriptionBillingCycle ? (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'rgba(245,240,234,0.6)', margin: '8px 0 0' }}>
              {u.subscriptionBillingCycle === 'monthly' ? 'Maandelijks betaald' : 'Jaarlijks betaald'}
            </p>
          ) : null}
        </div>
        {status === 'active' ? (
          <div style={{ marginTop: 16 }}>
            <CancelButton entitledUntil={u?.subscriptionExpiresAt || null} />
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, lineHeight: 1.5, color: 'var(--text-meta)' }}>Opzeggen stopt alleen de volgende verlenging. De betaalde periode wordt niet terugbetaald.</p>
          </div>
        ) : null}
      </div>

      <div className="bl-grid-3" style={{ maxWidth: 900 }}>
        {tiers.map((t) => {
          const current = t.key === tier
          const annual = t.annualPrice || Number(t.price.replace(/[^\d]/g, ''))
          const monthly = Number(t.monthlyPrice || annual / 10).toLocaleString('nl-BE', { maximumFractionDigits: 2 })
          return (
            <div key={t.key} style={{ border: '0.5px solid ' + (current ? 'var(--blissify-forest)' : 'var(--border-hairline)'), borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', padding: 24 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 20, color: 'var(--text-brand)' }}>{t.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '10px 0 16px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 32, color: 'var(--text-brand)' }}>{t.price}</span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)' }}>/jaar</span>
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-meta)', margin: '-10px 0 14px' }}>excl. btw</div>
              {current && status === 'active' ? (
                <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 12, color: 'var(--status-success)' }}>Huidig plan</div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  <CheckoutButton tier={t.key} billingCycle="yearly" label={current ? 'Jaarlijks activeren' : 'Jaarlijks kiezen'} variant={t.recommended ? 'accent' : 'primary'} />
                  {!isBrand && catalog.billing.monthlyEnabled ? (
                    <>
                      <CheckoutButton tier={t.key} billingCycle="monthly" label={`€ ${monthly}/maand`} variant="ghost" />
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-meta)', textAlign: 'center' }}>
                        Maandelijks opzegbaar
                      </span>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
