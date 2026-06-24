import type { GlobalConfig } from 'payload'
import { isAdmin } from '@/access'

export const Branding: GlobalConfig = {
  slug: 'branding',
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
      name: 'siteName',
      type: 'text',
      defaultValue: 'Blissify',
      required: true,
    },
    {
      name: 'tagline',
      type: 'text',
      defaultValue: 'Ontdek jouw opleiding in beauty & wellness',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Aanbevolen: SVG of PNG met transparante achtergrond' },
    },
    {
      name: 'logoLight',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Lichte versie van het logo (voor donkere achtergronden)' },
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Favicon — 32x32px of 64x64px' },
    },
    {
      name: 'colors',
      type: 'group',
      label: 'Kleuren',
      fields: [
        {
          name: 'primary',
          type: 'text',
          defaultValue: '#C9A96E',
          admin: { description: 'Primaire kleur (hex)' },
        },
        {
          name: 'primaryForeground',
          type: 'text',
          defaultValue: '#FFFFFF',
          admin: { description: 'Tekst op primaire kleur (hex)' },
        },
        {
          name: 'secondary',
          type: 'text',
          defaultValue: '#F5F0EB',
          admin: { description: 'Secundaire kleur (hex)' },
        },
        {
          name: 'accent',
          type: 'text',
          defaultValue: '#2D2D2D',
          admin: { description: 'Accentkleur (hex)' },
        },
        {
          name: 'background',
          type: 'text',
          defaultValue: '#FAFAFA',
          admin: { description: 'Achtergrondkleur (hex)' },
        },
      ],
    },
    {
      name: 'fonts',
      type: 'group',
      label: 'Lettertypen',
      fields: [
        {
          name: 'heading',
          type: 'select',
          defaultValue: 'playfair-display',
          options: [
            { label: 'Playfair Display', value: 'playfair-display' },
            { label: 'Cormorant Garamond', value: 'cormorant-garamond' },
            { label: 'Lora', value: 'lora' },
            { label: 'Libre Baskerville', value: 'libre-baskerville' },
          ],
          admin: { description: 'Lettertype voor titels' },
        },
        {
          name: 'body',
          type: 'select',
          defaultValue: 'inter',
          options: [
            { label: 'Inter', value: 'inter' },
            { label: 'DM Sans', value: 'dm-sans' },
            { label: 'Nunito', value: 'nunito' },
            { label: 'Lato', value: 'lato' },
          ],
          admin: { description: 'Lettertype voor bodytekst' },
        },
      ],
    },
    {
      name: 'social',
      type: 'group',
      label: 'Sociale media',
      fields: [
        { name: 'instagram', type: 'text' },
        { name: 'facebook', type: 'text' },
        { name: 'linkedin', type: 'text' },
        { name: 'tiktok', type: 'text' },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      label: 'Contactgegevens',
      fields: [
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'text' },
        { name: 'address', type: 'textarea' },
        { name: 'kvk', type: 'text', label: 'KBO-nummer' },
        { name: 'btw', type: 'text', label: 'BTW-nummer' },
      ],
    },
  ],
}
