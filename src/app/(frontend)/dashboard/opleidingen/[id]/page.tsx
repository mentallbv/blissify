import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { CourseForm, type CourseFormValues } from '@/components/dashboard/CourseForm'
import { getCurrentUser } from '@/lib/session'
import { resolveOwner, ownsCourse } from '@/lib/course-form'
import type { Course, Category } from '@/payload-types'

export const dynamic = 'force-dynamic'

function lexicalToText(rt: unknown): string {
  try {
    const root = (rt as { root?: { children?: unknown[] } })?.root
    if (!root?.children) return ''
    const parts: string[] = []
    const walk = (nodes: unknown[]) => {
      for (const n of nodes) {
        const node = n as { type?: string; text?: string; children?: unknown[] }
        if (node.text) parts.push(node.text)
        if (node.children) walk(node.children)
      }
    }
    walk(root.children)
    return parts.join(' ').trim()
  } catch {
    return ''
  }
}

async function getCategories() {
  const payload = await getPayload({ config: await config })
  const res = await payload.find({ collection: 'categories', limit: 200, depth: 0, sort: 'name' })
  return res.docs.map((c) => ({ id: c.id, name: c.name }))
}

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) redirect('/inloggen')

  const payload = await getPayload({ config: await config })
  const owner = await resolveOwner(payload, user as never)
  const course = (await payload.findByID({ collection: 'courses', id, depth: 1, overrideAccess: true }).catch(() => null)) as Course | null
  if (!course) notFound()
  if (!owner || !ownsCourse(course as never, owner)) redirect('/dashboard/opleidingen')

  const categories = await getCategories()
  const cat = typeof course.category === 'object' ? (course.category as Category) : null
  const details = course as Course & {
    courseType?: string
    participants?: { maximum?: number; privateOneToOne?: boolean }
    modelRequired?: string
    lunchProvided?: string
    contact?: { email?: string; website?: string; instagram?: string; facebook?: string; tiktok?: string }
    startDates?: { date: string; endDate?: string; startTime?: string; endTime?: string; spotsAvailable?: number }[]
  }

  const initial: Partial<CourseFormValues> = {
    title: course.title,
    slug: course.slug,
    status: course.status,
    category: cat ? String(cat.id) : '',
    shortDescription: course.shortDescription || '',
    description: lexicalToText(course.description),
    externalUrl: course.externalUrl || '',
    city: course.location?.city || '',
    level: course.level || '',
    accreditation: course.accreditation || '',
    certificate: Boolean(course.certificate),
    priceAmount: course.price?.amount != null ? String(course.price.amount) : '',
    priceOnRequest: Boolean(course.price?.priceOnRequest),
    durationValue: course.duration?.value != null ? String(course.duration.value) : '',
    durationUnit: course.duration?.unit || 'days',
    format: course.format || [],
    courseType: details.courseType || '',
    language: course.language || ['nl'],
    targetAudience: (details as { targetAudience?: string[] }).targetAudience || [],
    practical: (details as { practical?: string[] }).practical || [],
    focus: (details as { focus?: string[] }).focus || [],
    maximumParticipants: details.participants?.maximum != null ? String(details.participants.maximum) : '',
    privateOneToOne: Boolean(details.participants?.privateOneToOne),
    modelRequired: details.modelRequired || 'not_applicable',
    lunchProvided: details.lunchProvided || 'not_applicable',
    contactEmail: details.contact?.email || '',
    contactWebsite: details.contact?.website || '',
    instagram: details.contact?.instagram || '',
    facebook: details.contact?.facebook || '',
    tiktok: details.contact?.tiktok || '',
    startDates: (details.startDates || []).map((item) => ({
      date: item.date ? item.date.slice(0, 10) : '',
      endDate: item.endDate ? item.endDate.slice(0, 10) : '',
      startTime: item.startTime || '',
      endTime: item.endTime || '',
      spotsAvailable: item.spotsAvailable != null ? String(item.spotsAvailable) : '',
    })),
    tags: (course.tags || []).join(', '),
  }

  return (
    <>
      <PageTitle>Opleiding bewerken</PageTitle>
      <CourseForm categories={categories} initial={initial} courseId={course.id} />
    </>
  )
}
