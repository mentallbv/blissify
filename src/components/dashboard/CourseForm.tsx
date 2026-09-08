'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Input, Select, Button, FieldLabel, Tag } from '@/components/ui'
import { ImageUploadField, type UploadedImage } from '@/components/dashboard/ImageUploadField'
import { RichTextEditor } from '@/components/dashboard/RichTextEditor'

export type CourseFormValues = {
  title: string
  slug: string
  status: string
  category: string
  shortDescription: string
  description: string
  coverImage: UploadedImage
  externalUrl: string
  city: string
  level: string
  accreditation: string
  certificate: boolean
  productLaunchHighlighted: boolean
  coBrandPartner: string
  priceAmount: string
  priceOnRequest: boolean
  durationValue: string
  durationUnit: string
  format: string[]
  courseType: string
  language: string[]
  targetAudience: string[]
  practical: string[]
  focus: string[]
  maximumParticipants: string
  privateOneToOne: boolean
  modelRequired: string
  lunchProvided: string
  contactEmail: string
  contactWebsite: string
  instagram: string
  facebook: string
  tiktok: string
  startDates: { date: string; endDate: string; startTime: string; endTime: string; spotsAvailable: string }[]
  tags: string
}

const EMPTY: CourseFormValues = {
  title: '',
  slug: '',
  status: 'draft',
  category: '',
  shortDescription: '',
  description: '',
  coverImage: null,
  externalUrl: '',
  city: '',
  level: '',
  accreditation: '',
  certificate: false,
  productLaunchHighlighted: false,
  coBrandPartner: '',
  priceAmount: '',
  priceOnRequest: false,
  durationValue: '',
  durationUnit: 'days',
  format: [],
  courseType: '',
  language: ['nl'],
  targetAudience: [],
  practical: [],
  focus: [],
  maximumParticipants: '',
  privateOneToOne: false,
  modelRequired: 'not_applicable',
  lunchProvided: 'not_applicable',
  contactEmail: '',
  contactWebsite: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  startDates: [],
  tags: '',
}

const FORMATS = [
  { value: 'fysiek', label: 'In-persoon' },
  { value: 'online', label: 'Online' },
  { value: 'hybride', label: 'Hybride' },
]

