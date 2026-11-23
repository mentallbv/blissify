import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access'

/**
 * Discount codes for subscriptions (meeting Nov 2026, item 13). Admin only.
 * Checked and applied in lib/discounts.ts; every use is logged in "discount-redemptions".
 */
const TIER_OPTIONS = [
  { label: 'Lite', value: 'basis' },
  { label: 'Premium', value: 'medium' },
  { label: 'Ultimate', value: 'premium' },
  { label: 'Partner Lite', value: 'partner_listing' },
  { label: 'Partner Premium', value: 'partner_professional' },
  { label: 'Partner Ultimate', value: 'partner_premium' },
]

export const DiscountCodes: CollectionConfig = {
  slug: 'discount-codes',
  labels: { singular: 'Kortingscode', plural: 'Kortingscodes' },
  admin: {
    group: 'Facturatie',
    useAsTitle: 'code',
    defaultColumns: ['code', 'discountType', 'duration', 'active', 'timesRedeemed', 'maxRedemptions', 'validUntil'],
    description: 'Kortingen op abonnementen. Bedragen zijn exclusief btw. Een code werkt alleen als ze actief is en binnen de geldigheid valt.',
    hidden: ({ user }) => (user as { role?: string } | null)?.role !== 'admin',
  },
  access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && typeof data.code === 'string') data.code = data.code.trim().toUpperCase().replace(/\s+/g, '')
        return data
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'code',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          admin: { description: 'Wat de klant invult, bv. LANCERING25. Wordt automatisch in hoofdletters gezet.' },
          validate: (v: unknown) => (typeof v === 'string' && /^[A-Z0-9_-]{3,40}$/i.test(v.trim()) ? true : 'Gebruik 3 tot 40 letters, cijfers, - of _.'),
        },
        { name: 'active', type: 'checkbox', label: 'Actief', defaultValue: true },
      ],
    },
    { name: 'description', type: 'text', label: 'Interne omschrijving', admin: { description: 'Alleen zichtbaar voor admins, bv. "Lanceringsactie november".' } },

    // Korting
    {
      type: 'row',
      fields: [
        {
          name: 'discountType',
          type: 'select',
          label: 'Soort korting',
          required: true,
          defaultValue: 'percentage',
          options: [
            { label: 'Percentage (%)', value: 'percentage' },
            { label: 'Vast bedrag (€ excl. btw)', value: 'fixed' },
          ],
        },
        {
          name: 'percentage',
          type: 'number',
          label: 'Percentage',
          min: 1,
          max: 100,
          admin: { condition: (_, s) => s?.discountType === 'percentage', description: '1 tot 100.' },
          validate: (v: unknown, { siblingData }: { siblingData: { discountType?: string } }) =>
            siblingData?.discountType !== 'percentage' || (typeof v === 'number' && v >= 1 && v <= 100) ? true : 'Vul een percentage tussen 1 en 100 in.',
        },
        {
          name: 'amount',
          type: 'number',
          label: 'Bedrag (€ excl. btw)',
          min: 0.01,
          admin: { condition: (_, s) => s?.discountType === 'fixed', description: 'Per betaling. Nooit meer dan de prijs zelf.' },
          validate: (v: unknown, { siblingData }: { siblingData: { discountType?: string } }) =>
            siblingData?.discountType !== 'fixed' || (typeof v === 'number' && v > 0) ? true : 'Vul een bedrag in.',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'duration',
          type: 'select',
          label: 'Hoe lang geldt de korting?',
          required: true,
          defaultValue: 'once',
          options: [
            { label: 'Alleen de eerste betaling', value: 'once' },
            { label: 'Een aantal betalingen', value: 'repeating' },
            { label: 'Altijd (elke verlenging)', value: 'forever' },
          ],
        },
        {
          name: 'durationPayments',
          type: 'number',
          label: 'Aantal betalingen met korting',
          min: 2,
          admin: { condition: (_, s) => s?.duration === 'repeating', description: 'Inclusief de eerste betaling. Bv. 3 bij maandelijks = 3 maanden korting.' },
          validate: (v: unknown, { siblingData }: { siblingData: { duration?: string } }) =>
            siblingData?.duration !== 'repeating' || (typeof v === 'number' && v >= 2) ? true : 'Minstens 2 betalingen.',
        },
      ],
    },

    // Geldigheid
    {
      type: 'row',
      fields: [
        { name: 'validFrom', type: 'date', label: 'Geldig vanaf', admin: { date: { pickerAppearance: 'dayAndTime' }, description: 'Leeg = meteen.' } },
        { name: 'validUntil', type: 'date', label: 'Geldig tot en met', admin: { date: { pickerAppearance: 'dayAndTime' }, description: 'Leeg = geen einddatum.' } },
      ],
    },

    // Gebruik
    {
      type: 'row',
      fields: [
        { name: 'maxRedemptions', type: 'number', label: 'Maximaal aantal keer in totaal', min: 1, admin: { description: 'Leeg = onbeperkt.' } },
        { name: 'maxPerUser', type: 'number', label: 'Maximaal per gebruiker', min: 1, defaultValue: 1, admin: { description: 'Leeg = onbeperkt.' } },
      ],
    },

    // Voor wie
    {
      type: 'row',
      fields: [
        {
          name: 'audience',
          type: 'select',
          label: 'Voor wie',
          defaultValue: 'all',
          options: [
            { label: 'Iedereen', value: 'all' },
            { label: 'Alleen salons & academies', value: 'trainer' },
            { label: 'Alleen merken & leveranciers', value: 'brand' },
          ],
        },
        { name: 'newCustomersOnly', type: 'checkbox', label: 'Alleen nieuwe klanten', defaultValue: false, admin: { description: 'Niet geldig voor wie al eens betaald heeft.' } },
      ],
    },
    { name: 'tiers', type: 'select', hasMany: true, label: 'Alleen voor deze formules', options: TIER_OPTIONS, admin: { description: 'Leeg = alle formules.' } },
    {
      name: 'billingCycles',
      type: 'select',
      hasMany: true,
      label: 'Alleen bij deze facturatie',
      options: [
        { label: 'Jaarlijks', value: 'yearly' },
        { label: 'Maandelijks', value: 'monthly' },
      ],
      admin: { description: 'Leeg = jaarlijks en maandelijks.' },
    },

    // Statistiek
    {
      name: 'timesRedeemed',
      type: 'number',
      label: 'Aantal keer gebruikt',
      defaultValue: 0,
      admin: { readOnly: true, position: 'sidebar', description: 'Betaalde inwisselingen. Wordt automatisch bijgehouden.' },
    },
    {
      name: 'totalDiscountGiven',
      type: 'number',
      label: 'Totaal gegeven korting (€ excl. btw)',
      defaultValue: 0,
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'redemptions',
      type: 'join',
      label: 'Gebruik',
      collection: 'discount-redemptions',
      on: 'discountCode',
      admin: { defaultColumns: ['user', 'status', 'tier', 'discountAmount', 'createdAt'] },
    },
  ],
}
