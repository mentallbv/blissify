import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access'
import { seoFields } from '@/fields/seo'
import { tierForUser } from '@/lib/tier-features'

export const Trainers: CollectionConfig = {
  slug: 'trainers',
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'owner', 'brand', 'featured'],
    group: 'Gebruikers',
  },
  access: {
    // Public can read all trainers
    read: () => true,
    // Admin only creates trainer profiles
    create: isAdmin,
    // Admin: all; trainer: only their own trainer document (owner matches user id)
    update: ({ req }) => {
      const user = req.user as any
      if (!user) return false
      if (user.role === 'admin') return true
      if (user.role === 'trainer') return { owner: { equals: user.id } }
      return false
    },
    // Admin only
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        // profileAccentColor is an Ultimate perk. Enforce server-side: clear it
        // when the owning trainer account is not on Ultimate, regardless
        // of any value submitted by the client.
        if (data.profileAccentColor) {
          const ownerRel = (data as { owner?: unknown }).owner ?? originalDoc?.owner
          const ownerId = typeof ownerRel === 'object' ? (ownerRel as { id?: number | string })?.id : ownerRel
          let tier: string | undefined
          if (ownerId) {
            try {
              const owner = await req.payload.findByID({ collection: 'users', id: ownerId as never, depth: 0, overrideAccess: true })
              tier = (owner as { subscriptionTier?: string })?.subscriptionTier
            } catch {
              tier = undefined
            }
          }
          if (!tierForUser({ role: 'trainer', subscriptionTier: tier }).features.hasProfileBranding) {
            ;(data as { profileAccentColor?: string | null }).profileAccentColor = null
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'displayName',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Trainer gebruikersaccount',
      },
      filterOptions: {
        role: { equals: 'trainer' },
      },
    },
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands' as any,
      admin: {
        position: 'sidebar',
        description: 'Gekoppeld aan brand (optioneel)',
      },
    },
    {
      // Co-branding (client #12): merken waarmee deze opleider samenwerkt of
      // door erkend is. Wederzijds zichtbaar: hier op het opleiderprofiel én
      // (via een omgekeerde query) op de merkpagina.
      name: 'collaboratingBrands',
      type: 'relationship',
      relationTo: 'brands' as any,
      hasMany: true,
      admin: {
        description: 'Merken waarmee deze opleider samenwerkt / door erkend is.',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'bio',
      type: 'richText',
    },
    {
      name: 'specializations',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Massage', value: 'massage' },
        { label: 'Nagelstyliste', value: 'nagelstyliste' },
        { label: 'Schoonheid', value: 'schoonheid' },
        { label: 'Yoga', value: 'yoga' },
        { label: 'Voeding', value: 'voeding' },
        { label: 'Aromatherapie', value: 'aromatherapie' },
        { label: 'Reiki', value: 'reiki' },
        { label: 'Mindfulness', value: 'mindfulness' },
        { label: 'Holistische therapie', value: 'holistische-therapie' },
        { label: 'Persoonlijke ontwikkeling', value: 'persoonlijke-ontwikkeling' },
      ],
    },
    {
      name: 'location',
      type: 'group',
      fields: [
        { name: 'city', type: 'text' },
        { name: 'province', type: 'text' },
        {
          name: 'country',
          type: 'select',
          defaultValue: 'be',
          options: [
            { label: 'België', value: 'be' },
            { label: 'Nederland', value: 'nl' },
          ],
        },
        { name: 'online', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'website',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'social',
      type: 'group',
      label: 'Sociale kanalen',
      fields: [
        { name: 'instagram', type: 'text' },
        { name: 'facebook', type: 'text' },
        { name: 'tiktok', type: 'text' },
        { name: 'linkedin', type: 'text' },
      ],
    },
    {
      name: 'profileAccentColor',
      type: 'text',
      label: 'Profiel accentkleur',
      admin: {
        position: 'sidebar',
        placeholder: '#1A2E25',
        description: 'Hex-kleur voor je profielaccent (bijv. #1A2E25). Alleen beschikbaar met Opleider Ultimate.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    ...seoFields,
  ],
}
