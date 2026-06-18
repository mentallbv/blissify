import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access'


export const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'owner', 'subscriptionTier', 'verified'],
    group: 'Gebruikers',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: ({ req }) => {
      const user = req.user as any
      if (!user) return false
      if (user.role === 'admin') return true
      // Brand users can only update their own brand
      return { owner: { equals: user.id } }
    },
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
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
        description: 'Brand gebruikersaccount',
      },
      filterOptions: {
        role: { equals: 'brand' },
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'description',
      type: 'richText',
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
      name: 'tags',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Belgisch', value: 'belgisch' },
        { label: 'Vegan', value: 'vegan' },
        { label: 'Natuurlijk', value: 'natuurlijk' },
        { label: 'Professioneel', value: 'professioneel' },
        { label: 'Biologisch', value: 'biologisch' },
        { label: 'Duurzaam', value: 'duurzaam' },
        { label: 'Luxe', value: 'luxe' },
      ],
    },
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Geverifieerd door Blissify',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
