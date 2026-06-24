import type { GlobalConfig } from 'payload'
import { isAdmin } from '@/access'

export const Footer: GlobalConfig = {
  slug: 'footer',
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
      name: 'links',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'socialInstagram',
      type: 'text',
    },
    {
      name: 'socialFacebook',
      type: 'text',
    },
    {
      name: 'newsletterTitle',
      type: 'text',
      defaultValue: 'Blijf op de hoogte',
    },
    {
      name: 'newsletterSubtitle',
      type: 'text',
      defaultValue: 'Ontvang de nieuwste opleidingen in jouw inbox',
    },
  ],
}
