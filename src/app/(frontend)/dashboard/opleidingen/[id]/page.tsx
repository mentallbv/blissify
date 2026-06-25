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
    tags: (course.tags || []).join(', '),
  }

  return (
    <>
      <PageTitle>Opleiding bewerken</PageTitle>
      <CourseForm categories={categories} initial={initial} courseId={course.id} />
    </>
  )
}
