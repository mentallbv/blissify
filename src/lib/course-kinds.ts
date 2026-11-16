/** "Soort opleiding" (Lonne, Nov 2026): what kind of training a course is. A course can be several kinds. */
export const COURSE_KINDS = [
  { value: 'behandelingen-technieken', label: 'Opleidingen in behandelingen & technieken' },
  { value: 'product-merktrainingen', label: 'Product- & merktrainingen' },
  { value: 'apparatuur-toestellen', label: 'Opleidingen in apparatuur & toestellen' },
  { value: 'business-ondernemerschap', label: 'Business- & ondernemerschapstrainingen' },
] as const

export const COURSE_KIND_VALUES = new Set<string>(COURSE_KINDS.map((k) => k.value))
