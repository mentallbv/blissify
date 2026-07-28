import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { CourseForm } from '@/components/dashboard/CourseForm'
import { ButtonLink } from '@/components/ui'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

async function getCategories() {
  const payload = await getPayload({ config: await config })
  const res = await payload.find({ collection: 'categories', limit: 200, depth: 0, sort: 'name' })
  return res.docs.map((c) => ({ id: c.id, name: c.name }))
}

export default async function NewCoursePage() {
  const user = (await getCurrentUser()) as { role?: string; brandTier?: string } | null
  const isListingBrand =
    user?.role === 'brand' && (user.brandTier || 'partner_listing') === 'partner_listing'

  if (isListingBrand) {
    return (
      <>
        <PageTitle>Nieuwe opleiding</PageTitle>
        <div
          style={{
            background: 'var(--surface-card)',
            border: '0.5px solid var(--border-hairline)',
            borderRadius: 'var(--radius-md)',
            padding: '72px 48px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-meta)', margin: '0 0 20px' }}>
            Met Partner Listing kun je je merk presenteren, maar geen opleidingen publiceren.
            Upgrade naar Partner Professional of Premium om opleidingen toe te voegen.
          </p>
          <ButtonLink href="/dashboard/abonnement" variant="primary" size="sm">
            Bekijk abonnementen
          </ButtonLink>
        </div>
      </>
    )
  }

  const categories = await getCategories()
  return (
    <>
      <PageTitle>Nieuwe opleiding</PageTitle>
      <CourseForm categories={categories} />
    </>
  )
}
