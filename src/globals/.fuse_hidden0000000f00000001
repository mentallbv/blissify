import type { GlobalConfig } from 'payload'
import { isAdmin } from '@/access'

export const SeoSettings: GlobalConfig = {
  slug: 'seo-settings',
  admin: {
    group: 'Instellingen',
  },
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      name: 'defaultTitle',
      type: 'text',
      defaultValue: 'Blissify — Opleidingen in beauty & wellness',
      required: true,
      admin: { description: 'Fallback paginatitel als er geen specifieke is ingesteld' },
    },
    {
      name: 'titleTemplate',
      type: 'text',
      defaultValue: '%s | Blissify',
      admin: { description: 'Template voor paginatitels. Gebruik %s voor de paginanaam.' },
    },
    {
      name: 'defaultDescription',
      type: 'textarea',
      defaultValue: 'Ontdek erkende opleidingen in massage, nagelstyliste, yoga, wellness en meer. Vind de beste trainers en merken in België.',
      admin: { description: 'Fallback meta description (max 160 tekens)' },
    },
    {
      name: 'defaultOgImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Standaard Open Graph afbeelding (1200x630px) voor social sharing' },
    },
    {
      name: 'twitterHandle',
      type: 'text',
      admin: { description: '@handle zonder @' },
    },
    {
      name: 'googleVerification',
      type: 'text',
      admin: { description: 'Google Search Console verificatiecode' },
    },
    {
      name: 'noindex',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Zet de hele site op noindex (alleen voor staging/dev)' },
    },
    {
      name: 'structuredData',
      type: 'group',
      label: 'Gestructureerde data (Schema.org)',
      fields: [
        {
          name: 'organizationName',
          type: 'text',
          defaultValue: 'Blissify',
        },
        {
          name: 'organizationUrl',
          type: 'text',
          defaultValue: 'https://blissify.be',
        },
        {
          name: 'organizationType',
          type: 'select',
          defaultValue: 'Organization',
          options: [
            { label: 'Organization', value: 'Organization' },
            { label: 'LocalBusiness', value: 'LocalBusiness' },
            { label: 'EducationalOrganization', value: 'EducationalOrganization' },
          ],
        },
      ],
    },
  ],
}
