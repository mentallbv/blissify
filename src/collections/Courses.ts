import type { CollectionConfig, Access } from 'payload'
import { seoFields } from '@/fields/seo'
import { getBrandIdForUser, getTrainerIdForUser } from '@/access'
import { tierForUser, type TierFeatures } from '@/lib/tier-features'
import { isEntitled } from '@/lib/entitlement'

/** Active-course limit for a user, based on account type + tier. */
function courseLimitFor(user: { role?: string; subscriptionTier?: string; brandTier?: string }): number {
  return tierForUser(user).features.courseLimit
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
    const brand = await req.payload.findByID({ collection: 'brands', id: brandId, depth: 0, overrideAccess: true })
    const owner = (brand as { owner?: unknown })?.owner
    const ownerId = typeof owner === 'object' ? (owner as { id?: number | string })?.id : owner
    if (!ownerId) return false
    const user = await req.payload.findByID({ collection: 'users', id: ownerId, depth: 0, overrideAccess: true })
    return tierForUser(user).features.hasInPlatformRegistration
  } catch {
    return false
  }
}

async function resolveOwnerFeatures(data: Record<string, unknown>, originalDoc: any, req: { payload: any }): Promise<TierFeatures> {
  const brandRel = data.brand ?? originalDoc?.brand
  const trainerRel = data.trainer ?? originalDoc?.trainer
  const profileRel = brandRel || trainerRel
  const collection = brandRel ? 'brands' : 'trainers'
  const profileId = typeof profileRel === 'object' ? (profileRel as { id?: number | string })?.id : profileRel
  if (!profileId) return tierForUser({ role: brandRel ? 'brand' : 'trainer' }).features
  const profile = await req.payload.findByID({ collection, id: profileId, depth: 0, overrideAccess: true })
  const ownerId = typeof profile.owner === 'object' ? profile.owner?.id : profile.owner
  if (!ownerId) return tierForUser({ role: brandRel ? 'brand' : 'trainer' }).features
  const owner = await req.payload.findByID({ collection: 'users', id: ownerId, depth: 0, overrideAccess: true })
  return tierForUser(owner).features
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
const adminField = ({ req }: { req: { user?: unknown } }) => (req.user as { role?: string } | null)?.role === 'admin'

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
      if (user.role === 'brand') return tierForUser(user).features.canPublishCourses
      return false
    },
    update: updateAccess,
    delete: deleteAccess,
  },

  hooks: {
    beforeChange: [
      async ({ data, operation, req, originalDoc }) => {
        const user = req.user as any

        // ── Ownership ────────────────────────────────────────────────────────
        // A course is always filed under the caller's own profile. This must run
        // before anything derives from data.brand/data.trainer, and cannot live
        // in the API route alone: Payload's REST API is mounted at
        // /api/courses, so a client can POST to the collection directly.
        if (user && user.role !== 'admin') {
          const isTrainer = user.role === 'trainer'
          if (!isTrainer && user.role !== 'brand') {
            throw new Error('Je hebt geen toegang om opleidingen te beheren.')
          }

          const ownProfileId = isTrainer ? await getTrainerIdForUser(req) : await getBrandIdForUser(req)
          if (!ownProfileId) {
            throw new Error(
              isTrainer
                ? 'Je hebt nog geen opleiderprofiel. Vul eerst je profiel aan.'
                : 'Je hebt nog geen merkprofiel. Vul eerst je profiel aan.',
            )
          }

          if (operation === 'update' && originalDoc) {
            const existing = isTrainer ? originalDoc.trainer : originalDoc.brand
            const existingId = typeof existing === 'object' ? existing?.id : existing
            if (existingId && String(existingId) !== String(ownProfileId)) {
              throw new Error('Je hebt geen toegang om deze cursus te bewerken.')
            }
          }

          // Overwrite rather than validate: whatever the client sent is ignored.
          data.trainer = isTrainer ? ownProfileId : null
          data.brand = isTrainer ? null : ownProfileId
        }

        // Registration mode is always resolved server-side from the owning brand
        // tier, for every writer (incl. admin), and never trusted from the client.
        const brandRel = (data as { brand?: unknown }).brand ?? originalDoc?.brand
        ;(data as { isBookable?: boolean }).isBookable = await resolveIsBookable(brandRel, req)
        const ownerFeatures = await resolveOwnerFeatures(data as Record<string, unknown>, originalDoc, req)
        data.tierPriority = ownerFeatures.searchPriority
        if ((data.featured ?? originalDoc?.featured) && !ownerFeatures.hasHomepageExposure) {
          data.featured = false
          data.featuredPosition = null
        } else if (data.featured ?? originalDoc?.featured) {
          data.featuredPosition = ownerFeatures.searchPriority >= 3 ? 'permanent_top' : 'top'
        }

        if (!user || user.role === 'admin') return data

        // ── Subscription tier limit ──────────────────────────────────────────
        const isPublishing =
          data.status === 'published' &&
          (operation === 'create' || originalDoc?.status !== 'published')

        if (isPublishing) {
          // Publishing requires a paid-up subscription. Drafts are always
          // allowed; only the transition to 'published' is gated. A cancelled
          // account keeps this right until the period it paid for ends.
          if (!isEntitled(user)) {
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
      access: { update: adminField },
      admin: { position: 'sidebar', description: 'Uitgelicht in de directory' },
    },
    {
      name: 'featuredPosition',
      type: 'select',
      access: { update: adminField },
      options: [
        { label: 'Bovenaan directory', value: 'top' },
        { label: 'Permanent bovenaan (Premium)', value: 'permanent_top' },
      ],
      admin: { position: 'sidebar', condition: (data) => data.featured },
    },
    {
      name: 'tierPriority',
      type: 'number',
      defaultValue: 0,
      index: true,
      access: { update: adminField },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Automatische zoekprioriteit op basis van het abonnement.',
      },
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
      name: 'courseType',
      type: 'select',
      label: 'Type opleiding',
      options: [
        { label: 'Praktijktraining', value: 'practice_training' },
        { label: 'Online cursus', value: 'online_course' },
        { label: 'Live cursus', value: 'live_course' },
        { label: 'Coachingsessie', value: 'coaching' },
        { label: 'Workshop', value: 'workshop' },
        { label: 'Webinar', value: 'webinar' },
        { label: 'Evenement', value: 'event' },
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
    {
      name: 'targetAudience',
      type: 'select',
      hasMany: true,
      label: 'Niveau en doelgroep',
      options: [
        { label: 'Beginner friendly', value: 'beginner-friendly' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Expert / Advanced', value: 'expert-advanced' },
        { label: 'Professional only', value: 'professional-only' },
        { label: 'Startende ondernemer', value: 'startende-ondernemer' },
      ],
    },
    {
      name: 'practical',
      type: 'select',
      hasMany: true,
      label: 'Praktisch',
      options: [
        { label: 'Online', value: 'online' },
        { label: 'Praktijkopleiding', value: 'praktijkopleiding' },
        { label: '1-daagse opleiding', value: 'een-dag' },
        { label: 'Meerdere dagen', value: 'meerdere-dagen' },
        { label: 'Op locatie', value: 'op-locatie' },
        { label: 'Kleine groepen (<12)', value: 'kleine-groepen' },
      ],
    },
    {
      name: 'focus',
      type: 'select',
      hasMany: true,
      label: 'Focus en filosofie',
      options: [
        { label: 'Huidverbeterend', value: 'huidverbeterend' },
        { label: 'Medisch-esthetisch', value: 'medisch-esthetisch' },
        { label: 'Holistisch', value: 'holistisch' },
        { label: 'Ontspannend', value: 'ontspannend' },
        { label: 'Cosmetisch', value: 'cosmetisch' },
        { label: 'Therapeutisch', value: 'therapeutisch' },
        { label: 'Energetisch', value: 'energetisch' },
      ],
    },
    {
      name: 'popular',
      type: 'checkbox',
      defaultValue: false,
      label: 'Trending / populair',
      access: { update: adminField },
      admin: { position: 'sidebar', description: 'Handmatig beheerd door Blissify.' },
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
      label: 'Data en tijdstippen',
      fields: [
        { name: 'date', type: 'date', required: true, label: 'Startdatum' },
        { name: 'endDate', type: 'date', label: 'Einddatum' },
        { name: 'startTime', type: 'text', label: 'Starttijd', admin: { placeholder: '09:00' } },
        { name: 'endTime', type: 'text', label: 'Eindtijd', admin: { placeholder: '17:00' } },
        { name: 'spotsAvailable', type: 'number' },
      ],
    },
    {
      name: 'participants',
      type: 'group',
      label: 'Deelnemers',
      fields: [
        { name: 'maximum', type: 'number', min: 1, label: 'Maximum aantal deelnemers' },
        { name: 'privateOneToOne', type: 'checkbox', defaultValue: false, label: 'Privé / één-op-één' },
      ],
    },
    {
      name: 'modelRequired',
      type: 'select',
      label: 'Model meenemen',
      options: [
        { label: 'Niet van toepassing', value: 'not_applicable' },
        { label: 'Ja', value: 'yes' },
        { label: 'Nee', value: 'no' },
      ],
    },
    {
      name: 'lunchProvided',
      type: 'select',
      label: 'Lunch voorzien',
      options: [
        { label: 'Niet van toepassing', value: 'not_applicable' },
        { label: 'Ja', value: 'yes' },
        { label: 'Nee', value: 'no' },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      label: 'Contact en sociale links',
      fields: [
        { name: 'email', type: 'email' },
        { name: 'website', type: 'text' },
        { name: 'instagram', type: 'text' },
        { name: 'facebook', type: 'text' },
        { name: 'tiktok', type: 'text' },
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
