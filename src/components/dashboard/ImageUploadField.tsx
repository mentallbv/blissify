'use client'

import React from 'react'

export type UploadedImage = { id: number | string; url: string } | null

/**
 * Upload-and-preview control for a single image field (photo, logo, cover).
 * Uploads immediately on selection and hands the created media id back, so the
 * parent form only ever stores a relationship id.
 */
export function ImageUploadField({
  label,
  hint,
  value,
  onChange,
  aspect = '16 / 9',
}: {
  label: string
  hint?: string
  value: UploadedImage
  onChange: (image: UploadedImage) => void
  aspect?: string
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function upload(file: File) {
    setError(null)
    setLoading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('alt', label)
      const res = await fetch('/api/dashboard/media', { method: 'POST', body, credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.id) throw new Error(data?.error || 'Uploaden mislukt.')
      onChange({ id: data.id, url: data.thumbnail || data.url })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Uploaden mislukt.')
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <span
        style={{
          display: 'block',
          fontFamily: 'var(--font-ui)',
          fontWeight: 'var(--fw-ui-medium)',
          fontSize: 12,
          color: 'var(--text-meta)',
          marginBottom: 8,
        }}
      >
        {label}
      </span>

      <div
        style={{
          position: 'relative',
          aspectRatio: aspect,
          maxWidth: 360,
          borderRadius: 'var(--radius-sm)',
          border: '0.5px dashed var(--neutral-200)',
          background: 'var(--surface-card)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {value?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)' }}>
            {loading ? 'Bezig met uploaden…' : 'Nog geen afbeelding'}
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void upload(file)
        }}
        style={{ display: 'none' }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={loading} style={linkButtonStyle}>
          {loading ? 'Bezig…' : value ? 'Vervangen' : 'Afbeelding kiezen'}
        </button>
        {value ? (
          <button type="button" onClick={() => onChange(null)} disabled={loading} style={{ ...linkButtonStyle, color: 'var(--status-error)' }}>
            Verwijderen
          </button>
        ) : null}
      </div>

      {hint && !error ? (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)', margin: '6px 0 0' }}>{hint}</p>
      ) : null}
      {error ? (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--status-error)', margin: '6px 0 0' }}>{error}</p>
      ) : null}
    </div>
  )
}

const linkButtonStyle: React.CSSProperties = {
  border: 0,
  background: 'transparent',
  padding: 0,
  cursor: 'pointer',
  fontFamily: 'var(--font-ui)',
  fontWeight: 'var(--fw-ui-medium)',
  fontSize: 13,
  color: 'var(--text-accent)',
  textDecoration: 'underline',
  textUnderlineOffset: 3,
}
