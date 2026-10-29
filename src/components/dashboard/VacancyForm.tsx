'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button, FieldLabel, Input, Select } from '@/components/ui'
import { ImageUploadField } from './ImageUploadField'
import type { VacancyFormValues } from '@/lib/vacancy-form'
import {
  COMPENSATION_TYPES,
  EXPERIENCE_LEVELS,
  START_OPTIONS,
  VACANCY_FUNCTIONS,
  VACANCY_OFFERS,
  VACANCY_REGIMES,
  VACANCY_SECTORS,
  VACANCY_TYPES,
  WEEKDAYS,
} from '@/lib/vacancy-options'

/** Dashboard form for a vacature (spec sections 1-10, notes/blissify uitbreiding - OFF-2.pdf). */

const EMPTY: VacancyFormValues = {
  title: '', status: 'draft', companyName: '', country: 'be', city: '', address: '', website: '',
  types: [], typeOther: '', functions: [], functionOther: '', regimes: [], workdays: [], regimeNote: '',
  start: 'in-overleg', startDate: '', startNote: '', compensationTypes: [], compensationAmount: '', compensationNote: '',
  experience: '', diplomaNote: '', requirementsNote: '', offers: [], offerOther: '',
  aboutCompany: '', whoWeSeek: '', whatWeOffer: '', logo: null, coverImage: null, contactName: '', contactEmail: '', contactPhone: '',
}

const card: React.CSSProperties = { background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 28, display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 20 }
const h2: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 20, color: 'var(--text-brand)', margin: 0 }
const hint: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 12, lineHeight: 1.5, color: 'var(--text-meta)', margin: '-10px 0 0' }
const textarea: React.CSSProperties = { width: '100%', minHeight: 96, border: '0.5px solid var(--neutral-200)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', padding: '12px 16px', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-strong)', lineHeight: 1.6, resize: 'vertical', outline: 'none' }

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

function Area({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={textarea} />
    </div>
  )
}

