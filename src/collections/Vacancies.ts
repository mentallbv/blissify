import type { Access, CollectionConfig } from 'payload'
import { seoFields } from '@/fields/seo'
import { isEntitled } from '@/lib/entitlement'
import { assertCanPublish } from '@/lib/publications'
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
  sectorsFor,
} from '@/lib/vacancy-options'

/**
 * Vacatures & samenwerkingen (spec: notes/blissify uitbreiding - OFF-2.pdf).
 * Owned by a trainer (salon / professional) or brand profile, like courses.
 * Publishing is limited per plan (lib/publications); publications never
 * expire, the owner switches them on and off.
 */
const ownerWhere = (user: { id: number | string; role?: string }) =>
  user.role === 'brand' ? { 'brand.owner': { equals: user.id } } : { 'trainer.owner': { equals: user.id } }

const readAccess: Access = ({ req }) => {
  const user = req.user as { id: number; role?: string } | null
  if (!user) return { status: { equals: 'published' } } as never
  if (user.role === 'admin') return true
  return { or: [ownerWhere(user), { status: { equals: 'published' } }] } as never
}

const ownerAccess: Access = ({ req }) => {
  const user = req.user as { id: number; role?: string } | null
  if (!user) return false
  if (user.role === 'admin') return true
  if (user.role === 'trainer' || user.role === 'brand') return ownerWhere(user) as never
  return false
}

const opts = (list: { value: string; label: string }[]) => list.map((o) => ({ label: o.label, value: o.value }))

export const Vacancies: CollectionConfig = {
  slug: 'vacancies',
  labels: { singular: 'Vacature', plural: 'Vacatures' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'companyName', 'city', 'status', 'updatedAt'],
    group: 'Inhoud',
  },
  access: {
    read: readAccess,
    create: ({ req }) => {
      const role = (req.user as { role?: string } | null)?.role
      return role === 'admin' || role === 'trainer' || role === 'brand'
    },
    update: ownerAccess,
    delete: ownerAccess,
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        // Sector filter values follow the chosen functions.
        if (Array.isArray(data.functions)) data.sectors = sectorsFor(data.functions)

        const user = req.user as { id: number; role?: string; subscriptionStatus?: string; subscriptionExpiresAt?: string; subscriptionTier?: string; brandTier?: string } | null
        if (!user || user.role === 'admin') return data
        const isPublishing = data.status === 'published' && (operation === 'create' || originalDoc?.status !== 'published')
        if (isPublishing) {
          if (!isEntitled(user)) {
            throw new Error('Je kunt pas vacatures publiceren zodra je abonnement actief is. Rond je betaling af via je dashboard.')
          }
          await assertCanPublish(req.payload as never, user, 'vacancies')
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Titel van de vacature' },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, admin: { position: 'sidebar' } },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Offline', value: 'draft' },
        { label: 'Gepubliceerd', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'trainer', type: 'relationship', relationTo: 'trainers', admin: { position: 'sidebar' } },
    { name: 'brand', type: 'relationship', relationTo: 'brands', admin: { position: 'sidebar' } },

    // 1. Algemene informatie
    { name: 'companyName', type: 'text', required: true, label: 'Bedrijfsnaam / salonnaam' },
    { name: 'country', type: 'select', required: true, defaultValue: 'be', options: [{ label: 'België', value: 'be' }, { label: 'Nederland', value: 'nl' }], label: 'Land' },
    { name: 'city', type: 'text', required: true, label: 'Stad / gemeente' },
    { name: 'address', type: 'text', label: 'Adres (niet openbaar)' },
    { name: 'website', type: 'text', label: 'Website' },

    // 2-3. Type samenwerking en functie
    { name: 'types', type: 'select', hasMany: true, required: true, options: opts(VACANCY_TYPES), label: 'Type samenwerking' },
    { name: 'typeOther', type: 'text', label: 'Andere samenwerking' },
    { name: 'functions', type: 'select', hasMany: true, required: true, options: opts(VACANCY_FUNCTIONS), label: 'Gezochte functie' },
    { name: 'functionOther', type: 'text', label: 'Andere functie' },
    { name: 'sectors', type: 'select', hasMany: true, options: opts(VACANCY_SECTORS), admin: { readOnly: true, description: 'Volgt automatisch uit de gekozen functies.' } },

    // 4. Werkregime & beschikbaarheid
    { name: 'regimes', type: 'select', hasMany: true, options: opts(VACANCY_REGIMES), label: 'Werkregime' },
    { name: 'workdays', type: 'select', hasMany: true, options: opts(WEEKDAYS), label: 'Gewenste werkdagen' },
    { name: 'regimeNote', type: 'textarea', label: 'Aanvullende informatie over het werkregime' },
    { name: 'start', type: 'select', defaultValue: 'in-overleg', options: opts(START_OPTIONS), label: 'Start' },
    { name: 'startDate', type: 'date', label: 'Startdatum' },
    { name: 'startNote', type: 'textarea', label: 'Aanvullende informatie over de startdatum' },

    // 5. Vergoeding
    { name: 'compensationTypes', type: 'select', hasMany: true, options: opts(COMPENSATION_TYPES), label: 'Vergoeding' },
    { name: 'compensationAmount', type: 'text', label: 'Bedrag of percentage' },
    { name: 'compensationNote', type: 'textarea', label: 'Aanvullende informatie over de vergoeding' },

    // 6-7. Vereisten en aanbod
    { name: 'experience', type: 'select', options: opts(EXPERIENCE_LEVELS), label: 'Ervaring' },
    { name: 'diplomaNote', type: 'textarea', label: 'Opleiding / diploma / certificaten' },
    { name: 'requirementsNote', type: 'textarea', label: 'Aanvullende vereisten' },
    { name: 'offers', type: 'select', hasMany: true, options: opts(VACANCY_OFFERS), label: 'Wat wordt aangeboden?' },
    { name: 'offerOther', type: 'text', label: 'Ander aanbod' },

    // 8. Beschrijving
    { name: 'aboutCompany', type: 'textarea', label: 'Over het salon / bedrijf' },
    { name: 'whoWeSeek', type: 'textarea', label: 'Wie zoeken jullie?' },
    { name: 'whatWeOffer', type: 'textarea', label: 'Wat bieden jullie aan?' },

    // 9. Foto's
    { name: 'logo', type: 'upload', relationTo: 'media', label: 'Bedrijfslogo' },
    { name: 'coverImage', type: 'upload', relationTo: 'media', label: 'Hoofdfoto' },
    { name: 'gallery', type: 'array', label: "Foto's", fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }] },

    // 10. Solliciteren: by email (a popup with mail options, like creativeskills.be)
    // or a link to the poster's own jobs page. Blissify stores nothing about applicants.
    {
      name: 'applyMethod',
      type: 'select',
      required: true,
      defaultValue: 'email',
      options: [
        { label: 'Via e-mail', value: 'email' },
        { label: 'Via een link', value: 'link' },
      ],
      label: 'Hoe solliciteren?',
    },
    { name: 'applyUrl', type: 'text', label: 'Link om te solliciteren' },
    // Contact
    { name: 'contactName', type: 'text', required: true, label: 'Contactpersoon' },
    { name: 'contactEmail', type: 'email', required: true, label: 'E-mailadres' },
    { name: 'contactPhone', type: 'text', label: 'Telefoonnummer' },

    ...seoFields,
  ],
}
