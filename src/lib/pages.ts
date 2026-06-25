import { getPayload } from 'payload'
import config from '@/payload.config'

export type PageDoc = {
  title: string
  hero?: {
    eyebrow?: string
    title?: string
    subtitle?: string
    image?: { url?: string } | null
    ctaLabel?: string
    ctaUrl?: string
  }
  blocks?: { blockType: string; [k: string]: unknown }[]
  seo?: { title?: string; description?: string }
}

/** Fetch a Pages document by slug. Returns null if missing or DB unreachable. */
export async function getPageBySlug(slug: string): Promise<PageDoc | null> {
  try {
    const payload = await getPayload({ config: await config })
    const res = await payload.find({
      collection: 'pages' as never,
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
    })
    return (res.docs[0] as PageDoc) || null
  } catch {
    return null
  }
}
