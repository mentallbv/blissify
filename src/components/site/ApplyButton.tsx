'use client'

import React from 'react'
import { ModalShell } from './ModalShell'

/**
 * "Solliciteer" (like creativeskills.be): with a link it opens the poster's
 * site; with email a dialog offers Gmail, Outlook, the default mail app or
 * copying the address, all with the subject filled in. Nothing about the
 * applicant passes through Blissify.
 */
export function ApplyButton({ method, url, email, title, label = 'Solliciteer' }: { method: 'email' | 'link'; url?: string | null; email: string; title: string; label?: string }) {
  const [open, setOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const close = React.useCallback(() => setOpen(false), [])
  const subject = `Sollicitatie ${title} (via Blissify)`

  if (method === 'link' && url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="bl-apply-btn">
        {label} <i className="ti ti-external-link" aria-hidden="true" />
      </a>
    )
  }

  const s = encodeURIComponent(subject)
  const to = encodeURIComponent(email)
  const options = [
    { label: 'Gmail', hint: 'Opent in een nieuw tabblad', icon: 'ti-brand-gmail', href: `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${s}`, external: true },
    { label: 'Outlook', hint: 'Opent in een nieuw tabblad', icon: 'ti-mail-opened', href: `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${s}`, external: true },
    { label: 'Je eigen mailapp', hint: 'Bijvoorbeeld Apple Mail of Outlook op je computer', icon: 'ti-mail', href: `mailto:${email}?subject=${s}`, external: false },
  ]

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="bl-apply-btn">{label}</button>
      {open ? (
        <ModalShell title="Solliciteer via e-mail" subtitle={title} onClose={close} width={460}>
          <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '12px 14px', fontFamily: 'var(--font-ui)', fontSize: 13, lineHeight: 1.7, color: 'var(--text-strong)', marginBottom: 16 }}>
            <div><span style={{ color: 'var(--text-meta)' }}>Aan:</span> {email}</div>
            <div><span style={{ color: 'var(--text-meta)' }}>Onderwerp:</span> {subject}</div>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {options.map((o) => (
              <a key={o.label} href={o.href} target={o.external ? '_blank' : undefined} rel="noopener noreferrer" className="bl-mailoption" onClick={close}>
                <i className={`ti ${o.icon}`} aria-hidden="true" />
                <span>{o.label}<small>{o.hint}</small></span>
                <i className="ti ti-chevron-right" aria-hidden="true" style={{ color: 'var(--text-meta)' }} />
              </a>
            ))}
            <button
              type="button"
              className="bl-mailoption"
              onClick={async () => {
                await navigator.clipboard?.writeText(email).catch(() => {})
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
            >
              <i className={`ti ${copied ? 'ti-check' : 'ti-copy'}`} aria-hidden="true" />
              <span>{copied ? 'Adres gekopieerd' : 'Kopieer het e-mailadres'}<small>Plak het in je eigen e-mail</small></span>
            </button>
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, lineHeight: 1.6, color: 'var(--text-strong)', margin: '16px 0 0' }}>
            Voeg je cv en een korte motivatie toe. Vermeld Blissify als referentie.
          </p>
        </ModalShell>
      ) : null}
    </>
  )
}
