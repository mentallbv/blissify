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
  upload: true,
}
