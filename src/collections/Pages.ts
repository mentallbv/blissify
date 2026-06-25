import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access'
import { seoFields } from '@/fields/seo'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug'],
    group: 'Inhoud',
    hidden: ({ user }) => (user as { role?: string })?.role !== 'admin',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'title', type: 'text' },
        { name: 'subtitle', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'ctaLabel', type: 'text' },
        { name: 'ctaUrl', type: 'text' },
      ],
    },
    {
      name: 'blocks',
      type: 'blocks',
      blocks: [
        {
          slug: 'richText',
          labels: { singular: 'Tekst', plural: 'Tekstblokken' },
          fields: [{ name: 'content', type: 'richText' }],
        },
        {
          slug: 'stats',
          labels: { singular: 'Statistieken', plural: 'Statistieken' },
          fields: [
            {
              name: 'items',
              type: 'array',
              fields: [
                { name: 'value', type: 'text', required: true },
                { name: 'label', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          slug: 'features',
          labels: { singular: 'Kenmerken', plural: 'Kenmerken' },
          fields: [
            {
              name: 'items',
              type: 'array',
              fields: [
                { name: 'icon', type: 'text', admin: { description: 'Tabler-klasse, bijv. ti ti-target-arrow' } },
                { name: 'title', type: 'text', required: true },
                { name: 'body', type: 'textarea' },
              ],
            },
          ],
        },
        {
          slug: 'testimonial',
          labels: { singular: 'Quote', plural: 'Quotes' },
          fields: [
            { name: 'quote', type: 'textarea', required: true },
            { name: 'author', type: 'text' },
            { name: 'company', type: 'text' },
          ],
        },
        {
          slug: 'cta',
          labels: { singular: 'CTA', plural: 'CTA-blokken' },
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'body', type: 'textarea' },
            { name: 'buttonLabel', type: 'text' },
            { name: 'buttonUrl', type: 'text' },
            {
              name: 'background',
              type: 'select',
              defaultValue: 'forest',
              options: [
                { label: 'Forest', value: 'forest' },
                { label: 'Chalk', value: 'chalk' },
              ],
            },
          ],
        },
        {
          slug: 'logos',
          labels: { singular: 'Logo-rij', plural: 'Logo-rijen' },
          fields: [{ name: 'items', type: 'array', fields: [{ name: 'logo', type: 'upload', relationTo: 'media' }] }],
        },
        {
          slug: 'pricingTiers',
          labels: { singular: 'Prijzen', plural: 'Prijzen' },
          fields: [
            {
              name: 'items',
              type: 'array',
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'price', type: 'text', required: true },
                { name: 'period', type: 'text', defaultValue: '/jaar' },
                { name: 'features', type: 'array', fields: [{ name: 'feature', type: 'text' }] },
                { name: 'recommended', type: 'checkbox', defaultValue: false },
                { name: 'ctaLabel', type: 'text' },
                { name: 'ctaUrl', type: 'text' },
              ],
            },
          ],
        },
        {
          slug: 'comparison',
          labels: { singular: 'Vergelijkingstabel', plural: 'Vergelijkingstabellen' },
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
          slug: 'faq',
          labels: { singular: 'FAQ', plural: 'FAQ' },
          fields: [
            {
              name: 'items',
              type: 'array',
              fields: [
                { name: 'question', type: 'text', required: true },
                { name: 'answer', type: 'textarea', required: true },
              ],
            },
          ],
        },
      ],
    },
    ...seoFields,
  ],
}
