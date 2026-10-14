'use client'

import React from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { Button } from '@/components/ui'

/**
 * Move / zoom / crop an image before it is uploaded (client round 2 #2.3), so it
 * fits the frame it is shown in. The crop is rendered on a canvas in the
 * browser and re-encoded at a sensible size, which also keeps big phone photos
 * under the upload limit.
 */
export function ImageCropDialog({
  src,
  aspect,
  mimeType,
  onCancel,
  onDone,
}: {
  src: string
  aspect: number
  mimeType: string
  onCancel: () => void
  onDone: (blob: Blob) => void
}) {
  const [crop, setCrop] = React.useState({ x: 0, y: 0 })
  const [zoom, setZoom] = React.useState(1)
  const [area, setArea] = React.useState<Area | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  const save = async () => {
    if (!area) return
    setBusy(true)
    setError(null)
    try {
      onDone(await cropToBlob(src, area, mimeType))
    } catch {
      setError('Bijsnijden mislukt. Probeer een andere afbeelding.')
      setBusy(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Afbeelding bijsnijden"
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(54, 65, 80, 0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div style={{ width: '100%', maxWidth: 640, background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 24px 60px rgba(54, 65, 80, 0.35)' }}>
        <div style={{ padding: '18px 22px 12px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text-brand)' }}>Afbeelding bijsnijden</div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)', marginTop: 4 }}>
            Sleep om te verplaatsen, gebruik de schuifregelaar of scroll om in of uit te zoomen.
          </div>
        </div>
        <div style={{ position: 'relative', height: 'min(56vh, 380px)', background: 'var(--neutral-700)' }}>
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            minZoom={1}
            maxZoom={4}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setArea(pixels)}
            objectFit="contain"
          />
        </div>
        <div style={{ padding: '16px 22px 20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-body)' }}>
            <i className="ti ti-zoom-out" aria-hidden="true" />
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              aria-label="Zoom"
              style={{ flex: 1, accentColor: 'var(--blissify-forest)' }}
            />
            <i className="ti ti-zoom-in" aria-hidden="true" />
          </label>
          {error ? <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--status-error)', margin: '10px 0 0' }}>{error}</p> : null}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
              Annuleren
            </Button>
            <Button type="button" variant="primary" onClick={save} disabled={busy || !area}>
              {busy ? 'Bezig…' : 'Opslaan'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Longest side of the saved crop; plenty for covers, small enough to upload fast. */
const MAX_SIDE = 2400

async function cropToBlob(src: string, area: Area, mimeType: string): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = reject
    el.src = src
  })
  const scale = Math.min(1, MAX_SIDE / Math.max(area.width, area.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(area.width * scale)
  canvas.height = Math.round(area.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height)
  // PNG keeps transparency (logos); everything else becomes a compact JPEG.
  const type = mimeType === 'image/png' ? 'image/png' : 'image/jpeg'
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('blob'))), type, 0.88))
}
