import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access'
import { seoFields } from '@/fields/seo'

export const Trainers: CollectionConfig = {
  slug: 'trainers',
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'owner', 'brand', 'verified'],
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
      fields: [
        { name: 'instagram', type: 'text' },
        { name: 'facebook', type: 'text' },
        { name: 'linkedin', type: 'text' },
      ],
    },
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
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
