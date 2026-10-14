/**
 * "Certificaten, diploma's & erkenningen" (client round 2, section 6): one
 * definition shared by the course form, the filter, the course page and the
 * collection, so what opleiders fill in always matches what visitors filter on.
 */

export const CERTIFICATION_OPTIONS = [
  { value: 'certificaat', label: 'Certificaat' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'mbo-diploma', label: 'Erkend mbo-diploma (Nederland)' },
  { value: 'branche-diploma', label: 'Branche-erkend diploma (Nederland)' },
  { value: 'geaccrediteerde-bijscholing', label: 'Geaccrediteerde bijscholing' },
  { value: 'geen', label: 'Geen certificaat, diploma of accreditatie' },
] as const

export type CertificationValue = (typeof CERTIFICATION_OPTIONS)[number]['value']

export const CERTIFICATION_VALUES = new Set<string>(CERTIFICATION_OPTIONS.map((o) => o.value))

export const CERTIFICATION_LABEL: Record<string, string> = Object.fromEntries(CERTIFICATION_OPTIONS.map((o) => [o.value, o.label]))

/** "Geen" cannot be combined with the other choices. */
export const NO_CERTIFICATION = 'geen'

export type CertificationDetails = {
  mboDiploma: { name: string; crebo: string; institution: string; url: string }
  brancheDiploma: { name: string; organisation: string; url: string }
  accreditedTraining: { authority: string; register: string; amount: string; amountUnit: 'points' | 'hours'; number: string; url: string }
}

export const EMPTY_CERTIFICATION_DETAILS: CertificationDetails = {
  mboDiploma: { name: '', crebo: '', institution: '', url: '' },
  brancheDiploma: { name: '', organisation: '', url: '' },
  accreditedTraining: { authority: '', register: '', amount: '', amountUnit: 'points', number: '', url: '' },
}

/** Detail fields per choice; `optional` ones may stay empty. */
export const CERTIFICATION_FIELDS: {
  type: CertificationValue
  group: keyof CertificationDetails
  fields: { key: string; label: string; optional?: boolean; kind?: 'text' | 'url' | 'number' }[]
}[] = [
  {
    type: 'mbo-diploma',
    group: 'mboDiploma',
    fields: [
      { key: 'name', label: 'Naam diploma' },
      { key: 'crebo', label: 'CREBO-nummer' },
      { key: 'institution', label: 'Naam onderwijsinstelling' },
      { key: 'url', label: 'Link naar erkenning', optional: true, kind: 'url' },
    ],
  },
  {
    type: 'branche-diploma',
    group: 'brancheDiploma',
    fields: [
      { key: 'name', label: 'Naam diploma' },
      { key: 'organisation', label: 'Erkennende brancheorganisatie' },
      { key: 'url', label: 'Link naar erkenning', optional: true, kind: 'url' },
    ],
  },
  {
    type: 'geaccrediteerde-bijscholing',
    group: 'accreditedTraining',
    fields: [
      { key: 'authority', label: 'Accrediterende instantie' },
      { key: 'register', label: 'Beroepsregister / doelgroep' },
      { key: 'amount', label: 'Aantal accreditatiepunten of -uren', kind: 'number' },
      { key: 'number', label: 'Accreditatienummer', optional: true },
      { key: 'url', label: 'Link naar accreditatie', optional: true, kind: 'url' },
    ],
  },
]

/** Toggle a choice, keeping "Geen" exclusive. */
export function toggleCertification(current: string[], value: string): string[] {
  if (current.includes(value)) return current.filter((v) => v !== value)
  if (value === NO_CERTIFICATION) return [NO_CERTIFICATION]
  return [...current.filter((v) => v !== NO_CERTIFICATION), value]
}

/** Missing required detail fields, as `group.key` → label (for form validation). */
export function missingCertificationFields(types: string[], details: CertificationDetails): Record<string, string> {
  const missing: Record<string, string> = {}
  for (const def of CERTIFICATION_FIELDS) {
    if (!types.includes(def.type)) continue
    const group = details[def.group] as Record<string, string>
    for (const f of def.fields) {
      if (!f.optional && !String(group[f.key] ?? '').trim()) missing[`${def.group}.${f.key}`] = `Vul "${f.label}" in.`
    }
  }
  return missing
}
