/**
 * Type opleiding + Lesvorm as one choice (client round 2 #2.9 / #3.7).
 *
 * Opleiders pick only the type. Where the type settles where it takes place
 * (a practice course is on location, a self-study course or webinar is online)
 * the lesvorm is derived; for types that can go either way the form asks one
 * follow-up question. The derived value is stored in the existing `format`
 * field, so the "Online / Op locatie" filter keeps working.
 */

export type Format = 'online' | 'fysiek' | 'hybride'
export type Delivery = 'fysiek' | 'online' | 'hybride'

export const COURSE_TYPES: { value: string; label: string; format: Format | null }[] = [
  { value: 'practice_training', label: 'Praktijkopleiding', format: 'fysiek' },
  { value: 'online_course', label: 'Online cursus (zelfstudie)', format: 'online' },
  { value: 'webinar', label: 'Webinar', format: 'online' },
  { value: 'live_course', label: 'Live les', format: null },
  { value: 'workshop', label: 'Workshop', format: null },
  { value: 'coaching', label: 'Coachingsessie', format: null },
  { value: 'event', label: 'Evenement', format: null },
]

export const COURSE_TYPE_LABEL: Record<string, string> = Object.fromEntries(COURSE_TYPES.map((t) => [t.value, t.label]))

export const DELIVERY_OPTIONS: { value: Delivery; label: string }[] = [
  { value: 'fysiek', label: 'Op locatie' },
  { value: 'online', label: 'Online' },
  { value: 'hybride', label: 'Beide (op locatie én online)' },
]

/** True when the type needs the "Waar vindt dit plaats?" question. */
export function typeNeedsDelivery(type: string): boolean {
  const t = COURSE_TYPES.find((x) => x.value === type)
  return Boolean(t && t.format === null)
}

/** The stored lesvorm for a type (+ the follow-up answer when the type needs one). */
export function deriveFormat(type: string, delivery?: string | null): Format[] {
  const t = COURSE_TYPES.find((x) => x.value === type)
  if (!t) return []
  if (t.format) return [t.format]
  return delivery === 'online' || delivery === 'fysiek' || delivery === 'hybride' ? [delivery] : []
}

/** Back from the stored lesvorm to the follow-up answer (edit form). */
export function deliveryFromFormat(format: string[] | null | undefined): Delivery | '' {
  const f = format || []
  if (f.includes('hybride') || (f.includes('online') && f.includes('fysiek'))) return 'hybride'
  if (f.includes('online')) return 'online'
  if (f.includes('fysiek')) return 'fysiek'
  return ''
}
