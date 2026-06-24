import type { CollectionConfig, Access } from 'payload'
import { seoFields } from '@/fields/seo'
import { getBrandIdForUser, getTrainerIdForUser } from '@/access'

const TIER_LIMITS: Record<string, number> = {
  basis: 1,
  medium: 5,
  premium: Infinity,
}

const readAccess: Access = ({ req }) => {
  const user = req.user as any
  if (!user) return { status: { equals: 'published' } } as any
  if (user.role === 'admin') return true
  if (user.role === 'trainer') {
    return {
      or: [
        { 'trainer.owner': { equals: user.id } },
        { status: { equals: 'published' } },
      ],
    } as any
  }
  if (user.role === 'brand') {
    return {
      or: [
        { 'brand.owner': { equals: user.id } },
        { status: { equals: 'published' } },
      ],
    } as any
  }
  return { status: { equals: 'published' } } as any
}

const updateAccess: Access = ({ req }) => {
  const user = req.user as any
  if (!user) return false
  if (user.role === 'admin') return true
  if (user.role === 'trainer') return { 'trainer.owner': { equals: user.id } } as any
  if (user.role === 'brand') return { 'brand.owner': { equals: user.id } } as any
  return false
}

const deleteAccess: Access = ({ req }) => {
  const user = req.user as any
  if (!user) return false
  if (user.role === 'admin') return true
  if (user.role === 'trainer') return { 'trainer.owner': { equals: user.id } } as any
  if (user.role === 'brand') return { 'brand.owner': { equals: user.id } } as any
  return false
}

