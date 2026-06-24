import React from 'react'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { Input, Button, FieldLabel } from '@/components/ui'

export default function DashboardProfilePage() {
  return (
    <>
      <PageTitle>Profiel</PageTitle>
      <div style={{ maxWidth: 640, background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 8, padding: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Input label="Naam opleider" defaultValue="Academia Van der Berg" />
          <Input label="Locatie" defaultValue="Antwerpen" />
          <Input label="Website" defaultValue="https://vanderberg.be" />
          <Input label="E-mail" defaultValue="info@vanderberg.be" />
          <div>
            <FieldLabel>Korte beschrijving</FieldLabel>
            <textarea
              className="bl-input"
              style={{ height: 110, padding: '12px 16px', resize: 'vertical', lineHeight: 1.6 }}
              defaultValue="Geverifieerde massage- en lichaamswerkacademie in Antwerpen."
            />
          </div>
          <div>
            <Button variant="primary">Wijzigingen opslaan</Button>
          </div>
        </div>
      </div>
    </>
  )
}
