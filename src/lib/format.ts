import type { Course } from '@/payload-types'

const UNIT_NL: Record<string, string> = {
  hours: 'uur',
  days: 'dagen',
  weeks: 'weken',
  months: 'maanden',
}

const FORMAT_NL: Record<string, string> = {
  online: 'Online',
  fysiek: 'In-persoon',
  hybride: 'Hybride',
}

/** "€1.450 · incl. btw" style price. */
export function formatPrice(price?: Course['price']): string {
  if (!price) return 'Prijs op aanvraag'
  if (price.isFree) return 'Gratis'
  if (price.priceOnRequest || price.amount == null) return 'Prijs op aanvraag'
  const amount = new Intl.NumberFormat('nl-BE').format(price.amount)
  return `€${amount}`
}

export function formatDuration(duration?: Course['duration']): string | null {
  if (!duration?.value || !duration.unit) return null
  const unit = UNIT_NL[duration.unit] || duration.unit
  return `${duration.value} ${unit}`
}

export function formatFormat(format?: Course['format']): string {
  if (!format || format.length === 0) return ''
  return format.map((f) => FORMAT_NL[f] || f).join(' · ')
}

/** Compact "6 weken · In-persoon" line for course cards. */
export function formatCardMeta(course: { duration?: Course['duration']; format?: Course['format'] }): string {
  const parts = [formatDuration(course.duration), formatFormat(course.format)].filter(Boolean)
  return parts.join(' · ') || 'Op aanvraag'
}

export function courseLocation(course: Course): string {
  const city = course.location?.city
  if (city) return city
  if (course.format?.includes('online')) return 'Online'
  return 'België'
}
