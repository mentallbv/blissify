import React from 'react'

/** Single-colour forest line chart with subtle area fill. */
export function LineChart({ series, labels }: { series: number[]; labels: string[] }) {
  const W = 880
  const H = 300
  const padL = 48
  const padR = 16
  const padT = 16
  const padB = 32
  const max = Math.max(...series) * 1.1
  const min = 0
  const x = (i: number) => padL + (i / (series.length - 1)) * (W - padL - padR)
  const y = (v: number) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB)
  const path = series.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const area = `${path} L ${x(series.length - 1).toFixed(1)} ${(H - padB).toFixed(1)} L ${padL} ${(H - padB).toFixed(1)} Z`
  const ticks = 4
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {Array.from({ length: ticks + 1 }).map((_, i) => {
        const gv = (max / ticks) * i
        const gy = y(gv)
        return (
          <g key={i}>
            <line x1={padL} y1={gy} x2={W - padR} y2={gy} stroke="#E8E3DC" strokeWidth="0.5" />
            <text x={padL - 10} y={gy + 4} textAnchor="end" fontFamily="var(--font-ui)" fontSize="11" fill="#8A8880">
              {Math.round(gv)}
            </text>
          </g>
        )
      })}
      <path d={area} fill="#1A2E25" fillOpacity="0.06" />
      <path d={path} fill="none" stroke="#1A2E25" strokeWidth="1.5" />
      {series.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="2.5" fill="#1A2E25" />
      ))}
      {labels.map((l, i) => (
        <text key={i} x={x(i)} y={H - 10} textAnchor="middle" fontFamily="var(--font-ui)" fontSize="11" fill="#8A8880">
          {l}
        </text>
      ))}
    </svg>
  )
}
