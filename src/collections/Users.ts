import type { CollectionConfig, FieldAccess } from 'payload'
import { isAdmin, isAdminOrSelf } from '@/access'
import { tierForUser } from '@/lib/tier-features'

const adminOnlyField: FieldAccess = ({ req }) => {
  const user = req.user as any
  return user?.role === 'admin'
}

const premiumTemplateField: FieldAccess = ({ req }) => {
  const user = req.user as { role?: string; subscriptionTier?: string; brandTier?: string } | null
  return user?.role === 'admin' || Boolean(user && tierForUser(user).features.hasResponseTemplates)
}

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 7200,
    maxLoginAttempts: 5,
    lockTime: 600000,
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'subscriptionTier'],
    group: 'Beheer',
    // Hide the Users list from non-admins entirely
    hidden: ({ user }) => (user as any)?.role !== 'admin',
  },
  access: {
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
    admin: ({ req }) => (req.user as { role?: string })?.role === 'admin',
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation !== 'update') return
        const current = doc as { id: number | string; role?: string; subscriptionTier?: string; brandTier?: string }
        const previous = previousDoc as { subscriptionTier?: string; brandTier?: string } | undefined
        const tierChanged =
          current.subscriptionTier !== previous?.subscriptionTier ||
          current.brandTier !== previous?.brandTier
        if (!tierChanged || (current.role !== 'trainer' && current.role !== 'brand')) return

        const collection = current.role === 'brand' ? 'brands' : 'trainers'
        const relationship = current.role === 'brand' ? 'brand' : 'trainer'
        const profiles = await req.payload.find({
          collection,
          where: { owner: { equals: current.id } },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        })
        const profile = profiles.docs[0]
        if (!profile) return
        const courses = await req.payload.find({
          collection: 'courses',
          where: { [relationship]: { equals: profile.id } } as never,
          limit: 500,
          depth: 0,
          overrideAccess: true,
        })
        await Promise.all(
          courses.docs.map((course) =>
            req.payload.update({
              collection: 'courses',
              id: course.id,
              data: { featured: course.featured } as never,
              overrideAccess: true,
            }),
          ),
        )
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'trainer',
      saveToJWT: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Trainer', value: 'trainer' },
        { label: 'Brand', value: 'brand' },
      ],
      access: {
        // Only admins can change roles
        update: adminOnlyField,
      },
      admin: {
        // Non-admins see this field as read-only
        readOnly: false,
        condition: () => true,
      },
    },
    {
      // Opleider (trainer) tier ladder. Brand accounts use `brandTier` instead.
      name: 'subscriptionTier',
      type: 'select',
      defaultValue: 'basis',
      saveToJWT: true,
      options: [
        { label: 'Basis (€99/jaar)', value: 'basis' },
        { label: 'Medium (€249/jaar)', value: 'medium' },
        { label: 'Premium (€549/jaar)', value: 'premium' },
      ],
      access: {
        update: adminOnlyField,
      },
      admin: {
        position: 'sidebar',
        description: 'Opleider-abonnement (individuele trainer).',
        condition: (data) => (data as { role?: string })?.role !== 'brand',
      },
    },
    {
      // Merk & Leverancier (brand) tier ladder - separate product from Opleider.
      name: 'brandTier',
      type: 'select',
      defaultValue: 'partner_listing',
      saveToJWT: true,
      options: [
        { label: 'Partner Listing (€490/jaar)', value: 'partner_listing' },
        { label: 'Partner Professional (€890/jaar)', value: 'partner_professional' },
        { label: 'Partner Premium (€1.490/jaar)', value: 'partner_premium' },
      ],
      access: {
        update: adminOnlyField,
      },
      admin: {
        position: 'sidebar',
        description: 'Merk & Leverancier-abonnement.',
        condition: (data) => (data as { role?: string })?.role === 'brand',
      },
    },
    {
      name: 'subscriptionStatus',
      type: 'select',
      defaultValue: 'inactive',
      saveToJWT: true,
      options: [
        { label: 'Actief', value: 'active' },
        { label: 'Wacht op betaling', value: 'pending_payment' },
        { label: 'Inactief', value: 'inactive' },
        { label: 'Geannuleerd', value: 'canceled' },
        { label: 'Verlopen', value: 'past_due' },
      ],
      access: {
        update: adminOnlyField,
      },
      admin: { position: 'sidebar' },
    },
    {
      name: 'subscriptionExpiresAt',
      type: 'date',
      access: {
        update: adminOnlyField,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Vervaldatum abonnement',
      },
    },
    {
      name: 'subscriptionBillingCycle',
      type: 'select',
      defaultValue: 'yearly',
      options: [
        { label: 'Jaarlijks', value: 'yearly' },
        { label: 'Maandelijks', value: 'monthly' },
      ],
      access: { update: adminOnlyField },
      admin: { position: 'sidebar', description: 'Gekozen betalingsfrequentie.' },
    },
    {
      name: 'subscriptionCommitment',
      type: 'select',
      defaultValue: 'annual',
      options: [
        { label: 'Jaarverbintenis', value: 'annual' },
        { label: 'Maandelijks opzegbaar', value: 'cancel_anytime' },
      ],
      access: { update: adminOnlyField },
      admin: { position: 'sidebar', description: 'Voorwaarden die golden bij het afsluiten.' },
    },
    {
      name: 'subscriptionTrialEndsAt',
      type: 'date',
      access: { update: adminOnlyField },
      admin: { position: 'sidebar', readOnly: true, description: 'Einde van de proefperiode.' },
    },
    {
      name: 'subscriptionMinimumEndsAt',
      type: 'date',
      access: { update: adminOnlyField },
      admin: { position: 'sidebar', readOnly: true, description: 'Vroegste opzegdatum bij een jaarverbintenis.' },
    },
    {
      name: 'mollieCustomerId',
      type: 'text',
      access: { read: adminOnlyField, update: adminOnlyField },
      admin: { position: 'sidebar', readOnly: true, description: 'Mollie Customer ID (auto-ingevuld)' },
    },
    {
      name: 'mollieSubscriptionId',
      type: 'text',
      access: { read: adminOnlyField, update: adminOnlyField },
      admin: { position: 'sidebar', readOnly: true, description: 'Mollie Subscription ID (auto-ingevuld)' },
    },
    {
      name: 'responseTemplates',
      type: 'array',
      maxRows: 10,
      label: 'Antwoordsjablonen',
      access: {
        create: premiumTemplateField,
        read: premiumTemplateField,
        update: premiumTemplateField,
      },
      admin: {
        description: 'Meerdere antwoordsjablonen voor aanvragen. Alleen beschikbaar in Premium.',
      },
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Naam' },
        { name: 'subject', type: 'text', required: true, label: 'Onderwerp' },
        { name: 'body', type: 'textarea', required: true, label: 'Bericht' },
      ],
    },
  ],
}
