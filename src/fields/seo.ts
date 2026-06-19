import type { Field } from 'payload'

export const seoFields: Field[] = [
  {
    name: 'seo',
    type: 'group',
    label: 'SEO',
    admin: {
      description: 'Zoekmachine-optimalisatie instellingen',
    },
    fields: [
      {
        name: 'title',
        type: 'text',
        label: 'SEO titel',
        admin: {
          description: 'Paginatitel voor zoekmachines (max 60 tekens). Laat leeg om de naam/titel te gebruiken.',
        },
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'Meta description',
        admin: {
          description: 'Beschrijving voor zoekmachines (max 160 tekens).',
        },
      },
      {
        name: 'focusKeyphrase',
        type: 'text',
        label: 'Focus keyphrase',
        admin: {
          description: 'Het hoofdzoekwoord waarop je wilt scoren (bijv. "gelnagels opleiding Antwerpen")',
        },
      },
      {
        name: 'ogImage',
        type: 'upload',
        relationTo: 'media',
        label: 'Social media afbeelding',
        admin: {
          description: 'Open Graph afbeelding voor Facebook/LinkedIn sharing (1200x630px). Laat leeg voor de standaard.',
        },
      },
      {
        name: 'noindex',
        type: 'checkbox',
        defaultValue: false,
        label: 'Verberg voor zoekmachines (noindex)',
        admin: {
          description: 'Vink aan om deze pagina uit zoekresultaten te houden.',
        },
      },
    ],
  },
]
