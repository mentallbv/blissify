import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { CourseForm } from '@/components/dashboard/CourseForm'

export const dynamic = 'force-dynamic'

async function getCategories() {
  const payload = await getPayload({ config: await config })
  const res = await payload.find({ collection: 'categories', limit: 200, depth: 0, sort: 'name' })
  return res.docs.map((c) => ({ id: c.id, name: c.name }))
}

export default async function NewCoursePage() {
  const categories = await getCategories()
  return (
    <>
      <PageTitle>Nieuwe opleiding</PageTitle>
      <CourseForm categories={categories} />
    </>
  )
}
