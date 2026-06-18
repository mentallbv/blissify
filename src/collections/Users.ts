import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrSelf } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 7200,
    maxLoginAttempts: 5,
    lockTime: 600000,
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'subscriptionTier'],
    group: 'Beheer',
  },
  access: {
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
    admin: ({ req }) => {
      const user = req.user as any
      return Boolean(user)
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'trainer',
      saveToJWT: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Trainer', value: 'trainer' },
        { label: 'Brand', value: 'brand' },
      ],
    },
    {
      name: 'subscriptionTier',
      type: 'select',
      defaultValue: 'basis',
      saveToJWT: true,
      options: [
        { label: 'Basis (€99/jaar)', value: 'basis' },
        { label: 'Medium (€290/jaar)', value: 'medium' },
        { label: 'Premium (€690/jaar)', value: 'premium' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'subscriptionStatus',
      type: 'select',
      defaultValue: 'inactive',
      saveToJWT: true,
      options: [
        { label: 'Actief', value: 'active' },
        { label: 'Inactief', value: 'inactive' },
        { label: 'Geannuleerd', value: 'canceled' },
        { label: 'Verlopen', value: 'past_due' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'stripeCustomerId',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Stripe Customer ID (auto-ingevuld)',
      },
    },
    {
      name: 'stripeSubscriptionId',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Stripe Subscription ID (auto-ingevuld)',
      },
    },
    {
      name: 'subscriptionExpiresAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Vervaldatum abonnement',
      },
    },
  ],
}
