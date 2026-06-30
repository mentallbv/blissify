import type { CollectionConfig, FieldAccess } from 'payload'
import { isAdmin, isAdminOrSelf } from '@/access'

const adminOnlyField: FieldAccess = ({ req }) => {
  const user = req.user as any
  return user?.role === 'admin'
}

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
    // Hide the Users list from non-admins entirely
    hidden: ({ user }) => (user as any)?.role !== 'admin',
  },
  access: {
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
    admin: ({ req }) => (req.user as { role?: string })?.role === 'admin',
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
      access: {
        // Only admins can change roles
        update: adminOnlyField,
      },
      admin: {
        // Non-admins see this field as read-only
        readOnly: false,
        condition: () => true,
      },
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
      access: {
        update: adminOnlyField,
      },
      admin: { position: 'sidebar' },
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
      access: {
        update: adminOnlyField,
      },
      admin: { position: 'sidebar' },
    },
    {
      name: 'stripeCustomerId',
      type: 'text',
      access: {
        read: adminOnlyField,
        update: adminOnlyField,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Stripe Customer ID (auto-ingevuld)',
      },
    },
    {
      name: 'stripeSubscriptionId',
      type: 'text',
      access: {
        read: adminOnlyField,
        update: adminOnlyField,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Stripe Subscription ID (auto-ingevuld)',
      },
    },
    {
      name: 'subscriptionExpiresAt',
      type: 'date',
      access: {
        update: adminOnlyField,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Vervaldatum abonnement',
      },
    },
    {
      name: 'mollieCustomerId',
      type: 'text',
      access: { read: adminOnlyField, update: adminOnlyField },
      admin: { position: 'sidebar', readOnly: true, description: 'Mollie Customer ID (auto-ingevuld)' },
    },
    {
      name: 'mollieSubscriptionId',
      type: 'text',
      access: { read: adminOnlyField, update: adminOnlyField },
      admin: { position: 'sidebar', readOnly: true, description: 'Mollie Subscription ID (auto-ingevuld)' },
    },
  ],
}
