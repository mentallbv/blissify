import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DbPage } from '@/components/site/DbPage'
import { getPageBySlug } from '@/lib/pages'

export const dynamic = 'force-dynamic'

const SLUG = 'voor-aanbieders'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug(SLUG)
  if (!page) return {}
  return { title: page.seo?.title || page.title, description: page.seo?.description || undefined }
}

export default async function VoorAanbiedersPage() {
  const page = await getPageBySlug(SLUG)
  if (!page) notFound()
  return <DbPage page={page} />
}
