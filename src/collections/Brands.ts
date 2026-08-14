import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access'
import { seoFields } from '@/fields/seo'
import { tierForUser } from '@/lib/tier-features'
export const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'owner', 'featured'],
    group: 'Gebruikers',
  },
  access: {
    // Public can read all brands
    read: () => true,
    // Admin only creates brand profiles
    create: isAdmin,
    // Admin: all; brand: only their own brand document (owner matches user id)
    update: ({ req }) => {
      const user = req.user as any
      if (!user) return false
      if (user.role === 'admin') return true
      if (user.role === 'brand') return { owner: { equals: user.id } }
      return false
    },
    // Admin only
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        // profileAccentColor is a branding perk. Enforce server-side: clear it
        // when the owning brand account's tier has no branding rights,
        // regardless of any value submitted by the client.
        if (data.profileAccentColor) {
          const ownerRel = (data as { owner?: unknown }).owner ?? originalDoc?.owner
          const ownerId = typeof ownerRel === 'object' ? (ownerRel as { id?: number | string })?.id : ownerRel
          let tier: string | undefined
          if (ownerId) {
            try {
              const owner = await req.payload.findByID({ collection: 'users', id: ownerId as never, depth: 0, overrideAccess: true })
              tier = (owner as { brandTier?: string })?.brandTier
            } catch {
              tier = undefined
            }
          }
          if (!tierForUser({ role: 'brand', brandTier: tier }).features.hasProfileBranding) {
            ;(data as { profileAccentColor?: string | null }).profileAccentColor = null
          }
        }
        return data
      },
    ],
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
      admin: { position: 'sidebar' },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Brand gebruikersaccount',
      },
      filterOptions: {
        role: { equals: 'brand' },
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Sfeerfoto’s',
      maxRows: 5,
      admin: { description: 'Maximaal vijf sfeer- of productfoto’s voor de publieke merkpagina.' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text', label: 'Bijschrift' },
      ],
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'website',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'social',
      type: 'group',
      label: 'Sociale kanalen',
      fields: [
        { name: 'instagram', type: 'text' },
        { name: 'facebook', type: 'text' },
        { name: 'tiktok', type: 'text' },
      ],
    },
    {
      name: 'localPartners',
      type: 'array',
      label: 'Lokale partners / distributeurs',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Naam' },
        { name: 'country', type: 'text', required: true, label: 'Land of regio' },
        { name: 'website', type: 'text' },
      ],
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'typePartner',
      type: 'select',
      admin: { position: 'sidebar', description: 'Type Merk & Leverancier' },
      options: [
        { label: 'Productmerken', value: 'productmerken' },
        { label: 'Apparatuurmerken', value: 'apparatuurmerken' },
        { label: 'Groothandels / Distributeurs', value: 'groothandels_distributeurs' },
        { label: 'Leveranciers', value: 'leveranciers' },
      ],
    },
    {
      name: 'herkomst',
      type: 'select',
      admin: { position: 'sidebar', description: 'Land van herkomst' },
      options: [
        { label: 'Belgisch', value: 'belgisch' },
        { label: 'Nederlands', value: 'nederlands' },
        { label: 'Europees', value: 'europees' },
        { label: 'Internationaal', value: 'internationaal' },
      ],
    },
    {
      name: 'productType',
      type: 'select',
      hasMany: true,
      label: 'Categorie / Producttype',
      options: [
        { label: 'Skincare & Huidverbetering', value: 'skincare-huidverbetering' },
        { label: 'Esthetische Technologie & Apparatuur', value: 'esthetische-technologie' },
        { label: 'Make-up & PMU', value: 'make-up-pmu' },
        { label: 'Wenkbrauwen & Wimpers', value: 'wenkbrauwen-wimpers' },
        { label: 'Nagels & Hand/Voetverzorging', value: 'nagels-hand-voet' },
        { label: 'Haarverzorging & Scalp', value: 'haarverzorging-scalp' },
        { label: 'Massage & Body', value: 'massage-body' },
        { label: 'Waxing & Ontharing', value: 'waxing-ontharing' },
        { label: 'Wellness & Holistisch', value: 'wellness-holistisch' },
        { label: 'Business & Salon Benodigdheden', value: 'business-salon' },
      ],
    },
    {
      name: 'positionering',
      type: 'select',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Starter friendly', value: 'starter-friendly' },
        { label: 'Premium / Luxe', value: 'premium-luxe' },
        { label: 'Professioneel / Salon exclusief', value: 'professioneel-salon' },
        { label: 'Medisch-esthetisch', value: 'medisch-esthetisch' },
      ],
    },
    {
      name: 'tags',
      type: 'select',
      hasMany: true,
      label: 'Filosofie & waarden',
      options: [
        { label: 'Belgisch', value: 'belgisch' },
        { label: 'Vegan', value: 'vegan' },
        { label: 'Natuurlijk', value: 'natuurlijk' },
        { label: 'Cruelty-free', value: 'cruelty-free' },
        { label: 'Duurzaam', value: 'duurzaam' },
        { label: 'Holistisch', value: 'holistisch' },
        { label: 'Professioneel', value: 'professioneel' },
        { label: 'Biologisch', value: 'biologisch' },
        { label: 'Luxe', value: 'luxe' },
      ],
    },
    {
      name: 'profileAccentColor',
      type: 'text',
      label: 'Profiel accentkleur',
      admin: {
        position: 'sidebar',
        placeholder: '#8B6B2E',
        description: 'Hex-kleur voor je merkaccent (bijv. #8B6B2E). Wordt automatisch genegeerd zonder brandingrechten.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    ...seoFields,
  ],
}