export function CourseForm({
  categories,
  initial,
  courseId,
  showPartnerUltimateFeatures = false,
}: {
  categories: { id: number; name: string }[]
  initial?: Partial<CourseFormValues>
  courseId?: number
  showPartnerUltimateFeatures?: boolean
}) {
  const router = useRouter()
  const [v, setV] = React.useState<CourseFormValues>({ ...EMPTY, ...initial })
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const set = <K extends keyof CourseFormValues>(k: K, val: CourseFormValues[K]) => setV((s) => ({ ...s, [k]: val }))
  const toggleFormat = (f: string) => set('format', v.format.includes(f) ? v.format.filter((x) => x !== f) : [...v.format, f])
  const toggleLanguage = (language: string) => set('language', v.language.includes(language) ? v.language.filter((item) => item !== language) : [...v.language, language])
  const toggleMany = (key: 'targetAudience' | 'practical' | 'focus', value: string) =>
    set(key, v[key].includes(value) ? v[key].filter((item) => item !== value) : [...v[key], value])
  const addDate = () => set('startDates', [...v.startDates, { date: '', endDate: '', startTime: '', endTime: '', spotsAvailable: '' }])
  const updateDate = (index: number, key: keyof CourseFormValues['startDates'][number], value: string) =>
    set('startDates', v.startDates.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item))
  const removeDate = (index: number) => set('startDates', v.startDates.filter((_, itemIndex) => itemIndex !== index))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const url = courseId ? `/api/dashboard/courses/${courseId}` : '/api/dashboard/courses'
      const res = await fetch(url, {
        method: courseId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...v, coverImage: v.coverImage?.id ?? null }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Opslaan mislukt.')
      router.push('/dashboard/opleidingen')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis.')
      setLoading(false)
    }
  }

  const card: React.CSSProperties = { background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 28, display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 20 }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 720 }}>
      {error ? (
        <div style={{ marginBottom: 20, fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.6, color: 'var(--status-warning)', background: '#FBF1E6', border: '0.5px solid #E9D8C2', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
          {error}
        </div>
      ) : null}

      <div style={card}>
        <Input label="Titel" value={v.title} onChange={(e) => set('title', e.target.value)} required />
        <Input label="Slug (optioneel)" placeholder="wordt automatisch gegenereerd" value={v.slug} onChange={(e) => set('slug', e.target.value)} />
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Select
            label="Categorie"
            placeholder="Kies een categorie"
            value={v.category}
            onChange={(e) => set('category', e.target.value)}
            options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
          />
          <Select
            label="Status"
            value={v.status}
            onChange={(e) => set('status', e.target.value)}
            options={[
              { value: 'draft', label: 'Concept' },
              { value: 'published', label: 'Gepubliceerd' },
              { value: 'archived', label: 'Gearchiveerd' },
            ]}
          />
        </div>
        <div>
          <FieldLabel>Korte omschrijving</FieldLabel>
          <textarea value={v.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} maxLength={200} style={ta} />
        </div>
        <div>
          <FieldLabel>Volledige omschrijving</FieldLabel>
          <RichTextEditor
            value={v.description}
            onChange={(html) => set('description', html)}
            placeholder="Wat leert de deelnemer, voor wie is het bedoeld, hoe verloopt de dag?"
          />
        </div>
        <ImageUploadField
          label="Coverafbeelding"
          hint="Wordt getoond bovenaan de opleidingspagina en in de directory · max 5 MB"
          value={v.coverImage}
          onChange={(image) => set('coverImage', image)}
        />
      </div>

      <div style={card}>
        <Select
          label="Type opleiding"
          placeholder="Kies een type"
          value={v.courseType}
          onChange={(e) => set('courseType', e.target.value)}
          options={[
            { value: 'practice_training', label: 'Praktijktraining' },
            { value: 'online_course', label: 'Online cursus' },
            { value: 'live_course', label: 'Live cursus' },
            { value: 'coaching', label: 'Coachingsessie' },
            { value: 'workshop', label: 'Workshop' },
            { value: 'webinar', label: 'Webinar' },
            { value: 'event', label: 'Evenement' },
          ]}
        />
        <div>
          <FieldLabel>Lesvorm</FieldLabel>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FORMATS.map((f) => (
              <Tag key={f.value} as="button" active={v.format.includes(f.value)} onClick={() => toggleFormat(f.value)}>
                {f.label}
              </Tag>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>Taal</FieldLabel>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['nl', 'Nederlands'], ['fr', 'Frans'], ['en', 'Engels']].map(([key, label]) => (
              <Tag key={key} as="button" active={v.language.includes(key)} onClick={() => toggleLanguage(key)}>{label}</Tag>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>Niveau &amp; doelgroep</FieldLabel>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['beginner-friendly', 'Beginner friendly'], ['intermediate', 'Intermediate'], ['expert-advanced', 'Expert / Advanced'], ['professional-only', 'Professional only'], ['startende-ondernemer', 'Startende ondernemer']].map(([key, label]) => (
              <Tag key={key} as="button" active={v.targetAudience.includes(key)} onClick={() => toggleMany('targetAudience', key)}>{label}</Tag>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>Praktisch</FieldLabel>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['online', 'Online'], ['praktijkopleiding', 'Praktijkopleiding'], ['een-dag', '1-daagse'], ['meerdere-dagen', 'Meerdere dagen'], ['op-locatie', 'Op locatie'], ['kleine-groepen', 'Kleine groepen (<12)']].map(([key, label]) => (
              <Tag key={key} as="button" active={v.practical.includes(key)} onClick={() => toggleMany('practical', key)}>{label}</Tag>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>Focus &amp; filosofie</FieldLabel>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['huidverbeterend', 'Huidverbeterend'], ['medisch-esthetisch', 'Medisch-esthetisch'], ['holistisch', 'Holistisch'], ['ontspannend', 'Ontspannend'], ['cosmetisch', 'Cosmetisch'], ['therapeutisch', 'Therapeutisch'], ['energetisch', 'Energetisch']].map(([key, label]) => (
              <Tag key={key} as="button" active={v.focus.includes(key)} onClick={() => toggleMany('focus', key)}>{label}</Tag>
            ))}
          </div>
        </div>
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input label="Stad" value={v.city} onChange={(e) => set('city', e.target.value)} />
          <Select
            label="Niveau"
            placeholder="Kies een niveau"
            value={v.level}
            onChange={(e) => set('level', e.target.value)}
            options={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'gevorderd', label: 'Gevorderd' },
              { value: 'expert', label: 'Expert' },
              { value: 'all', label: 'Alle niveaus' },
            ]}
          />
        </div>
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'end' }}>
          <Input label="Maximum deelnemers" type="number" value={v.maximumParticipants} onChange={(e) => set('maximumParticipants', e.target.value)} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, height: 44, fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-body)' }}>
            <input type="checkbox" checked={v.privateOneToOne} onChange={(e) => set('privateOneToOne', e.target.checked)} />
            Privé / één-op-één
          </label>
        </div>
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Select label="Model meenemen" value={v.modelRequired} onChange={(e) => set('modelRequired', e.target.value)} options={[{ value: 'not_applicable', label: 'Niet van toepassing' }, { value: 'yes', label: 'Ja' }, { value: 'no', label: 'Nee' }]} />
          <Select label="Lunch voorzien" value={v.lunchProvided} onChange={(e) => set('lunchProvided', e.target.value)} options={[{ value: 'not_applicable', label: 'Niet van toepassing' }, { value: 'yes', label: 'Ja' }, { value: 'no', label: 'Nee' }]} />
        </div>
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input label="Duur (aantal)" type="number" value={v.durationValue} onChange={(e) => set('durationValue', e.target.value)} />
          <Select
            label="Eenheid"
            value={v.durationUnit}
            onChange={(e) => set('durationUnit', e.target.value)}
            options={[
              { value: 'hours', label: 'Uren' },
              { value: 'days', label: 'Dagen' },
              { value: 'weeks', label: 'Weken' },
              { value: 'months', label: 'Maanden' },
            ]}
          />
        </div>
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'end' }}>
          <Input label="Prijs (€)" type="number" value={v.priceAmount} onChange={(e) => set('priceAmount', e.target.value)} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, height: 44, fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-body)' }}>
            <input type="checkbox" checked={v.priceOnRequest} onChange={(e) => set('priceOnRequest', e.target.checked)} />
            Prijs op aanvraag
          </label>
        </div>
        <Input label="Inschrijf-URL (extern)" placeholder="https://..." value={v.externalUrl} onChange={(e) => set('externalUrl', e.target.value)} required />
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-body)' }}>
          <input type="checkbox" checked={v.certificate} onChange={(e) => set('certificate', e.target.checked)} />
          Certificaat inbegrepen
        </label>
        <Input label="Trefwoorden (komma-gescheiden)" value={v.tags} onChange={(e) => set('tags', e.target.value)} />
        {showPartnerUltimateFeatures ? (
          <div style={{ borderTop: '1px solid var(--border-hairline)', paddingTop: 18, display: 'grid', gap: 14 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text-brand)' }}>Partner Ultimate</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-body)' }}>
              <input type="checkbox" checked={v.productLaunchHighlighted} onChange={(e) => set('productLaunchHighlighted', e.target.checked)} />
              Productlancering extra uitlichten
            </label>
            <Input label="Co-branding partner" placeholder="Naam van het samenwerkende merk" value={v.coBrandPartner} onChange={(e) => set('coBrandPartner', e.target.value)} />
          </div>
        ) : null}
      </div>

      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text-brand)' }}>Data en tijdstippen</div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)', marginTop: 4 }}>Voeg alle geplande lesmomenten toe.</div>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={addDate}>Datum toevoegen</Button>
        </div>
        {v.startDates.map((item, index) => (
          <div key={index} style={{ border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)', padding: 16, display: 'grid', gap: 12 }}>
            <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Startdatum" type="date" value={item.date} onChange={(e) => updateDate(index, 'date', e.target.value)} />
              <Input label="Einddatum" type="date" value={item.endDate} onChange={(e) => updateDate(index, 'endDate', e.target.value)} />
              <Input label="Starttijd" type="time" value={item.startTime} onChange={(e) => updateDate(index, 'startTime', e.target.value)} />
              <Input label="Eindtijd" type="time" value={item.endTime} onChange={(e) => updateDate(index, 'endTime', e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'end' }}>
              <div style={{ flex: 1 }}><Input label="Beschikbare plaatsen" type="number" value={item.spotsAvailable} onChange={(e) => updateDate(index, 'spotsAvailable', e.target.value)} /></div>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeDate(index)}>Verwijderen</Button>
            </div>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text-brand)' }}>Contact en sociale kanalen</div>
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input label="Contact e-mail" type="email" value={v.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
          <Input label="Website" value={v.contactWebsite} onChange={(e) => set('contactWebsite', e.target.value)} />
          <Input label="Instagram" value={v.instagram} onChange={(e) => set('instagram', e.target.value)} />
          <Input label="Facebook" value={v.facebook} onChange={(e) => set('facebook', e.target.value)} />
          <Input label="TikTok" value={v.tiktok} onChange={(e) => set('tiktok', e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Opslaan…' : courseId ? 'Wijzigingen opslaan' : 'Opleiding aanmaken'}
        </Button>
        <a href="/dashboard/opleidingen" className="bl-textlink">
          Annuleren
        </a>
      </div>
    </form>
  )
}

const ta: React.CSSProperties = {
  width: '100%',
  minHeight: 80,
  border: '0.5px solid var(--neutral-200)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--surface-card)',
  padding: '12px 16px',
  fontFamily: 'var(--font-ui)',
  fontWeight: 400,
  fontSize: 14,
  color: 'var(--text-strong)',
  lineHeight: 1.6,
  resize: 'vertical',
  outline: 'none',
}
