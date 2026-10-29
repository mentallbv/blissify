'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button, FieldLabel, Input, Select } from '@/components/ui'
import { ImageUploadField } from './ImageUploadField'
import type { FacilityValue, ScheduleBlock, WorkspaceFormValues } from '@/lib/workspace-form'
import {
  ACCESS_OPTIONS,
  AVAILABLE_FROM,
  DAYS,
  DEPOSIT_OPTIONS,
  FACILITY_CATEGORIES,
  FACILITY_UNITS,
  RENT_FORMULAS,
  RENT_UNITS,
  SALON_TYPES,
  USAGE_OPTIONS,
  WORKPLACE_TYPES,
  WORKSPACE_ACTIVITIES,
  WORKSPACE_SECTORS,
} from '@/lib/workspace-options'

/** Dashboard form for a werkruimte (spec sections 1-11, "Werkplek verhuren"). */

const EMPTY: WorkspaceFormValues = {
  title: '', status: 'draft', companyName: '', country: 'be', city: '', address: '', website: '',
  salonTypes: [], salonTypeOther: '', workplaceTypes: [], workplaceTypeOther: '', usage: '', access: '',
  rentFormula: 'in-overleg', rentAmount: '', rentUnit: '', rentPercentage: '', deposit: '', depositAmount: '',
  features: [], facilities: [], facilitiesNote: '', activities: [], activityOther: '',
  availableFrom: 'onmiddellijk', availableDate: '', schedule: [], otherTimesNegotiable: false,
  coverImage: null, gallery: [], description: '', contactName: '', contactEmail: '', contactPhone: '',
}

const card: React.CSSProperties = { background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 28, display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 20 }
const h2: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 20, color: 'var(--text-brand)', margin: 0 }
const hint: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 12, lineHeight: 1.5, color: 'var(--text-meta)', margin: '-10px 0 0' }
const textarea: React.CSSProperties = { width: '100%', minHeight: 96, border: '0.5px solid var(--neutral-200)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', padding: '12px 16px', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-strong)', lineHeight: 1.6, resize: 'vertical', outline: 'none' }
const small: React.CSSProperties = { height: 36, padding: '0 10px', border: '0.5px solid var(--neutral-200)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-strong)', width: '100%', minWidth: 0 }

function CheckGroup({ options, value, onChange, columns = 2 }: { options: { value: string; label: string }[]; value: string[]; onChange: (v: string[]) => void; columns?: number }) {
  return (
    <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 8 }}>
      {options.map((o) => {
        const on = value.includes(o.value)
        return (
          <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-body)' }}>
            <input type="checkbox" checked={on} onChange={() => onChange(on ? value.filter((x) => x !== o.value) : [...value, o.value])} style={{ accentColor: 'var(--blissify-forest)' }} />
            {o.label}
          </label>
        )
      })}
    </div>
  )
}

/** One facility row: Inbegrepen / Tegen meerprijs (mutually exclusive), price + unit only with meerprijs. */
function FacilityRow({ label, value, onChange, onRemove }: { label: React.ReactNode; value: FacilityValue | undefined; onChange: (v: FacilityValue | null) => void; onRemove?: () => void }) {
  const mode = value?.mode
  const set = (m: 'inbegrepen' | 'meerprijs') => {
    if (mode === m) onChange(null) // unticking removes the row
    else onChange({ key: value?.key || '', name: value?.name, mode: m, price: m === 'meerprijs' ? value?.price || '' : '', unit: m === 'meerprijs' ? value?.unit || '' : '' })
  }
  const priced = mode === 'meerprijs'
  return (
    <div className="bl-facility-row">
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-body)', display: 'flex', alignItems: 'center', gap: 8 }}>
        {label}
        {onRemove ? <button type="button" onClick={onRemove} aria-label="Verwijderen" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-meta)' }}><i className="ti ti-x" /></button> : null}
      </div>
      <label className="bl-facility-check"><input type="checkbox" checked={mode === 'inbegrepen'} onChange={() => set('inbegrepen')} style={{ accentColor: 'var(--blissify-forest)' }} /><span>Inbegrepen</span></label>
      <label className="bl-facility-check"><input type="checkbox" checked={priced} onChange={() => set('meerprijs')} style={{ accentColor: 'var(--blissify-forest)' }} /><span>Meerprijs</span></label>
      <input type="number" min={0} step="0.01" inputMode="decimal" placeholder="€" aria-label="Prijs" disabled={!priced} value={priced ? value?.price || '' : ''} onChange={(e) => value && onChange({ ...value, price: e.target.value })} style={{ ...small, opacity: priced ? 1 : 0.45 }} />
      <select aria-label="Per" disabled={!priced} value={priced ? value?.unit || '' : ''} onChange={(e) => value && onChange({ ...value, unit: e.target.value })} style={{ ...small, opacity: priced ? 1 : 0.45 }}>
        <option value="">Per …</option>
        {FACILITY_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
      </select>
    </div>
  )
}

