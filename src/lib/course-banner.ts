import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { publicMediaUrl } from '@/lib/media'

/**
 * Course banner fallback (meeting Nov 2026, item 4).
 * A course without a cover image, or with one smaller than 1200×600, shows the fallback.
 * The fallback is the image set in Instellingen → Branding ("Standaardbanner opleidingen"),
 * or the brand-colour visual in /public when none is set.
 */
export const BANNER_MIN_WIDTH = 1200
export const BANNER_MIN_HEIGHT = 600
export const DEFAULT_COURSE_BANNER = '/images/course-fallback.svg'

type Upload = { url?: string | null; filename?: string | null; width?: number | null; height?: number | null }

export const getCourseFallbackBanner = unstable_cache(
  async (): Promise<string> => {
    try {
      const payload = await getPayload({ config: await config })
      const branding = (await payload.findGlobal({ slug: 'branding', depth: 1 })) as { courseFallbackBanner?: unknown }
      const m = branding.courseFallbackBanner
      const url = m && typeof m === "object" ? publicMediaUrl(m as Upload) : null
      return url || DEFAULT_COURSE_BANNER
    } catch {
      return DEFAULT_COURSE_BANNER
    }
  },
  ['course-fallback-banner'],
  { revalidate: 300, tags: ['branding'] },
)

/** The course's own image when it is big enough, else the fallback. Unknown sizes (old uploads) count as big enough. */
export function courseBanner(cover: unknown, fallback: string): string {
  if (!cover || typeof cover !== 'object') return fallback
  const m = cover as Upload
  const url = publicMediaUrl(m)
  if (!url) return fallback
  if (typeof m.width === 'number' && typeof m.height === 'number' && (m.width < BANNER_MIN_WIDTH || m.height < BANNER_MIN_HEIGHT)) return fallback
  return url
}
