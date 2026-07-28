import React from 'react'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { LeadsList, type LeadRow } from '@/components/dashboard/LeadsList'
import { getCurrentUser, getCurrentProfile } from '@/lib/session'
import { getMyCourses } from '@/lib/dashboard-data'
import { getLeadsForCourses } from '@/lib/supabase'
import { tierForUser } from '@/lib/tier-features'

export const dynamic = 'force-dynamic'

export default async function DashboardLeadsPage() {
  const user = await getCurrentUser()
  const profile = await getCurrentProfile(user)
  const courses = await getMyCourses(profile)
  const titleById = new Map(courses.map((c) => [String(c.id), c.name]))
  const leads = await getLeadsForCourses(courses.map((c) => c.id))
  const account = user as {
    role?: string
    subscriptionTier?: string
    brandTier?: string
    responseTemplates?: { name: string; subject: string; body: string; id?: string | null }[]
  }
  const canUseTemplates = tierForUser(account).features.hasResponseTemplates

  const rows: LeadRow[] = leads.map((l) => ({
    id: l.id,
    name: l.name,
    email: l.email,
    message: l.message,
    courseTitle: titleById.get(l.payload_course_id) || 'Opleiding',
    read: l.read,
    created_at: l.created_at,
  }))

  return (
    <>
      <PageTitle>Aanvragen</PageTitle>
      <LeadsList
        leads={rows}
        canUseTemplates={canUseTemplates}
        initialTemplates={canUseTemplates ? account.responseTemplates || [] : []}
      />
    </>
  )
}
