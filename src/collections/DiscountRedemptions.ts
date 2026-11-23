import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access'

/**
 * One row per checkout with a discount code (item 13). Created as "pending" when the
 * checkout starts; the Mollie webhook marks it "redeemed" on payment, or "failed".
 * For codes that run over several payments it also tracks how many are left.
 */
export const DiscountRedemptions: CollectionConfig = {
  slug: 'discount-redemptions',
  labels: { singular: 'Gebruik kortingscode', plural: 'Gebruik kortingscodes' },
  admin: {
    group: 'Facturatie',
    useAsTitle: 'codeText',
    defaultColumns: ['codeText', 'user', 'status', 'tier', 'discountAmount', 'paymentsLeft', 'createdAt'],
    description: 'Automatisch bijgehouden. Elke regel is één afrekening met een kortingscode.',
    hidden: ({ user }) => (user as { role?: string } | null)?.role !== 'admin',
  },
  access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  fields: [
    { name: 'discountCode', type: 'relationship', relationTo: 'discount-codes', index: true, label: 'Kortingscode' },
    { name: 'codeText', type: 'text', label: 'Code', admin: { readOnly: true } },
    { name: 'user', type: 'relationship', relationTo: 'users', index: true, label: 'Gebruiker' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Wacht op betaling', value: 'pending' },
        { label: 'Gebruikt', value: 'redeemed' },
        { label: 'Betaling mislukt', value: 'failed' },
      ],
    },
    { name: 'molliePaymentId', type: 'text', index: true, admin: { readOnly: true } },
    { name: 'tier', type: 'text', label: 'Formule', admin: { readOnly: true } },
    { name: 'billingCycle', type: 'text', label: 'Facturatie', admin: { readOnly: true } },
    { name: 'fullAmount', type: 'number', label: 'Prijs zonder korting (€ excl. btw)', admin: { readOnly: true } },
    { name: 'discountAmount', type: 'number', label: 'Korting per betaling (€ excl. btw)', admin: { readOnly: true } },
    { name: 'paymentsLeft', type: 'number', label: 'Verlengingen nog met korting', admin: { readOnly: true, description: 'Bij codes voor meerdere betalingen. 0 = vanaf nu volle prijs.' } },
    { name: 'mollieSubscriptionId', type: 'text', admin: { readOnly: true } },
    { name: 'redeemedAt', type: 'date', label: 'Gebruikt op', admin: { readOnly: true } },
  ],
}