export function VacancyForm({ vacancyId, initial, defaults }: { vacancyId?: number | string; initial?: VacancyFormValues; defaults?: Partial<VacancyFormValues> }) {
  const router = useRouter()
  const [v, setV] = React.useState<VacancyFormValues>(initial || { ...EMPTY, ...defaults })
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const set = <K extends keyof VacancyFormValues>(k: K, val: VacancyFormValues[K]) => setV((s) => ({ ...s, [k]: val }))

  async function save(status: 'draft' | 'published') {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(vacancyId ? `/api/dashboard/vacancies/${vacancyId}` : '/api/dashboard/vacancies', {
        method: vacancyId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...v, status, logo: v.logo?.id ?? null, coverImage: v.coverImage?.id ?? null }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Opslaan mislukt.')
      router.push('/dashboard/vacatures')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis.')
      setLoading(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); save('published') }} style={{ maxWidth: 760 }}>
      {error ? (
        <div role="alert" style={{ marginBottom: 20, fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.6, color: 'var(--status-error)', background: 'var(--status-error-bg)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>{error}</div>
      ) : null}

      <div style={card}>
        <h2 style={h2}>Algemene informatie</h2>
        <Input label="Titel van de vacature" placeholder="bijv. Nagelstyliste gezocht voor samenwerking in Hasselt" value={v.title} onChange={(e) => set('title', e.target.value)} required />
        <Input label="Bedrijfsnaam / salonnaam" value={v.companyName} onChange={(e) => set('companyName', e.target.value)} required />
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Select label="Land" value={v.country} onChange={(e) => set('country', e.target.value === 'nl' ? 'nl' : 'be')} options={[{ value: 'be', label: 'België' }, { value: 'nl', label: 'Nederland' }]} />
          <Input label="Stad / gemeente" value={v.city} onChange={(e) => set('city', e.target.value)} required />
        </div>
        <Input label="Adres van het salon (optioneel)" value={v.address} onChange={(e) => set('address', e.target.value)} />
        <p style={hint}>Het adres wordt niet openbaar getoond.</p>
        <Input label="Website (optioneel)" placeholder="https://..." value={v.website} onChange={(e) => set('website', e.target.value)} />
      </div>

      <div style={card}>
        <h2 style={h2}>Type vacature en functie</h2>
        <div>
          <FieldLabel>Welke vorm van samenwerking bied je aan?</FieldLabel>
          <CheckGroup options={VACANCY_TYPES} value={v.types} onChange={(x) => set('types', x)} />
        </div>
        {v.types.includes('andere') ? <Input label="Andere samenwerking" value={v.typeOther} onChange={(e) => set('typeOther', e.target.value)} /> : null}
        <div>
          <FieldLabel>Gezochte functie of specialisatie</FieldLabel>
          {VACANCY_SECTORS.map((s) => (
            <div key={s.value} style={{ marginTop: 12 }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-meta)', marginBottom: 8 }}>{s.label}</div>
              <CheckGroup options={VACANCY_FUNCTIONS.filter((f) => f.sector === s.value)} value={v.functions} onChange={(x) => set('functions', x)} />
            </div>
          ))}
        </div>
        {v.functions.includes('overig') ? <Input label="Andere functie" value={v.functionOther} onChange={(e) => set('functionOther', e.target.value)} /> : null}
      </div>

      <div style={card}>
        <h2 style={h2}>Werkregime en beschikbaarheid</h2>
        <CheckGroup options={VACANCY_REGIMES} value={v.regimes} onChange={(x) => set('regimes', x)} />
        <div>
          <FieldLabel>Gewenste werkdagen (optioneel)</FieldLabel>
          <CheckGroup options={WEEKDAYS} value={v.workdays} onChange={(x) => set('workdays', x)} columns={4} />
        </div>
        <Area label="Aanvullende informatie over het werkregime (optioneel)" value={v.regimeNote} onChange={(x) => set('regimeNote', x)} placeholder="Bijvoorbeeld: maandag en woensdag vanaf 17.00 uur, zaterdagvoormiddag of gemiddeld 20 uur per week. Andere dagen en uren zijn bespreekbaar." />
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'end' }}>
          <Select label="Wanneer kan de samenwerking starten?" value={v.start} onChange={(e) => set('start', e.target.value)} options={START_OPTIONS} />
          {v.start === 'datum' ? <Input label="Startdatum" type="date" value={v.startDate} onChange={(e) => set('startDate', e.target.value)} /> : <span />}
        </div>
        <Area label="Aanvullende informatie over de startdatum (optioneel)" value={v.startNote} onChange={(x) => set('startNote', x)} placeholder="Bijvoorbeeld: bij voorkeur vanaf januari, maar een vroegere of latere start is bespreekbaar." />
      </div>

      <div style={card}>
        <h2 style={h2}>Vergoeding en voorwaarden</h2>
        <CheckGroup options={COMPENSATION_TYPES} value={v.compensationTypes} onChange={(x) => set('compensationTypes', x)} />
        <Input label="Vergoeding: bedrag of percentage (optioneel)" placeholder="bijv. €18 per uur of 40%" value={v.compensationAmount} onChange={(e) => set('compensationAmount', e.target.value)} />
        <Area label="Aanvullende informatie over de vergoeding (optioneel)" value={v.compensationNote} onChange={(x) => set('compensationNote', x)} />
        <p style={hint}>De vergoeding en samenwerkingsvorm moeten passen binnen de toepasselijke arbeids- en zelfstandigenwetgeving.</p>
      </div>

      <div style={card}>
        <h2 style={h2}>Vereisten en aanbod</h2>
        <Select label="Ervaring" value={v.experience} onChange={(e) => set('experience', e.target.value)} options={[{ value: '', label: 'Kies een optie' }, ...EXPERIENCE_LEVELS]} />
        <Area label="Opleiding / diploma / certificaten (optioneel)" value={v.diplomaNote} onChange={(x) => set('diplomaNote', x)} />
        <Area label="Aanvullende vereisten (optioneel)" value={v.requirementsNote} onChange={(x) => set('requirementsNote', x)} placeholder="Bijvoorbeeld: eigen klantenbestand, specifieke specialisaties, beschikbaarheid op zaterdag of kennis van bepaalde producten." />
        <div>
          <FieldLabel>Wat wordt aangeboden?</FieldLabel>
          <CheckGroup options={VACANCY_OFFERS} value={v.offers} onChange={(x) => set('offers', x)} />
        </div>
        {v.offers.includes('overig') ? <Input label="Ander aanbod" value={v.offerOther} onChange={(e) => set('offerOther', e.target.value)} /> : null}
      </div>

      <div style={card}>
        <h2 style={h2}>Beschrijving</h2>
        <Area label="Over het salon / bedrijf" value={v.aboutCompany} onChange={(x) => set('aboutCompany', x)} />
        <Area label="Wie zoeken jullie?" value={v.whoWeSeek} onChange={(x) => set('whoWeSeek', x)} />
        <Area label="Wat bieden jullie aan?" value={v.whatWeOffer} onChange={(x) => set('whatWeOffer', x)} placeholder="Leg uit hoe de samenwerking er in de praktijk uitziet en wat de verwachtingen zijn." />
      </div>

      <div style={card}>
        <h2 style={h2}>Foto&apos;s</h2>
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
          <ImageUploadField label="Bedrijfslogo (optioneel)" value={v.logo} onChange={(img) => set('logo', img)} aspect="1 / 1" />
          <ImageUploadField label="Hoofdfoto (optioneel)" hint="Een foto van het salon of de werkplek." value={v.coverImage} onChange={(img) => set('coverImage', img)} />
        </div>
      </div>

      <div style={card}>
        <h2 style={h2}>Solliciteren en contact</h2>
        <p style={hint}>Geïnteresseerden reageren met een knop die rechtstreeks een e-mail naar dit adres opent.</p>
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
