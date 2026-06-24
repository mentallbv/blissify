import React from 'react'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { Button, ButtonLink } from '@/components/ui'

export default function DashboardSubscriptionPage() {
  return (
    <>
      <PageTitle>Abonnement</PageTitle>
      <div style={{ maxWidth: 640 }}>
        <div style={{ background: 'var(--surface-dark)', borderRadius: 8, padding: 28, marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(245,240,234,0.6)', marginBottom: 12 }}>
            Huidig abonnement
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 36, letterSpacing: '-0.01em', color: 'var(--blissify-chalk)' }}>
              Medium
            </span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'rgba(245,240,234,0.7)' }}>€290 / jaar · verlengt 14 jan 2027</span>
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'rgba(245,240,234,0.7)', margin: '16px 0 0' }}>
            Onbeperkte opleidingen · Analytisch dashboard · Aanvraagbeheer
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <ButtonLink href="/prijzen" variant="primary">
            Upgrade naar Premium
          </ButtonLink>
          <Button variant="ghost">Factuurgegevens</Button>
        </div>
      </div>
    </>
  )
}