export function WorkspaceForm({ workspaceId, initial, defaults }: { workspaceId?: number | string; initial?: WorkspaceFormValues; defaults?: Partial<WorkspaceFormValues> }) {
  const router = useRouter()
  const [v, setV] = React.useState<WorkspaceFormValues>(initial || { ...EMPTY, ...defaults })
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [openCat, setOpenCat] = React.useState<string | null>('algemeen')
  const set = <K extends keyof WorkspaceFormValues>(k: K, val: WorkspaceFormValues[K]) => setV((s) => ({ ...s, [k]: val }))

  const facility = (key: string) => v.facilities.find((f) => f.key === key)
  const setFacility = (key: string, next: FacilityValue | null) =>
    set('facilities', next ? [...v.facilities.filter((f) => f.key !== key), { ...next, key }] : v.facilities.filter((f) => f.key !== key))
  const custom = v.facilities.map((f, i) => ({ f, i })).filter(({ f }) => f.key === 'custom')

  const setBlock = (i: number, patch: Partial<ScheduleBlock>) => set('schedule', v.schedule.map((b, j) => (j === i ? { ...b, ...patch } : b)))
  const addBlock = (day: string) => set('schedule', [...v.schedule, { day, from: '09:00', to: '18:00' }])
  const fixed = v.rentFormula === 'vast' || v.rentFormula === 'vast-percentage'
  const pct = v.rentFormula === 'percentage' || v.rentFormula === 'vast-percentage'

  async function save(status: 'draft' | 'published') {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(workspaceId ? `/api/dashboard/workspaces/${workspaceId}` : '/api/dashboard/workspaces', {
        method: workspaceId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...v, status, coverImage: v.coverImage?.id ?? null, gallery: v.gallery.map((g) => g.id) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Opslaan mislukt.')
      router.push('/dashboard/werkruimtes')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis.')
      setLoading(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); save('published') }} style={{ maxWidth: 820 }}>
      {error ? <div role="alert" style={{ marginBottom: 20, fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.6, color: 'var(--status-error)', background: 'var(--status-error-bg)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>{error}</div> : null}

      <div style={card}>
        <h2 style={h2}>Algemene informatie</h2>
        <Input label="Titel van de advertentie" placeholder="bijv. Behandelruimte te huur in Hasselt" value={v.title} onChange={(e) => set('title', e.target.value)} required />
        <Input label="Salonnaam / bedrijfsnaam" value={v.companyName} onChange={(e) => set('companyName', e.target.value)} required />
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Select label="Land" value={v.country} onChange={(e) => set('country', e.target.value === 'nl' ? 'nl' : 'be')} options={[{ value: 'be', label: 'België' }, { value: 'nl', label: 'Nederland' }]} />
          <Input label="Stad / gemeente" value={v.city} onChange={(e) => set('city', e.target.value)} required />
        </div>
        <Input label="Adres van het salon (optioneel)" value={v.address} onChange={(e) => set('address', e.target.value)} />
        <p style={hint}>Het adres wordt niet openbaar getoond.</p>
        <Input label="Website (optioneel)" placeholder="https://..." value={v.website} onChange={(e) => set('website', e.target.value)} />
      </div>

      <div style={card}>
        <h2 style={h2}>Type salon en werkplek</h2>
        <div><FieldLabel>Type salon / sector</FieldLabel><CheckGroup options={SALON_TYPES} value={v.salonTypes} onChange={(x) => set('salonTypes', x)} /></div>
        {v.salonTypes.includes('overig') ? <Input label="Ander type salon" value={v.salonTypeOther} onChange={(e) => set('salonTypeOther', e.target.value)} /> : null}
        <div><FieldLabel>Type werkplek</FieldLabel><CheckGroup options={WORKPLACE_TYPES} value={v.workplaceTypes} onChange={(x) => set('workplaceTypes', x)} /></div>
        {v.workplaceTypes.includes('overig') ? <Input label="Ander type werkplek" value={v.workplaceTypeOther} onChange={(e) => set('workplaceTypeOther', e.target.value)} /> : null}
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Select label="Hoe wordt de werkplek verhuurd?" value={v.usage} onChange={(e) => set('usage', e.target.value)} options={[{ value: '', label: 'Kies een optie' }, ...USAGE_OPTIONS]} />
          <Select label="Wanneer heeft de huurder toegang?" value={v.access} onChange={(e) => set('access', e.target.value)} options={[{ value: '', label: 'Kies een optie' }, ...ACCESS_OPTIONS]} />
        </div>
        <p style={hint}>Exclusief gebruik betekent niet dat de ruimte permanent aan één persoon wordt verhuurd: een huurder kan bijvoorbeeld op maandagavond exclusief over de ruimte beschikken.</p>
      </div>

      <div style={card}>
        <h2 style={h2}>Huurprijs</h2>
        <Select label="Huurformule" value={v.rentFormula} onChange={(e) => set('rentFormula', e.target.value)} options={RENT_FORMULAS} />
        {fixed ? (
          <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input label="Huurprijs (€, optioneel)" type="number" value={v.rentAmount} onChange={(e) => set('rentAmount', e.target.value)} />
            <Select label="Prijs per" value={v.rentUnit} onChange={(e) => set('rentUnit', e.target.value)} options={[{ value: '', label: 'Kies' }, ...RENT_UNITS]} />
          </div>
        ) : null}
        {pct ? <Input label="Percentage van de omzet (optioneel)" type="number" value={v.rentPercentage} onChange={(e) => set('rentPercentage', e.target.value)} /> : null}
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Select label="Waarborg" value={v.deposit} onChange={(e) => set('deposit', e.target.value)} options={[{ value: '', label: 'Kies een optie' }, ...DEPOSIT_OPTIONS]} />
          {v.deposit === 'bedrag' ? <Input label="Waarborgbedrag (€)" type="number" value={v.depositAmount} onChange={(e) => set('depositAmount', e.target.value)} /> : <span />}
        </div>
      </div>

      <div style={card}>
        <h2 style={h2}>Voorzieningen en faciliteiten</h2>
        <p style={hint}>Duid enkel aan wat aanwezig is en geef aan of het inbegrepen is in de huurprijs of beschikbaar tegen meerprijs. Wat je niet aanduidt, wordt niet getoond.</p>
        {FACILITY_CATEGORIES.map((c) => {
          const open = openCat === c.key
          const count = c.priced ? c.items.filter((i) => facility(i.value)).length : c.items.filter((i) => v.features.includes(i.value)).length
          return (
            <div key={c.key} style={{ borderTop: '0.5px solid var(--border-hairline)', paddingTop: 12 }}>
              <button type="button" onClick={() => setOpenCat(open ? null : c.key)} aria-expanded={open} style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: 'none', cursor: 'pointer', padding: '4px 0', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 14, color: 'var(--text-strong)', textAlign: 'left' }}>
                <span>{c.label}{count ? <span style={{ color: 'var(--text-accent)', fontWeight: 'var(--fw-ui-regular)' }}> · {count} gekozen</span> : null}</span>
                <i className={`ti ti-chevron-${open ? 'up' : 'down'}`} style={{ color: 'var(--text-meta)' }} />
              </button>
              {open ? (
                <div style={{ marginTop: 12 }}>
                  {c.priced ? (
                    <>
                      <div className="bl-facility-row bl-facility-head"><span>Voorziening</span><span>Inbegrepen</span><span>Meerprijs</span><span>Prijs (€)</span><span>Per</span></div>
                      {c.items.map((i) => <FacilityRow key={i.value} label={i.label} value={facility(i.value)} onChange={(next) => setFacility(i.value, next)} />)}
                    </>
                  ) : (
                    <CheckGroup options={c.items} value={v.features} onChange={(x) => set('features', x)} />
                  )}
                </div>
              ) : null}
            </div>
          )
        })}
        <div style={{ borderTop: '0.5px solid var(--border-hairline)', paddingTop: 12 }}>
          <FieldLabel>Overige voorzieningen</FieldLabel>
          {custom.map(({ f, i }) => (
            <FacilityRow
              key={i}
              label={<input value={f.name || ''} placeholder="Zelf invullen" onChange={(e) => set('facilities', v.facilities.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} style={small} />}
              value={f}
              onChange={(next) => set('facilities', next ? v.facilities.map((x, j) => (j === i ? { ...next, key: 'custom', name: f.name } : x)) : v.facilities.filter((_, j) => j !== i))}
              onRemove={() => set('facilities', v.facilities.filter((_, j) => j !== i))}
            />
          ))}
          <Button type="button" size="sm" variant="ghost" onClick={() => set('facilities', [...v.facilities, { key: 'custom', name: '', mode: 'inbegrepen', price: '', unit: '' }])}>+ Andere voorziening toevoegen</Button>
        </div>
        <div>
          <FieldLabel>Aanvullende informatie over voorzieningen en meerprijzen (optioneel)</FieldLabel>
          <textarea value={v.facilitiesNote} onChange={(e) => set('facilitiesNote', e.target.value)} style={textarea} placeholder="Bijvoorbeeld: handdoeken zijn beschikbaar tegen €5 per dag. Elektriciteit en water zijn inbegrepen bij dagverhuur." />
        </div>
      </div>

      <div style={card}>
        <h2 style={h2}>Geschikt voor welke activiteiten?</h2>
        {WORKSPACE_SECTORS.map((s) => (
          <div key={s.value}>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-meta)', marginBottom: 8 }}>{s.label}</div>
            <CheckGroup options={WORKSPACE_ACTIVITIES.filter((a) => a.sector === s.value)} value={v.activities} onChange={(x) => set('activities', x)} />
          </div>
        ))}
        {v.activities.includes('overig') ? <Input label="Andere activiteit" value={v.activityOther} onChange={(e) => set('activityOther', e.target.value)} /> : null}
        <p style={hint}>Bij medische of gereglementeerde activiteiten gaan verhuurder en huurder zelf na of de ruimte voldoet aan de wettelijke, hygiënische en professionele vereisten.</p>
      </div>

      <div style={card}>
        <h2 style={h2}>Beschikbaarheid</h2>
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'end' }}>
          <Select label="Vanaf wanneer is de werkplek beschikbaar?" value={v.availableFrom} onChange={(e) => set('availableFrom', e.target.value)} options={AVAILABLE_FROM} />
          {v.availableFrom === 'datum' ? <Input label="Datum" type="date" value={v.availableDate} onChange={(e) => set('availableDate', e.target.value)} /> : <span />}
        </div>
        <div>
          <FieldLabel>Op welke dagen en uren?</FieldLabel>
          <p style={{ ...hint, margin: '0 0 12px' }}>Per dag kun je meerdere tijdsblokken toevoegen, bijvoorbeeld 07.00–10.00 en 18.00–22.00.</p>
          <div style={{ display: 'grid', gap: 10 }}>
            {DAYS.map((d) => {
              const blocks = v.schedule.map((b, i) => ({ b, i })).filter(({ b }) => b.day === d.value)
              return (
                <div key={d.value} className="bl-schedule-row">
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-strong)', paddingTop: 8 }}>{d.label}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                    {blocks.map(({ b, i }) => (
                      <span key={i} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                        <input type="time" value={b.from} onChange={(e) => setBlock(i, { from: e.target.value })} style={{ ...small, width: 110 }} aria-label={`${d.label} van`} />
                        <span style={{ color: 'var(--text-meta)' }}>–</span>
                        <input type="time" value={b.to} onChange={(e) => setBlock(i, { to: e.target.value })} style={{ ...small, width: 110 }} aria-label={`${d.label} tot`} />
                        <button type="button" onClick={() => set('schedule', v.schedule.filter((_, j) => j !== i))} aria-label="Tijdsblok verwijderen" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-meta)' }}><i className="ti ti-x" /></button>
                      </span>
                    ))}
                    <button type="button" onClick={() => addBlock(d.value)} className="bl-textlink" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 13 }}>+ tijdsblok</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-body)' }}>
          <input type="checkbox" checked={v.otherTimesNegotiable} onChange={(e) => set('otherTimesNegotiable', e.target.checked)} style={{ accentColor: 'var(--blissify-forest)' }} />
          Andere dagen of uren zijn bespreekbaar
        </label>
      </div>

      <div style={card}>
        <h2 style={h2}>Foto&apos;s en beschrijving</h2>
        <ImageUploadField label="Hoofdfoto" value={v.coverImage} onChange={(img) => set('coverImage', img)} />
        <div>
          <FieldLabel>Meer foto&apos;s (optioneel)</FieldLabel>
          <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {v.gallery.map((g, i) => (
              <ImageUploadField key={`${g.id}-${i}`} label={`Foto ${i + 1}`} value={g} onChange={(img) => set('gallery', img ? v.gallery.map((x, j) => (j === i ? img : x)) : v.gallery.filter((_, j) => j !== i))} aspect="4 / 3" />
            ))}
            {v.gallery.length < 12 ? <ImageUploadField key={`new-${v.gallery.length}`} label="Foto toevoegen" value={null} onChange={(img) => img && set('gallery', [...v.gallery, img])} aspect="4 / 3" /> : null}
          </div>
        </div>
        <div>
          <FieldLabel>Beschrijving</FieldLabel>
          <textarea value={v.description} onChange={(e) => set('description', e.target.value)} style={{ ...textarea, minHeight: 140 }} placeholder="Vertel iets over de werkplek, de sfeer van het salon, de voorzieningen, de huurvoorwaarden, de beschikbaarheid en het type samenwerking dat je zoekt." />
        </div>
      </div>

      <div style={card}>
        <h2 style={h2}>Contactgegevens</h2>
        <p style={hint}>Geïnteresseerden sturen via Blissify een aanvraag; jij ontvangt die per e-mail. Je e-mailadres, telefoonnummer en adres worden niet openbaar getoond.</p>
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input label="Contactpersoon" value={v.contactName} onChange={(e) => set('contactName', e.target.value)} required />
          <Input label="E-mailadres" type="email" value={v.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} required />
        </div>
        <Input label="Telefoonnummer (optioneel)" value={v.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} />
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button variant="primary" type="submit" disabled={loading}>{loading ? 'Opslaan…' : 'Publiceren'}</Button>
        <Button variant="ghost" type="button" disabled={loading} onClick={() => save('draft')}>Opslaan als offline</Button>
      </div>
    </form>
  )
}
