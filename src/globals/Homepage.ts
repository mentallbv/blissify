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
      name: 'hero',
      type: 'group',
      label: 'Hero',
      fields: [
        { name: 'badge', type: 'text', defaultValue: '847 opleidingen in België' },
        { name: 'title', type: 'text', defaultValue: 'De Europese standaard voor' },
        { name: 'highlight', type: 'text', defaultValue: 'wellnessopleiding.', admin: { description: 'Het woord met terracotta-gradient.' } },
        {
          name: 'subtitle',
          type: 'textarea',
          defaultValue:
            'Vind erkende, professionele opleidingen in massage, nagelstyliste, reflexologie, yoga, voeding en beauty, zorgvuldig samengebracht door Blissify.',
        },
        { name: 'primaryCtaLabel', type: 'text', defaultValue: 'Vind een opleiding' },
        { name: 'primaryCtaUrl', type: 'text', defaultValue: '/opleidingen' },
        { name: 'secondaryCtaLabel', type: 'text', defaultValue: 'Publiceer jouw opleiding' },
        { name: 'secondaryCtaUrl', type: 'text', defaultValue: '/voor-aanbieders' },
      ],
    },
    {
      name: 'trustText',
      type: 'text',
      defaultValue: 'Vertrouwd door 124 geverifieerde opleiders in heel België',
    },
    {
      name: 'why',
      type: 'group',
      label: 'Waarom Blissify',
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'Waarom Blissify' },
        { name: 'title', type: 'text', defaultValue: 'Gebouwd voor de professional, niet voor de hype.' },
        {
          name: 'cards',
          type: 'array',
          fields: [
            { name: 'icon', type: 'text', admin: { description: 'Tabler-klasse, bijv. ti ti-rosette-discount-check' } },
            { name: 'title', type: 'text', required: true },
            { name: 'body', type: 'textarea' },
          ],
        },
      ],
    },
    {
      name: 'photoSection',
      type: 'group',
      label: 'Fototegels',
      fields: [
        { name: 'title', type: 'text', defaultValue: 'Ontdek hoe Blissify werkt' },
        { name: 'subtitle', type: 'text', defaultValue: 'Van zoeken tot inschrijven: een helder, professioneel traject.' },
        {
          name: 'tiles',
          type: 'array',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'body', type: 'text' },
            { name: 'image', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Statistieken',
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
      ],
    },
    {
      name: 'faq',
      type: 'array',
      label: 'Veelgestelde vragen',
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
  ],
}
