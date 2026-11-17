import type { AnalyticsEvent } from '@/lib/supabase'

/**
 * Meeting Nov 2026, item 5: a conversion is a click to the provider's (course) website,
 * a click on "inschrijven", or a sent popup form (lead). Social clicks don't count.
 * Ratio = conversions ÷ views of the profile and its opleidingen.
 */
export function countConversions(clicks: AnalyticsEvent[], leadCount: number): number {
  const seen = new Set<string>()
  let n = 0
  clicks.forEach((ev) => {
    if (ev.event_type !== 'website_click' && ev.event_type !== 'register_click') return
    if (seen.has(ev.id)) return // getClickEvents can return the same event via the profile and via a course
    seen.add(ev.id)
    n++
  })
  return n + leadCount
}

export function conversionRate(conversions: number, views: number): string {
  return views > 0 ? `${((conversions / views) * 100).toFixed(1).replace('.', ',')}%` : '-'
}
