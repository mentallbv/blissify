'use client'

import React from 'react'

/** Newsletter signup (Brevo). Used in the footer (and thus on every page incl. home). */
export function NewsletterForm() {
  const [email, setEmail] = React.useState('')
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = React.useState('')
  const [focused, setFocused] = React.useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, lineHeight: 1.6, color: 'rgba(245,240,234,0.85)', margin: 0 }}>
        {message}
      </p>
    )
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="jouw@email.be"
          aria-label="E-mailadres"
          style={{
            flex: 1,
            minWidth: 0,
            height: 40,
            borderRadius: 6,
            border: focused
              ? '0.5px solid rgba(245,240,234,0.6)'
              : '0.5px solid rgba(245,240,234,0.25)',
            background: 'rgba(245,240,234,0.06)',
            color: 'var(--blissify-chalk)',
            padding: '0 12px',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            outline: focused ? '2px solid rgba(245,240,234,0.2)' : 'none',
            outlineOffset: 2,
            transition: 'border-color 0.15s ease',
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            height: 40,
            padding: '0 16px',
            borderRadius: 6,
            border: 'none',
            cursor: status === 'loading' ? 'wait' : 'pointer',
            background: 'var(--blissify-terracotta)',
            color: '#fff',
            fontFamily: 'var(--font-ui)',
            fontWeight: 'var(--fw-ui-medium)',
            fontSize: 13,
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
