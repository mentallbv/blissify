import type { GlobalConfig } from 'payload'
import { isAdmin } from '@/access'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
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
      name: 'heroTitle',
      type: 'text',
      defaultValue: 'Ontdek jouw volgende opleiding in beauty & wellness',
    },
    {
      name: 'heroSubtitle',
      type: 'text',
      defaultValue: 'Vind erkende opleidingen van de beste trainers en merken in België',
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'featuredSectionTitle',
      type: 'text',
      defaultValue: 'Uitgelichte opleidingen',
    },
  ],
}
