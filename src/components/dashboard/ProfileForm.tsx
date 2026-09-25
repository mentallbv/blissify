'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Input, Select, Button, FieldLabel } from '@/components/ui'
import { ImageUploadField, type UploadedImage } from '@/components/dashboard/ImageUploadField'
import { RichTextEditor } from '@/components/dashboard/RichTextEditor'
import { MERKEN_GROUPS } from '@/lib/merken-filters'

// Single source of truth: the exact category options used by the /merken filter,
// so a partner's categories always match what visitors can filter on (client #8).
const PRODUCTTYPE_OPTIONS = MERKEN_GROUPS.find((g) => g.key === 'producttype')?.options ?? []

export function ProfileForm({
  initial,
  brandOptions = [],
}: {
  brandOptions?: { value: number; label: string }[]
  initial: {
    role: 'trainer' | 'brand'
    name: string
    city: string
    country: string
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
    producttype: string[]
    categoryLimit: number
    instagram: string
    facebook: string
    tiktok: string
    gallery: { image: UploadedImage; caption: string }[]
    collaboratingBrands: number[]
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

  // Gallery photos (client #9): up to 10 product/atmosphere photos on the
  // public merk detail page.
  const MAX_GALLERY = 10
  const addPhoto = () => { if (v.gallery.length < MAX_GALLERY) set('gallery', [...v.gallery, { image: null, caption: '' }]) }
  const updatePhoto = (index: number, patch: Partial<{ image: UploadedImage; caption: string }>) =>
    set('gallery', v.gallery.map((g, i) => (i === index ? { ...g, ...patch } : g)))
  const removePhoto = (index: number) => set('gallery', v.gallery.filter((_, i) => i !== index))

  // Co-branding (client #12): opleider picks the merken it collaborates with.
  const toggleBrand = (id: number) =>
    set('collaboratingBrands', v.collaboratingBrands.includes(id) ? v.collaboratingBrands.filter((x) => x !== id) : [...v.collaboratingBrands, id])

  // Category (producttype) selection with the tier limit (Lite 1 / Premium 3 /
  // Ultimate unlimited). Unlimited arrives as a large number (Infinity can't be
  // JSON-serialised from the server component).
  const unlimited = v.categoryLimit >= 999
  const atCategoryLimit = !unlimited && v.producttype.length >= v.categoryLimit
  const toggleCategory = (val: string) => {
    if (v.producttype.includes(val)) set('producttype', v.producttype.filter((x) => x !== val))
    else if (!atCategoryLimit) set('producttype', [...v.producttype, val])
  }

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
        body: JSON.stringify({
          ...v,
          photo: v.photo?.id ?? null,
          coverImage: v.coverImage?.id ?? null,
          gallery: v.gallery.filter((g) => g.image?.id).map((g) => ({ image: g.image?.id, caption: g.caption })),
        }),
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
        {v.role === 'trainer' ? (
          <Select label="Land" value={v.country} onChange={(e) => set('country', e.target.value)} options={[
            { value: 'be', label: 'België' },
            { value: 'nl', label: 'Nederland' },
          ]} />
        ) : null}
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

        {v.role === 'brand' ? (
          <div style={{ borderTop: '0.5px solid var(--border-hairline)', paddingTop: 18 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
              <FieldLabel>Foto&apos;s</FieldLabel>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)' }}>{v.gallery.length} / {MAX_GALLERY}</span>
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)', margin: '0 0 12px' }}>
              Toon je producten, apparatuur en sfeer op je merkpagina. Maximaal {MAX_GALLERY} foto&apos;s.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {v.gallery.map((g, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start' }}>
                  <div>
                    <ImageUploadField
                      label={`Foto ${i + 1}`}
                      hint="JPG, PNG, WebP of AVIF · max 5 MB"
                      value={g.image}
                      onChange={(image) => updatePhoto(i, { image })}
                    />
                    <div style={{ marginTop: 8 }}>
                      <Input label="" placeholder="Bijschrift (optioneel)" value={g.caption} onChange={(e) => updatePhoto(i, { caption: e.target.value })} />
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removePhoto(i)}>Verwijderen</Button>
                </div>
              ))}
            </div>
            {v.gallery.length < MAX_GALLERY ? (
              <div style={{ marginTop: 12 }}>
                <Button type="button" variant="ghost" size="sm" onClick={addPhoto}>Foto toevoegen</Button>
              </div>
            ) : null}
          </div>
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
        {/* Eigen branding (accentkleur) removed - client #7: everything stays in
            the site's consistent style. */}

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

            {/* Categorieën (producttype) — determine where the partner shows up in
                the merken & leveranciers filters (client #8). Limited by tier. */}
            <div style={{ borderTop: '0.5px solid var(--border-hairline)', paddingTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                <FieldLabel>Categorieën</FieldLabel>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: atCategoryLimit ? 'var(--text-accent)' : 'var(--text-meta)' }}>
                  {unlimited ? `${v.producttype.length} gekozen · onbeperkt` : `${v.producttype.length} / ${v.categoryLimit} gekozen`}
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)', margin: '2px 0 12px' }}>
                Bepaalt bij welke zoekopdrachten en filters je verschijnt in Merken &amp; Leveranciers.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {PRODUCTTYPE_OPTIONS.map((o) => {
                  const on = v.producttype.includes(o.value)
                  const disabled = !on && atCategoryLimit
                  return (
                    <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, color: disabled ? 'var(--text-meta)' : 'var(--text-body)', opacity: disabled ? 0.5 : 1 }}>
                      <input type="checkbox" checked={on} disabled={disabled} onChange={() => toggleCategory(o.value)} style={{ accentColor: 'var(--blissify-forest)' }} />
                      {o.label}
                    </label>
                  )
                })}
              </div>
              {atCategoryLimit ? (
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)', margin: '10px 0 0' }}>
                  Je hebt het maximum voor je abonnement bereikt. Upgrade voor meer categorieën.
                </p>
              ) : null}
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
            </div>
          </>
        ) : null}

        {v.role === 'trainer' ? (
          <>
            <div style={{ borderTop: '0.5px solid var(--border-hairline)', paddingTop: 18 }}>
              <FieldLabel>Sociale kanalen</FieldLabel>
              <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 4 }}>
                <Input label="Instagram" value={v.instagram} onChange={(e) => set('instagram', e.target.value)} />
                <Input label="Facebook" value={v.facebook} onChange={(e) => set('facebook', e.target.value)} />
                <Input label="TikTok" value={v.tiktok} onChange={(e) => set('tiktok', e.target.value)} />
              </div>
            </div>

            {brandOptions.length ? (
              <div style={{ borderTop: '0.5px solid var(--border-hairline)', paddingTop: 18 }}>
                <FieldLabel>Samenwerkende merken</FieldLabel>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)', margin: '2px 0 12px' }}>
                  Merken waarmee je samenwerkt of door erkend bent. Ze verschijnen op jouw profiel, en jij verschijnt op hun merkpagina.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                  {brandOptions.map((b) => (
                    <label key={b.value} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-body)' }}>
                      <input type="checkbox" checked={v.collaboratingBrands.includes(b.value)} onChange={() => toggleBrand(b.value)} style={{ accentColor: 'var(--blissify-forest)' }} />
                      {b.label}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
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
