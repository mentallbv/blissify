import type { GlobalConfig } from 'payload'
import { isAdmin } from '@/access'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  admin: {
    group: 'Instellingen',
    hidden: ({ user }) => (user as any)?.role !== 'admin',
  },
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'links',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'ctaLabel',
      type: 'text',
      defaultValue: 'Publiceer jouw opleiding',
    },
    {
      name: 'ctaUrl',
      type: 'text',
    },
  ],
}
