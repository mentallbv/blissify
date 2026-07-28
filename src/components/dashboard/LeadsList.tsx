'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

export type LeadRow = {
  id: string
  name: string
  email: string
  message: string | null
  courseTitle: string
  read: boolean
  created_at: string
}

type ResponseTemplate = {
  name: string
  subject: string
  body: string
  id?: string | null
}

export function LeadsList({
  leads,
  canUseTemplates,
  initialTemplates,
}: {
  leads: LeadRow[]
  canUseTemplates: boolean
  initialTemplates: ResponseTemplate[]
}) {
  const router = useRouter()
  const [busy, setBusy] = React.useState<string | null>(null)
  const [templates, setTemplates] = React.useState<ResponseTemplate[]>(initialTemplates)
  const [editing, setEditing] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [notice, setNotice] = React.useState('')

  async function markRead(id: string) {
    setBusy(id)
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ read: true }),
    }).catch(() => {})
    setBusy(null)
    router.refresh()
  }

  function updateTemplate(index: number, key: 'name' | 'subject' | 'body', value: string) {
    setTemplates((current) => current.map((template, i) => (i === index ? { ...template, [key]: value } : template)))
  }

  async function saveTemplates() {
    setSaving(true)
    setNotice('')
    const response = await fetch('/api/response-templates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ templates }),
    }).catch(() => null)
    const result = response ? await response.json().catch(() => ({})) : {}
    setSaving(false)
    if (!response?.ok) {
      setNotice(result.error || 'Opslaan mislukt.')
      return
    }
    setTemplates(result.templates || templates)
    setEditing(false)
    setNotice('Sjablonen opgeslagen.')
  }

  function replyHref(lead: LeadRow, template: ResponseTemplate) {
    const replace = (value: string) =>
      value
        .replaceAll('{{naam}}', lead.name)
        .replaceAll('{{opleiding}}', lead.courseTitle)
    return `mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent(replace(template.subject))}&body=${encodeURIComponent(replace(template.body))}`
  }

  const templatePanel = canUseTemplates ? (
    <section style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 'var(--fw-display-light)', margin: 0, color: 'var(--text-strong)' }}>
            Antwoordsjablonen
          </h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)', margin: '4px 0 0' }}>
            Premium · gebruik <code>{'{{naam}}'}</code> en <code>{'{{opleiding}}'}</code> als persoonlijke velden.
          </p>
        </div>
        <button type="button" className="bl-textlink" onClick={() => setEditing((value) => !value)}>
          {editing ? 'Sluiten' : 'Beheren'}
        </button>
      </div>
      {editing ? (
        <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
          {templates.map((template, index) => (
            <div key={template.id || index} style={{ border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)', padding: 14, display: 'grid', gap: 10 }}>
              <input className="bl-input" aria-label={`Naam sjabloon ${index + 1}`} placeholder="Naam, bv. Eerste reactie" value={template.name} onChange={(event) => updateTemplate(index, 'name', event.target.value)} />
              <input className="bl-input" aria-label={`Onderwerp sjabloon ${index + 1}`} placeholder="Onderwerp" value={template.subject} onChange={(event) => updateTemplate(index, 'subject', event.target.value)} />
              <textarea className="bl-input" aria-label={`Bericht sjabloon ${index + 1}`} placeholder="Bericht" rows={5} value={template.body} onChange={(event) => updateTemplate(index, 'body', event.target.value)} />
              <button type="button" className="bl-textlink" style={{ justifySelf: 'start', color: 'var(--text-meta)' }} onClick={() => setTemplates((current) => current.filter((_, i) => i !== index))}>
                Verwijder sjabloon
              </button>
            </div>
          ))}
          {templates.length < 10 ? (
            <button type="button" className="bl-textlink" style={{ justifySelf: 'start' }} onClick={() => setTemplates((current) => [...current, { name: '', subject: '', body: '' }])}>
              + Sjabloon toevoegen
            </button>
          ) : null}
          <button type="button" className="bl-btn bl-btn--primary" disabled={saving} onClick={saveTemplates} style={{ justifySelf: 'start' }}>
            {saving ? 'Opslaan…' : 'Sjablonen opslaan'}
          </button>
        </div>
      ) : null}
      {notice ? <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)', margin: '10px 0 0' }}>{notice}</p> : null}
    </section>
  ) : null

  if (leads.length === 0) {
    return (
      <>
        {templatePanel}
        <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 40, textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-meta)', margin: 0 }}>
            Nog geen aanvragen. Zodra cursisten informatie aanvragen, verschijnen ze hier.
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      {templatePanel}
      <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        {leads.map((l, i) => (
          <div key={l.id} style={{ display: 'flex', gap: 16, padding: '18px 20px', borderBottom: i < leads.length - 1 ? '0.5px solid var(--border-hairline)' : 'none', alignItems: 'flex-start' }}>
          <span style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--surface-dark)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 16, color: 'var(--blissify-chalk)', flex: 'none' }}>
            {l.name[0]}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 14, color: 'var(--text-strong)' }}>{l.name}</span>
              {!l.read ? <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-accent)' }}>Nieuw</span> : null}
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-body)' }}>
              {l.email} · {l.courseTitle}
            </div>
            {l.message ? <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.6, color: 'var(--text-body)', margin: '8px 0 0' }}>{l.message}</p> : null}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flex: 'none' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)' }}>{new Date(l.created_at).toLocaleDateString('nl-BE')}</span>
            {canUseTemplates && templates.length ? (
              <select
                aria-label={`Beantwoord aanvraag van ${l.name}`}
                defaultValue=""
                onChange={(event) => {
                  const template = templates[Number(event.target.value)]
                  if (template) window.location.href = replyHref(l, template)
                  event.target.value = ''
                }}
                style={{ maxWidth: 180, fontFamily: 'var(--font-ui)', fontSize: 12, border: '0.5px solid var(--border-hairline)', borderRadius: 6, padding: '6px 8px', background: 'var(--surface-page)', color: 'var(--text-body)' }}
              >
                <option value="" disabled>Antwoord met sjabloon…</option>
                {templates.map((template, templateIndex) => <option key={template.id || templateIndex} value={templateIndex}>{template.name}</option>)}
              </select>
            ) : (
              <a className="bl-textlink" style={{ fontSize: 12 }} href={`mailto:${encodeURIComponent(l.email)}`}>Beantwoorden</a>
            )}
            {!l.read ? (
              <button type="button" onClick={() => markRead(l.id)} disabled={busy === l.id} className="bl-textlink" style={{ fontSize: 12 }}>
                {busy === l.id ? '…' : 'Markeer als gelezen'}
              </button>
            ) : null}
          </div>
          </div>
        ))}
      </div>
    </>
  )
}
