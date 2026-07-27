import type { CollectionConfig, Access } from 'payload'
import { seoFields } from '@/fields/seo'
import { getBrandIdForUser, getTrainerIdForUser } from '@/access'

// Opleider (trainer) active-course limits.
const TIER_LIMITS: Record<string, number> = {
  basis: 1,
  medium: 5,
  premium: Infinity,
}

// Merk & Leverancier (brand) active-course limits. Partner Listing cannot
// publish any courses at all (hard gate, not a low limit).
const BRAND_LIMITS: Record<string, number> = {
  partner_listing: 0,
  partner_professional: 10,
  partner_premium: Infinity,
}

/** Active-course limit for a user, based on account type + tier. */
function courseLimitFor(user: { role?: string; subscriptionTier?: string; brandTier?: string }): number {
  if (user.role === 'brand') return BRAND_LIMITS[user.brandTier || 'partner_listing'] ?? 0
  return TIER_LIMITS[user.subscriptionTier || 'basis'] ?? 1
}

/**
 * Registration mode ("in-platform inschrijving") is on only for courses owned by
 * a Brand account on Partner Professional or Partner Premium. Resolved from the
 * owning brand's user tier, so it is authoritative regardless of who saves and
 * cannot be set by the client. Opleider-owned courses are never bookable.
 */
async function resolveIsBookable(brandRel: unknown, req: { payload: any }): Promise<boolean> {
  if (!brandRel) return false
  const brandId = typeof brandRel === 'object' ? (brandRel as { id?: number | string }).id : brandRel
  if (!brandId) return false
  try {
    const brand = await req.payload.findByID({ collection: 'brands', id: brandId, depth: 1, overrideAccess: true })
    const owner = (brand as { owner?: unknown })?.owner
    const tier = typeof owner === 'object' ? (owner as { brandTier?: string })?.brandTier : undefined
    return tier === 'partner_professional' || tier === 'partner_premium'
  } catch {
    return false
  }
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
      if (user.role === 'admin' || user.role === 'trainer') return true
      // Brand accounts: Partner Listing cannot create any course (hard gate).
      if (user.role === 'brand') return (user.brandTier || 'partner_listing') !== 'partner_listing'
      return false
    },
    update: updateAccess,
    delete: deleteAccess,
  },

  hooks: {
    beforeChange: [
      async ({ data, operation, req, originalDoc }) => {
        const user = req.user as any

        // Registration mode is always resolved server-side from the owning brand
        // tier, for every writer (incl. admin), and never trusted from the client.
        const brandRel = (data as { brand?: unknown }).brand ?? originalDoc?.brand
        ;(data as { isBookable?: boolean }).isBookable = await resolveIsBookable(brandRel, req)

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
          // Publishing requires an active (paid) subscription. Drafts are always
          // allowed; only the transition to 'published' is gated.
          if (user.subscriptionStatus !== 'active') {
            throw new Error(
              'Je kunt pas opleidingen publiceren zodra je abonnement actief is. ' +
              'Rond je betaling af via je dashboard om te publiceren.'
            )
          }

          const limit = courseLimitFor(user)

          // Hard block: this account type/tier may not publish courses at all.
          if (limit === 0) {
            throw new Error(
              'Je huidige abonnement laat niet toe om opleidingen te publiceren. ' +
              'Upgrade je abonnement om opleidingen te kunnen aanbieden.'
            )
          }

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
              const noun = limit === 1 ? 'actieve opleiding' : 'actieve opleidingen'
              throw new Error(
                `Je abonnement laat maximaal ${limit} ${noun} toe. ` +
                `Archiveer een bestaande opleiding of upgrade je abonnement.`
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
      label: 'Externe inschrijvingslink',
      admin: { description: 'URL naar de externe inschrijvingspagina (voor opleidingen zonder in-platform inschrijving).' },
    },
    {
      // Set automatically by the beforeChange hook from the owning brand tier.
      name: 'isBookable',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'In-platform inschrijving (automatisch bepaald door accounttype + abonnement).',
      },
    },
    {
      name: 'notificationRecipients',
      type: 'array',
      label: 'E-mailmeldingen bij inschrijving',
      maxRows: 5,
      admin: {
        description: 'E-mailadressen die een melding krijgen bij een nieuwe inschrijving (max. 5).',
        condition: (data) => Boolean((data as { isBookable?: boolean })?.isBookable),
      },
      fields: [{ name: 'email', type: 'email', required: true }],
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
