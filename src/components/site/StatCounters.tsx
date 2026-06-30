'use client'

import React from 'react'

type Stat = { target: number; suffix?: string; label: string }

export function StatCounters({ stats }: { stats: Stat[] }) {
  const [vals, setVals] = React.useState<number[]>(stats.map(() => 0))
  const ref = React.useRef<HTMLDivElement>(null)
  const ran = React.useRef(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const run = () => {
      if (ran.current) return
      ran.current = true
      const dur = 1300
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / dur)
        const e = 1 - Math.pow(1 - p, 3)
        setVals(stats.map((s) => Math.round(s.target * e)))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && run()),
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [stats])

  return (
    <div ref={ref} className="bl-container" style={{ paddingTop: 72, paddingBottom: 72, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, textAlign: 'center' }}
    >
      {stats.map((s, i) => (
        <div key={s.label}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 64, lineHeight: 1, letterSpacing: '-0.01em', color: 'var(--text-brand)' }}>
            {vals[i].toLocaleString('nl-BE')}
            {s.suffix || ''}
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 14, color: 'var(--text-meta)', marginTop: 10 }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}
