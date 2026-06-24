import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Beheer',
  },
  access: {
    // Public can read all media
    read: () => true,
    // Any authenticated user (admin, trainer, brand) can upload
    create: ({ req }) => Boolean(req.user),
    // Admin can update all; the uploader can update their own upload
    update: ({ req }) => {
      const user = req.user as any
      if (!user) return false
      if (user.role === 'admin') return true
      return { createdBy: { equals: user.id } }
    },
    // Admin can delete all; the uploader can delete their own upload
    delete: ({ req }) => {
      const user = req.user as any
      if (!user) return false
      if (user.role === 'admin') return true
      return { createdBy: { equals: user.id } }
    },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    // Track who uploaded this file so we can scope update/delete access
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Geüpload door',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, operation, data }) => {
        // Auto-set createdBy on create
        if (operation === 'create' && req.user) {
          data.createdBy = req.user.id
        }
        return data
      },
    ],
  },
  upload: {
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 800, height: 600, position: 'centre' },
      { name: 'hero', width: 1600, height: 900, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
}
