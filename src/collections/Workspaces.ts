import type { Access, CollectionConfig } from 'payload'
import { seoFields } from '@/fields/seo'
import { isEntitled } from '@/lib/entitlement'
import { assertCanPublish } from '@/lib/publications'
import {
  ACCESS_OPTIONS,
  ALL_FACILITIES,
  AVAILABLE_FROM,
  DAYPARTS,
  DAYS,
  DEPOSIT_OPTIONS,
  FACILITY_UNITS,
  RENT_FORMULAS,
  RENT_UNITS,
  SALON_TYPES,
  USAGE_OPTIONS,
  WORKPLACE_TYPES,
  WORKSPACE_ACTIVITIES,
  WORKSPACE_SECTORS,
  deriveAvailability,
  sectorsForActivities,
} from '@/lib/workspace-options'

/**
 * Werkruimtes: a salon chair, treatment room or practice to rent (spec:
 * notes/blissify uitbreiding - OFF-2.pdf, "Werkplek verhuren"; inspiration
 * flexsalon.be). Owned by a trainer or brand profile like courses and
 * vacancies; publishing is limited per plan (lib/publications).
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
const FEATURE_OPTIONS = ALL_FACILITIES.filter((f) => !f.priced)

export const Workspaces: CollectionConfig = {
  slug: 'workspaces',
  labels: { singular: 'Werkruimte', plural: 'Werkruimtes' },
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
        // Filter values follow what the landlord filled in.
        if (Array.isArray(data.activities)) data.sectors = sectorsForActivities(data.activities)
        if (Array.isArray(data.schedule)) {
          const { days, parts } = deriveAvailability(data.schedule)
          data.availableDays = days
          data.dayparts = parts
        }

        const user = req.user as { id: number; role?: string; subscriptionStatus?: string; subscriptionExpiresAt?: string; subscriptionTier?: string; brandTier?: string } | null
        if (!user || user.role === 'admin') return data
        const isPublishing = data.status === 'published' && (operation === 'create' || originalDoc?.status !== 'published')
        if (isPublishing) {
          if (!isEntitled(user)) {
            throw new Error('Je kunt pas werkruimtes publiceren zodra je abonnement actief is. Rond je betaling af via je dashboard.')
          }
          await assertCanPublish(req.payload as never, user, 'workspaces')
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Titel van de advertentie' },
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
    { name: 'companyName', type: 'text', required: true, label: 'Salonnaam / bedrijfsnaam' },
    { name: 'country', type: 'select', required: true, defaultValue: 'be', options: [{ label: 'België', value: 'be' }, { label: 'Nederland', value: 'nl' }], label: 'Land' },
    { name: 'city', type: 'text', required: true, label: 'Stad / gemeente' },
    { name: 'address', type: 'text', label: 'Adres (niet openbaar)' },
    { name: 'website', type: 'text', label: 'Website' },

    // 2-4. Type salon, werkplek en gebruik
    { name: 'salonTypes', type: 'select', hasMany: true, options: opts(SALON_TYPES), label: 'Type salon / sector' },
    { name: 'salonTypeOther', type: 'text', label: 'Ander type salon' },
    { name: 'workplaceTypes', type: 'select', hasMany: true, required: true, options: opts(WORKPLACE_TYPES), label: 'Type werkplek' },
    { name: 'workplaceTypeOther', type: 'text', label: 'Ander type werkplek' },
    { name: 'usage', type: 'select', options: opts(USAGE_OPTIONS), label: 'Gebruik van de werkplek' },
    { name: 'access', type: 'select', options: opts(ACCESS_OPTIONS), label: 'Toegang' },

    // 5. Huurprijs
    { name: 'rentFormula', type: 'select', defaultValue: 'in-overleg', options: opts(RENT_FORMULAS), label: 'Huurformule' },
    { name: 'rentAmount', type: 'number', min: 0, label: 'Huurprijs (€)' },
    { name: 'rentUnit', type: 'select', options: opts(RENT_UNITS), label: 'Prijs per' },
    { name: 'rentPercentage', type: 'number', min: 0, max: 100, label: 'Percentage van de omzet' },
    { name: 'deposit', type: 'select', options: opts(DEPOSIT_OPTIONS), label: 'Waarborg' },
    { name: 'depositAmount', type: 'number', min: 0, label: 'Waarborgbedrag (€)' },

    // 6. Voorzieningen & faciliteiten
    { name: 'features', type: 'select', hasMany: true, options: opts(FEATURE_OPTIONS), label: 'Kenmerken en voorwaarden' },
    {
      name: 'facilities',
      type: 'array',
      label: 'Voorzieningen (inbegrepen of tegen meerprijs)',
      fields: [
        { name: 'key', type: 'text', required: true, admin: { description: 'Sleutel uit de lijst, of "custom" voor een eigen voorziening.' } },
        { name: 'name', type: 'text', admin: { description: 'Alleen bij een eigen voorziening.' } },
        { name: 'mode', type: 'select', required: true, options: [{ label: 'Inbegrepen in huurprijs', value: 'inbegrepen' }, { label: 'Tegen meerprijs', value: 'meerprijs' }] },
        { name: 'price', type: 'number', min: 0 },
        { name: 'unit', type: 'select', options: opts(FACILITY_UNITS) },
      ],
    },
    { name: 'facilitiesNote', type: 'textarea', label: 'Aanvullende informatie over voorzieningen en meerprijzen' },

    // 7. Geschikt voor welke activiteiten?
    { name: 'activities', type: 'select', hasMany: true, options: opts(WORKSPACE_ACTIVITIES), label: 'Geschikt voor' },
    { name: 'activityOther', type: 'text', label: 'Andere activiteit' },
    { name: 'sectors', type: 'select', hasMany: true, options: opts(WORKSPACE_SECTORS), admin: { readOnly: true, description: 'Volgt automatisch uit de activiteiten.' } },

    // 8. Beschikbaarheid
    { name: 'availableFrom', type: 'select', defaultValue: 'onmiddellijk', options: opts(AVAILABLE_FROM), label: 'Beschikbaar vanaf' },
    { name: 'availableDate', type: 'date', label: 'Beschikbaar vanaf datum' },
    {
      name: 'schedule',
      type: 'array',
      label: 'Beschikbare dagen en uren',
      admin: { description: 'Per dag kunnen meerdere tijdsblokken worden toegevoegd.' },
      fields: [
        { name: 'day', type: 'select', required: true, options: opts(DAYS) },
        { name: 'from', type: 'text', required: true, admin: { placeholder: '09:00' } },
        { name: 'to', type: 'text', required: true, admin: { placeholder: '18:00' } },
      ],
    },
    { name: 'otherTimesNegotiable', type: 'checkbox', defaultValue: false, label: 'Andere dagen of uren zijn bespreekbaar' },
    { name: 'availableDays', type: 'select', hasMany: true, options: opts(DAYS), admin: { readOnly: true } },
    { name: 'dayparts', type: 'select', hasMany: true, options: opts(DAYPARTS), admin: { readOnly: true } },

    // 9-10. Foto's en beschrijving
    { name: 'coverImage', type: 'upload', relationTo: 'media', label: 'Hoofdfoto' },
    { name: 'gallery', type: 'array', label: "Foto's", fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }] },
    { name: 'description', type: 'textarea', label: 'Beschrijving' },

    // 11. Contactgegevens (never public: requests go through Blissify by email)
    { name: 'contactName', type: 'text', required: true, label: 'Contactpersoon' },
    { name: 'contactEmail', type: 'email', required: true, label: 'E-mailadres' },
    { name: 'contactPhone', type: 'text', label: 'Telefoonnummer' },

    ...seoFields,
  ],
}
