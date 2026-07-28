import type { GlobalConfig } from 'payload'
import { isAdmin } from '@/access'

/**
 * Admin config for subscription-related behaviour. Currently controls which
 * tiers are eligible for homepage featuring; Session 6 will add trial length and
 * cancellation-policy defaults to this same global.
 */
export const SubscriptionSettings: GlobalConfig = {
  slug: 'subscription-settings',
  label: 'Abonnement-instellingen',
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
      name: 'homepageOpleiderTiers',
      type: 'select',
      hasMany: true,
      label: 'Opleider-tiers met homepage-uitlichting',
      defaultValue: ['premium'],
      admin: { description: 'Welke Opleider-abonnementen mogen uitgelicht worden op de homepage.' },
      options: [
        { label: 'Basis', value: 'basis' },
        { label: 'Medium', value: 'medium' },
        { label: 'Premium', value: 'premium' },
      ],
    },
    {
      name: 'homepageBrandTiers',
      type: 'select',
      hasMany: true,
      label: 'Merk-tiers met homepage-uitlichting',
      defaultValue: ['partner_professional', 'partner_premium'],
      admin: { description: 'Welke Merk & Leverancier-abonnementen mogen uitgelicht worden op de homepage.' },
      options: [
        { label: 'Partner Listing', value: 'partner_listing' },
        { label: 'Partner Professional', value: 'partner_professional' },
        { label: 'Partner Premium', value: 'partner_premium' },
      ],
    },
  ],
}
