'use client'

import React from 'react'
import { Button, FieldLabel, Input } from '@/components/ui'

export function ReviewForm({ courseId }: { courseId: string }) {
  const [rating, setRating] = React.useState(0)
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [review, setReview] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, rating, name, email, review }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'De review kon niet worden verstuurd.')
      setMessage({ type: 'success', text: 'Controleer je mailbox en bevestig je review via de link die we hebben verstuurd.' })
      setRating(0)
      setName('')
      setEmail('')
      setReview('')
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Er ging iets mis.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 620, display: 'grid', gap: 16 }}>
      <div>
        <FieldLabel>Jouw beoordeling</FieldLabel>
        <div style={{ display: 'flex', gap: 6 }} aria-label="Kies het aantal sterren">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              aria-label={`${star} ${star === 1 ? 'ster' : 'sterren'}`}
              style={{ border: 0, background: 'none', padding: 2, cursor: 'pointer', color: star <= rating ? 'var(--blissify-terracotta)' : 'var(--neutral-300)', fontSize: 25 }}
            >
              <i className={star <= rating ? 'ti ti-star-filled' : 'ti ti-star'} />
            </button>
          ))}
        </div>
      </div>
      <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Input label="Naam" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="E-mailadres" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <FieldLabel>Review</FieldLabel>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          minLength={20}
          maxLength={2000}
          required
          placeholder="Vertel wat je van de opleiding vond…"
          style={{ width: '100%', minHeight: 120, border: '0.5px solid var(--neutral-200)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', padding: '12px 16px', fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.6, color: 'var(--text-strong)', resize: 'vertical' }}
        />
      </div>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, lineHeight: 1.6, color: 'var(--text-meta)', margin: 0 }}>
        We sturen een verificatielink naar je e-mailadres. Je review verschijnt pas na bevestiging en goedkeuring door Blissify.
      </p>
      {message ? (
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, lineHeight: 1.6, color: message.type === 'success' ? 'var(--status-success)' : 'var(--status-error)' }}>{message.text}</div>
      ) : null}
      <div>
        <Button type="submit" variant="primary" disabled={loading || rating === 0}>
          {loading ? 'Versturen…' : 'Review versturen'}
        </Button>
      </div>
    </form>
  )
}
