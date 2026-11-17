/**
 * Period filter for dashboard analytics (meeting Nov 2026, item 11).
 * dag   = last 30 days, one point per day
 * maand = last 12 months, one point per month (default)
 * jaar  = every year since the first recorded event, one point per year
 */
export type Period = 'dag' | 'maand' | 'jaar'
export const PERIODS: { id: Period; label: string; note: string }[] = [
  { id: 'dag', label: 'Per dag', note: 'laatste 30 dagen' },
  { id: 'maand', label: 'Per maand', note: 'laatste 12 maanden' },
  { id: 'jaar', label: 'Per jaar', note: 'sinds de start' },
]
const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']

export function parsePeriod(v: unknown): Period {
  return v === 'dag' || v === 'jaar' ? v : 'maand'
}

/** Start of the window; null = no lower bound. */
export function periodStart(p: Period, now = new Date()): Date | null {
  if (p === 'dag') return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29)
  if (p === 'maand') return new Date(now.getFullYear(), now.getMonth() - 11, 1)
  return null
}

export function inPeriod<T extends { created_at: string }>(rows: T[], p: Period, now = new Date()): T[] {
  const start = periodStart(p, now)
  return start ? rows.filter((r) => new Date(r.created_at) >= start) : rows
}

/** Bucket labels for the period (shared by every series so charts line up). */
export function periodLabels(p: Period, dates: string[], now = new Date()): string[] {
  if (p === 'dag') {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29 + i)
      return `${d.getDate()} ${MONTHS[d.getMonth()]}`
    })
  }
  if (p === 'maand') {
    return Array.from({ length: 12 }, (_, i) => MONTHS[new Date(now.getFullYear(), now.getMonth() - 11 + i, 1).getMonth()])
  }
  const first = dates.reduce((y, s) => Math.min(y, new Date(s).getFullYear()), now.getFullYear())
  const from = Math.min(first, now.getFullYear() - 1) // at least two points, so the chart draws a line
  return Array.from({ length: now.getFullYear() - from + 1 }, (_, i) => String(from + i))
}

/** Count rows per bucket; `labels` must come from periodLabels for the same period. */
export function periodSeries(rows: { created_at: string }[], p: Period, labels: string[], now = new Date()): number[] {
  const out = labels.map(() => 0)
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29).getTime()
  const monthStart = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  const firstYear = Number(labels[0])
  rows.forEach((r) => {
    const d = new Date(r.created_at)
    let i = -1
    if (p === 'dag') i = Math.floor((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - dayStart) / 86_400_000)
    else if (p === 'maand') i = (d.getFullYear() - monthStart.getFullYear()) * 12 + (d.getMonth() - monthStart.getMonth())
    else i = d.getFullYear() - firstYear
    if (i >= 0 && i < out.length) out[i]++
  })
  return out
}
