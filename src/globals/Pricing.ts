import type { GlobalConfig } from 'payload'
import { isAdmin } from '@/access'

/**
 * Single source of truth for subscription pricing. Read by the homepage,
 * the /prijzen page and the dashboard /abonnement page.
 */
export const Pricing: GlobalConfig = {
  slug: 'pricing',
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
      name: 'intro',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'Prijzen voor opleiders' },
        { name: 'title', type: 'text', defaultValue: 'Eenvoudige, eerlijke prijzen.' },
        { name: 'subtitle', type: 'text', defaultValue: 'Eén jaarlijks abonnement. Directe leads. Geen commissie per aanvraag.' },
      ],
    },
    {
      name: 'tiers',
      type: 'array',
      label: 'Abonnementen',
      fields: [
        { name: 'key', type: 'text', required: true, admin: { description: 'Stabiele sleutel: basis / medium / premium' } },
        { name: 'name', type: 'text', required: true },
        { name: 'tagline', type: 'text' },
        { name: 'price', type: 'text', required: true },
        { name: 'period', type: 'text', defaultValue: '/jaar' },
        { name: 'desc', type: 'textarea' },
        { name: 'recommended', type: 'checkbox', defaultValue: false },
        { name: 'features', type: 'array', fields: [{ name: 'feature', type: 'text' }] },
      ],
    },
    {
      name: 'comparison',
      type: 'group',
      label: 'Vergelijkingstabel',
      fields: [
        { name: 'col1', type: 'text', defaultValue: 'Basis' },
        { name: 'col2', type: 'text', defaultValue: 'Medium' },
        { name: 'col3', type: 'text', defaultValue: 'Premium' },
        {
          name: 'rows',
          type: 'array',
          fields: [
            { name: 'feature', type: 'text', required: true },
            { name: 'v1', type: 'text' },
            { name: 'v2', type: 'text' },
            { name: 'v3', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'bottomCta',
      type: 'group',
      label: 'CTA onderaan',
      fields: [
        { name: 'title', type: 'text', defaultValue: 'Jouw praktijk begint hier.' },
        { name: 'body', type: 'textarea', defaultValue: 'Sluit je aan bij 124 geverifieerde opleiders die hun bereik uitbreiden via Blissify.' },
        { name: 'buttonLabel', type: 'text', defaultValue: 'Bied mijn opleidingen aan' },
        { name: 'buttonUrl', type: 'text', defaultValue: '/inloggen' },
      ],
    },
  ],
}
