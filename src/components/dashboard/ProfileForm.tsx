'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Input, Select, Button, FieldLabel } from '@/components/ui'
import { ImageUploadField, type UploadedImage } from '@/components/dashboard/ImageUploadField'
import { RichTextEditor } from '@/components/dashboard/RichTextEditor'

export function ProfileForm({
  initial,
}: {
  initial: {
    role: 'trainer' | 'brand'
    name: string
    city: string
    website: string
    email: string
    phone: string
    about: string
    accentColor: string
    canBrand: boolean
    photo: UploadedImage
    coverImage: UploadedImage
    partnerType: string
    origin: string
    instagram: string
    facebook: string
    tiktok: string
    localPartners: { name: string; country: string; website: string }[]
  }
}) {
  const router = useRouter()
  const [v, setV] = React.useState(initial)
  const [error, setError] = React.useState<string | null>(null)
  const [saved, setSaved] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const set = <K extends keyof typeof v>(k: K, val: (typeof v)[K]) => setV((s) => ({ ...s, [k]: val }))
  const addPartner = () => set('localPartners', [...v.localPartners, { name: '', country: '', website: '' }])
  const updatePartner = (index: number, key: 'name' | 'country' | 'website', value: string) =>
    set('localPartners', v.localPartners.map((partner, itemIndex) => itemIndex === index ? { ...partner, [key]: value } : partner))
  const removePartner = (index: number) => set('localPartners', v.localPartners.filter((_, itemIndex) => itemIndex !== index))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    setLoading(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        // Images travel as relationship ids; they were uploaded on selection.
        body: JSON.stringify({ ...v, photo: v.photo?.id ?? null, coverImage: v.coverImage?.id ?? null }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Opslaan mislukt.')
      setSaved(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 640 }}>
      <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Input label={v.role === 'brand' ? 'Naam merk / leverancier' : 'Naam opleider'} value={v.name} onChange={(e) => set('name', e.target.value)} />
        <Input label="Locatie" value={v.city} onChange={(e) => set('city', e.target.value)} />
        <Input label="Website" value={v.website} onChange={(e) => set('website', e.target.value)} />
        <Input label="E-mail" type="email" value={v.email} onChange={(e) => set('email', e.target.value)} />
        <Input label="Telefoon" value={v.phone} onChange={(e) => set('phone', e.target.value)} />
        <ImageUploadField
          label={v.role === 'brand' ? 'Logo' : 'Profielfoto'}
          hint="JPG, PNG, WebP of AVIF · max 5 MB"
          value={v.photo}
          onChange={(image) => set('photo', image)}
          aspect={v.role === 'brand' ? '16 / 9' : '1 / 1'}
        />

        {v.role === 'brand' ? (
          <ImageUploadField
            label="Coverafbeelding"
            hint="Breed beeld bovenaan je merkpagina · max 5 MB"
            value={v.coverImage}
            onChange={(image) => set('coverImage', image)}
          />
        ) : null}

        <div>
          <FieldLabel>Over {v.role === 'brand' ? 'het merk / de leverancier' : 'de opleider'}</FieldLabel>
          <RichTextEditor
            value={v.about}
            onChange={(html) => set('about', html)}
            placeholder="Beschrijf je organisatie, specialisatie en aanpak."
            minHeight={160}
          />
        </div>
        {v.canBrand ? (
          <div style={{ borderTop: '0.5px solid var(--border-hairline)', paddingTop: 18 }}>
            <FieldLabel>Accentkleur</FieldLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="color"
                aria-label="Accentkleur kiezen"
                value={/^#[0-9a-f]{6}$/i.test(v.accentColor) ? v.accentColor : '#1A2E25'}
                onChange={(e) => set('accentColor', e.target.value.toUpperCase())}
                style={{ width: 44, height: 38, padding: 2, border: '0.5px solid var(--neutral-200)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <Input label="" placeholder="#1A2E25" value={v.accentColor} onChange={(e) => set('accentColor', e.target.value)} />
              </div>
              {v.accentColor ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => set('accentColor', '')}>Wissen</Button>
              ) : null}
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-meta)', margin: '8px 0 0' }}>
              Gebruikt als accent op je publieke profiel.
            </p>
          </div>
        ) : null}

        {v.role === 'brand' ? (
          <>
            <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Select label="Type partner" value={v.partnerType} onChange={(e) => set('partnerType', e.target.value)} options={[
                { value: 'productmerken', label: 'Productmerk' },
                { value: 'apparatuurmerken', label: 'Apparatuurmerk' },
                { value: 'groothandels_distributeurs', label: 'Groothandel / Distributeur' },
                { value: 'leveranciers', label: 'Leverancier' },
              ]} />
              <Select label="Herkomst" value={v.origin} onChange={(e) => set('origin', e.target.value)} options={[
                { value: 'belgisch', label: 'Belgisch' },
                { value: 'nederlands', label: 'Nederlands' },
                { value: 'europees', label: 'Europees' },
                { value: 'internationaal', label: 'Internationaal' },
              ]} />
            </div>
            <div style={{ borderTop: '0.5px solid var(--border-hairline)', paddingTop: 18 }}>
              <FieldLabel>Sociale kanalen</FieldLabel>
              <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Input label="Instagram" value={v.instagram} onChange={(e) => set('instagram', e.target.value)} />
                <Input label="Facebook" value={v.facebook} onChange={(e) => set('facebook', e.target.value)} />
                <Input label="TikTok" value={v.tiktok} onChange={(e) => set('tiktok', e.target.value)} />
              </div>
            </div>
            <div style={{ borderTop: '0.5px solid var(--border-hairline)', paddingTop: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <FieldLabel>Lokale partners / distributeurs</FieldLabel>
                <Button type="button" variant="ghost" size="sm" onClick={addPartner}>Partner toevoegen</Button>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                {v.localPartners.map((partner, index) => (
                  <div key={index} style={{ border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
                    <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Input label="Naam" value={partner.name} onChange={(e) => updatePartner(index, 'name', e.target.value)} />
                      <Input label="Land / regio" value={partner.country} onChange={(e) => updatePartner(index, 'country', e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'end', marginTop: 12 }}>
                      <div style={{ flex: 1 }}><Input label="Website" value={partner.website} onChange={(e) => updatePartner(index, 'website', e.target.value)} /></div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removePartner(index)}>Verwijderen</Button>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-meta)', margin: '12px 0 0' }}>Logo, banner en maximaal vijf sfeerfoto’s kun je beheren via de inhoudsbeheeromgeving.</p>
            </div>
          </>
        ) : null}
      </div>

      {error ? (
        <div style={{ marginTop: 16, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--status-error)', background: 'var(--status-error-bg)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>{error}</div>
      ) : null}
      {saved ? (
        <div style={{ marginTop: 16, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--status-success)', background: 'var(--status-success-bg)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>Profiel opgeslagen.</div>
      ) : null}

      <div style={{ marginTop: 20 }}>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Opslaan…' : 'Wijzigingen opslaan'}
        </Button>
      </div>
    </form>
  )
}
