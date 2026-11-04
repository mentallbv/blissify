'use client'

import React from 'react'

/**
 * Newsletter signup (Mailchimp). Used in the footer (and thus on every page incl. home).
 * The optional "Waar ben je naar op zoek?" answer becomes a segment tag.
 */
export function NewsletterForm() {
  const [email, setEmail] = React.useState('')
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = React.useState('')
  const [focused, setFocused] = React.useState(false)
  const [audience, setAudience] = React.useState<'professional' | 'consumer' | ''>('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, audience: audience || undefined }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus('error')
        setMessage(data?.error || 'Inschrijven mislukt.')
        return
      }
      setStatus('done')
      setMessage(data?.message || 'Bedankt! Je bent ingeschreven voor de Blissify nieuwsbrief.')
      setEmail('')
    } catch {
      setStatus('error')
      setMessage('Er ging iets mis.')
    }
  }

  if (status === 'done') {
    return (
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, lineHeight: 1.6, color: 'rgba(225, 230, 234,0.85)', margin: 0 }}>
        {message}
      </p>
    )
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <fieldset style={{ border: 'none', padding: 0, margin: '0 0 6px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        <legend style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'rgba(225, 230, 234,0.7)', padding: 0, marginBottom: 8, float: 'left', width: '100%' }}>Waar ben je naar op zoek?</legend>
        {([['professional', 'Ik ben professional'], ['consumer', 'Ik ben eindklant']] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={audience === value}
            onClick={() => setAudience(audience === value ? '' : value)}
            className="bl-newsletter-chip"
          >
            {label}
          </button>
        ))}
      </fieldset>
      <div className="bl-newsletter-row" style={{ display: 'flex', gap: 0, maxWidth: 420 }}>
        <input
          className="bl-newsletter-input"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Jouw e-mailadres"
          aria-label="Jouw e-mailadres"
          style={{
            flex: 1,
            minWidth: 280,
            height: 48,
            borderRadius: 'var(--radius-pill) 0 0 var(--radius-pill)',
            border: focused
              ? '0.5px solid rgba(225, 230, 234,0.6)'
              : '0.5px solid rgba(225, 230, 234,0.25)',
            borderRight: 'none',
            background: 'rgba(225, 230, 234,0.06)',
            color: 'var(--blissify-chalk)',
            padding: '0 20px',
            fontFamily: 'var(--font-ui)',
            fontSize: 15,
            outline: focused ? '2px solid rgba(225, 230, 234,0.2)' : 'none',
            outlineOffset: 2,
            transition: 'border-color 0.15s ease',
          }}
        />
        <button
          className="bl-newsletter-button"
          type="submit"
          disabled={status === 'loading'}
          style={{
            height: 48,
            padding: '0 28px',
            borderRadius: '0 var(--radius-pill) var(--radius-pill) 0',
            border: 'none',
            cursor: status === 'loading' ? 'wait' : 'pointer',
            background: '#fff',
            color: 'var(--palette-slate-ink)',
            fontFamily: 'var(--font-ui)',
            fontWeight: 'var(--fw-ui-medium)',
            fontSize: 15,
            whiteSpace: 'nowrap',
            opacity: status === 'loading' ? 0.7 : 1,
            transition: 'opacity 0.15s ease',
          }}
        >
          {status === 'loading' ? 'Bezig…' : 'Inschrijven'}
        </button>
      </div>
      {status === 'error' ? (
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#E8A98F' }}>{message}</span>
      ) : null}
    </form>
  )
}
