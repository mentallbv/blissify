import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'parent', 'slug'],
    group: 'Inhoud',
    hidden: ({ user }) => (user as any)?.role !== 'admin',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories' as any,
      admin: {
        position: 'sidebar',
        description: 'Laat leeg voor hoofdcategorie',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'landing',
      type: 'group',
      label: 'SEO landingspagina',
      admin: { description: 'Teksten voor de publieke categoriepagina (/opleidingen/[slug]).' },
      fields: [
        { name: 'metaTitle', type: 'text', label: 'SEO titel' },
        { name: 'metaDescription', type: 'textarea', label: 'Meta description' },
        { name: 'h1', type: 'text', label: 'Hero titel (H1)' },
        { name: 'heroIntro', type: 'textarea', label: 'Hero intro' },
        { name: 'seoIntro', type: 'textarea', label: 'SEO-alinea' },
        { name: 'sectionTitle', type: 'text', label: 'Sectietitel' },
        { name: 'sectionBody', type: 'textarea', label: 'Sectietekst' },
        {
          name: 'faqs',
          type: 'array',
          label: 'Veelgestelde vragen',
          fields: [
            { name: 'question', type: 'text', required: true },
            { name: 'answer', type: 'textarea', required: true },
          ],
        },
      ],
    },
  ],
}
