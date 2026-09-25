import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { CourseForm } from '@/components/dashboard/CourseForm'
import { ButtonLink } from '@/components/ui'
import { getCurrentProfile, getCurrentUser } from '@/lib/session'
import { getMyCourses } from '@/lib/dashboard-data'
import { tierForUser } from '@/lib/tier-features'

export const dynamic = 'force-dynamic'

async function getCategories() {
  const payload = await getPayload({ config: await config })
  const res = await payload.find({ collection: 'categories', limit: 300, depth: 1, sort: 'name' })
  return res.docs.map((c) => ({ id: c.id, name: c.name, parentName: c.parent && typeof c.parent === 'object' ? (c.parent as { name?: string }).name : undefined }))
}

export default async function NewCoursePage() {
  const user = await getCurrentUser()
  const account = user as { role?: string; brandTier?: string; subscriptionTier?: string } | null
  const profile = await getCurrentProfile(user)
  const courses = await getMyCourses(profile)
  const entitlement = tierForUser(account || {})
  const cannotPublish = !entitlement.features.canPublishCourses
  const limitReached = courses.length >= entitlement.features.courseLimit

  if (cannotPublish || limitReached) {
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
            {cannotPublish
              ? 'Met Partner Lite kun je je merk presenteren, maar geen opleidingen publiceren. Upgrade naar Partner Premium of Ultimate om opleidingen toe te voegen.'
              : `Je abonnement laat maximaal ${entitlement.features.courseLimit} actieve opleiding${entitlement.features.courseLimit === 1 ? '' : 'en'} toe. Upgrade je abonnement om meer opleidingen toe te voegen.`}
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
      <CourseForm categories={categories} showPartnerUltimateFeatures={entitlement.features.hasProductLaunchHighlighting && entitlement.features.hasCoBrandedCourses} />
    </>
  )
}
