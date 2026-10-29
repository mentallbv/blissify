'use client'

import React from 'react'

/**
 * "Solliciteer" (like creativeskills.be): with a link it opens the poster's
 * site; with email a small popup offers Gmail, Outlook, the default mail app
 * or copying the address. Nothing about the applicant passes through Blissify.
 */
export function ApplyButton({ method, url, email, title, label = 'Solliciteer' }: { method: 'email' | 'link'; url?: string | null; email: string; title: string; label?: string }) {
  const [open, setOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const subject = `Sollicitatie ${title} (via Blissify)`
  const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px 20px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--blissify-terracotta)', color: '#fff', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 15, cursor: 'pointer', textDecoration: 'none' }

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  if (method === 'link' && url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={btn}>
        {label} <i className="ti ti-external-link" aria-hidden="true" />
      </a>
    )
  }

  const s = encodeURIComponent(subject)
  const options = [
    { label: 'Gmail', icon: 'ti-brand-gmail', href: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${s}` },
    { label: 'Outlook', icon: 'ti-brand-windows', href: `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(email)}&subject=${s}` },
    { label: 'Standaard mailapp', icon: 'ti-mail', href: `mailto:${email}?subject=${s}` },
  ]
  const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 16px', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--text-strong)', textDecoration: 'none', cursor: 'pointer', textAlign: 'left' }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={btn}>{label}</button>
      {open ? (
        <div role="dialog" aria-modal="true" aria-label="Solliciteer via e-mail" onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(30, 36, 44, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 420, background: 'var(--surface-page)', borderRadius: 'var(--radius-md)', padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)', margin: 0 }}>Solliciteer via e-mail</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Sluiten" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-meta)' }}><i className="ti ti-x" /></button>
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.6, color: 'var(--text-body)', margin: '0 0 18px' }}>Kies hoe je je e-mail wilt versturen. Vermeld Blissify als referentie in je e-mail.</p>
            <div style={{ display: 'grid', gap: 10 }}>
              {options.map((o) => (
                <a key={o.label} href={o.href} target={o.href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer" style={row} onClick={() => setOpen(false)}>
                  <i className={`ti ${o.icon}`} aria-hidden="true" style={{ fontSize: 20, color: 'var(--text-meta)' }} /> {o.label}
                </a>
              ))}
              <button
                type="button"
                style={row}
                onClick={async () => {
                  await navigator.clipboard?.writeText(email).catch(() => {})
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
              >
                <i className="ti ti-copy" aria-hidden="true" style={{ fontSize: 20, color: 'var(--text-meta)' }} /> {copied ? 'Gekopieerd' : `Kopieer ${email}`}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
