import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { CourseForm, type CourseFormValues } from '@/components/dashboard/CourseForm'
import { getCurrentUser } from '@/lib/session'
import { resolveOwner, ownsCourse } from '@/lib/course-form'
import { lexicalToHtml } from '@/lib/richtext'
import { tierForUser } from '@/lib/tier-features'
import type { UploadedImage } from '@/components/dashboard/ImageUploadField'

/** Upload relationships arrive populated at depth 1, or as a bare id at depth 0. */
function toUploadedImage(value: unknown): UploadedImage {
  if (!value) return null
  if (typeof value === 'object') {
    const media = value as { id?: number | string; url?: string; sizes?: { thumbnail?: { url?: string } } }
    if (!media.id) return null
    return { id: media.id, url: media.sizes?.thumbnail?.url || media.url || '' }
  }
  return { id: value as number | string, url: '' }
}
import type { Course, Category } from '@/payload-types'

export const dynamic = 'force-dynamic'

async function getCategories() {
  const payload = await getPayload({ config: await config })
  const res = await payload.find({ collection: 'categories', limit: 300, depth: 1, sort: 'name' })
  return res.docs.map((c) => ({ id: c.id, name: c.name, parentName: c.parent && typeof c.parent === 'object' ? (c.parent as { name?: string }).name : undefined }))
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
    description: lexicalToHtml(course.description),
    coverImage: toUploadedImage(course.coverImage),
    externalUrl: course.externalUrl || '',
    city: course.location?.city || '',
    level: course.level || '',
    accreditation: course.accreditation || '',
    certificate: Boolean(course.certificate),
    productLaunchHighlighted: Boolean((course as any).productLaunchHighlighted),
    coBrandPartner: String((course as any).coBrandPartner || ''),
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
      <CourseForm
        categories={categories}
        initial={initial}
        courseId={course.id}
        showPartnerUltimateFeatures={tierForUser(user).features.hasProductLaunchHighlighting && tierForUser(user).features.hasCoBrandedCourses}
      />
    </>
  )
}
