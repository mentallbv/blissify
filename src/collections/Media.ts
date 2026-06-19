import type { CollectionConfig } from 'payload'
import { isAdmin, isLoggedIn } from '@/access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Beheer',
  },
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 800,
        height: 600,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1600,
        height: 900,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
}
