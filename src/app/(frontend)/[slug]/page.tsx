import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DbPage } from '@/components/site/DbPage'
import { getPageBySlug } from '@/lib/pages'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (!page) return {}
  return { title: page.seo?.title || page.title, description: page.seo?.description || undefined }
}

export default async function CatchAllPage({ params }: Params) {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (!page) notFound()
  return <DbPage page={page} />
}