export const Courses: CollectionConfig = {
  slug: 'courses',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'trainer', 'brand', 'category', 'status', 'featured'],
    group: 'Inhoud',
  },
  access: {
    read: readAccess,
    create: ({ req }) => {
      const user = req.user as any
      if (!user) return false
      return ['admin', 'trainer', 'brand'].includes(user.role)
    },
    update: updateAccess,
    delete: deleteAccess,
  },

  hooks: {
    beforeChange: [
      async ({ data, operation, req, originalDoc }) => {
        const user = req.user as any
        if (!user || user.role === 'admin') return data

        // ── Ownership guard on update ────────────────────────────────────────
        if (operation === 'update' && originalDoc) {
          if (user.role === 'trainer') {
            const trainerId = await getTrainerIdForUser(req)
            const courseTrainerId =
              typeof originalDoc.trainer === 'object'
                ? originalDoc.trainer?.id
                : originalDoc.trainer
            if (trainerId && courseTrainerId && String(courseTrainerId) !== String(trainerId)) {
              throw new Error('Je hebt geen toegang om deze cursus te bewerken.')
            }
          }
          if (user.role === 'brand') {
            const brandId = await getBrandIdForUser(req)
            const courseBrandId =
              typeof originalDoc.brand === 'object'
                ? originalDoc.brand?.id
                : originalDoc.brand
            if (brandId && courseBrandId && String(courseBrandId) !== String(brandId)) {
              throw new Error('Je hebt geen toegang om deze cursus te bewerken.')
            }
          }
        }

        // ── Subscription tier limit ──────────────────────────────────────────
        const isPublishing =
          data.status === 'published' &&
          (operation === 'create' || originalDoc?.status !== 'published')

        if (isPublishing) {
          const tier = user.subscriptionTier || 'basis'
          const limit = TIER_LIMITS[tier] ?? 1

          if (limit !== Infinity) {
            let ownerWhere: Record<string, any> = {}
            if (user.role === 'trainer') {
              const trainerId = await getTrainerIdForUser(req)
              if (trainerId) ownerWhere = { trainer: { equals: trainerId } }
            } else if (user.role === 'brand') {
              const brandId = await getBrandIdForUser(req)
              if (brandId) ownerWhere = { brand: { equals: brandId } }
            }

            const { totalDocs } = await req.payload.find({
              collection: 'courses' as any,
              where: { and: [{ status: { equals: 'published' } }, ownerWhere] },
              limit: 0,
              depth: 0,
            })

            if (totalDocs >= limit) {
              const noun = limit === 1 ? 'actieve cursus' : 'actieve cursussen'
              throw new Error(
                `Je ${tier}-abonnement laat maximaal ${limit} ${noun} toe. ` +
                `Archiveer een bestaande cursus of upgrade je abonnement.`
              )
            }
          }
        }

        return data
      },
    ],
  },

  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Concept', value: 'draft' },
        { label: 'Gepubliceerd', value: 'published' },
        { label: 'Gearchiveerd', value: 'archived' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Uitgelicht in de directory' },
    },
    {
      name: 'featuredPosition',
      type: 'select',
      options: [
        { label: 'Bovenaan directory', value: 'top' },
        { label: 'Permanent bovenaan (Premium)', value: 'permanent_top' },
      ],
      admin: { position: 'sidebar', condition: (data) => data.featured },
    },
    {
      name: 'trainer',
      type: 'relationship',
      relationTo: 'trainers' as any,
      admin: { description: 'Trainer die de opleiding geeft' },
    },
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands' as any,
      admin: { description: 'Brand die de opleiding publiceert' },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories' as any,
      required: true,
      index: true,
    },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    {
      name: 'shortDescription',
      type: 'textarea',
      required: true,
      admin: { description: 'Korte samenvatting (max 200 tekens)' },
    },
    { name: 'description', type: 'richText', required: true },
    {
      name: 'format',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Online', value: 'online' },
        { label: 'Fysiek', value: 'fysiek' },
        { label: 'Hybride', value: 'hybride' },
      ],
    },
    {
      name: 'location',
      type: 'group',
      admin: {
        condition: (data) =>
          data.format?.includes('fysiek') || data.format?.includes('hybride'),
      },
      fields: [
        { name: 'address', type: 'text' },
        { name: 'city', type: 'text', index: true },
        { name: 'province', type: 'text' },
        { name: 'postcode', type: 'text' },
      ],
    },
    {
      name: 'duration',
      type: 'group',
      fields: [
        { name: 'value', type: 'number' },
        {
          name: 'unit',
          type: 'select',
          options: [
            { label: 'Uren', value: 'hours' },
            { label: 'Dagen', value: 'days' },
            { label: 'Weken', value: 'weeks' },
            { label: 'Maanden', value: 'months' },
          ],
        },
      ],
    },
    {
      name: 'price',
      type: 'group',
      fields: [
        { name: 'amount', type: 'number' },
        {
          name: 'currency',
          type: 'select',
          defaultValue: 'EUR',
          options: [{ label: 'EUR', value: 'EUR' }],
        },
        { name: 'isFree', type: 'checkbox', defaultValue: false },
        { name: 'priceOnRequest', type: 'checkbox', defaultValue: false, label: 'Prijs op aanvraag' },
      ],
    },
    {
      name: 'language',
      type: 'select',
      hasMany: true,
      defaultValue: ['nl'],
      options: [
        { label: 'Nederlands', value: 'nl' },
        { label: 'Frans', value: 'fr' },
        { label: 'Engels', value: 'en' },
      ],
    },
    {
      name: 'level',
      type: 'select',
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Gevorderd', value: 'gevorderd' },
        { label: 'Expert', value: 'expert' },
        { label: 'Alle niveaus', value: 'all' },
      ],
    },
    { name: 'certificate', type: 'checkbox', defaultValue: false, label: 'Certificaat uitgereikt' },
    { name: 'accreditation', type: 'text', label: 'Accreditatie / erkenning' },
    {
      name: 'externalUrl',
      type: 'text',
      required: true,
      label: 'Externe inschrijvingslink',
      admin: { description: 'URL naar de inschrijvingspagina op de externe website' },
    },
    {
      name: 'startDates',
      type: 'array',
      label: 'Startdata',
      fields: [
        { name: 'date', type: 'date', required: true },
        { name: 'spotsAvailable', type: 'number' },
      ],
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: { description: 'Vrije trefwoorden voor zoeken' },
    },
    ...seoFields,
  ],
  defaultSort: '-createdAt',
}
