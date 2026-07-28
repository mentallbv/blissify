import type { Field, GlobalConfig } from 'payload'
import { isAdmin } from '@/access'

const audienceFields: Field[] = [
  {
    name: 'intro',
    type: 'group',
    fields: [
      { name: 'eyebrow', type: 'text' },
      { name: 'title', type: 'text' },
      { name: 'subtitle', type: 'textarea' },
    ],
  },
  {
    name: 'tiers',
    type: 'array',
    label: 'Abonnementen',
    fields: [
      { name: 'key', type: 'text', required: true },
      { name: 'name', type: 'text', required: true },
      { name: 'tagline', type: 'text' },
      { name: 'annualPrice', type: 'number', required: true, min: 0, admin: { description: 'Jaarprijs in euro, exclusief de maandelijkse toeslag.' } },
      { name: 'desc', type: 'textarea' },
      { name: 'recommended', type: 'checkbox', defaultValue: false },
      { name: 'features', type: 'array', fields: [{ name: 'feature', type: 'text', required: true }] },
    ],
  },
  {
    name: 'comparison',
    type: 'group',
    label: 'Volledige vergelijking',
    fields: [
      { name: 'col1', type: 'text' },
      { name: 'col2', type: 'text' },
      { name: 'col3', type: 'text' },
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
      { name: 'title', type: 'text' },
      { name: 'body', type: 'textarea' },
      { name: 'buttonLabel', type: 'text' },
      { name: 'buttonUrl', type: 'text' },
    ],
  },
]

/**
 * Single source of truth for both subscription ladders, billing cadence and
 * trial rules. Legacy trainer fields remain hidden temporarily so existing
 * content can be migrated without destructive schema changes.
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
      name: 'billing',
      type: 'group',
      label: 'Facturatie en proefperiode',
      fields: [
        { name: 'trialEnabled', type: 'checkbox', defaultValue: true, label: 'Gratis proefperiode inschakelen' },
        { name: 'trialDays', type: 'number', defaultValue: 7, min: 0, max: 90, label: 'Aantal proefdagen' },
        { name: 'monthlyEnabled', type: 'checkbox', defaultValue: true, label: 'Maandelijks betalen toestaan' },
        { name: 'monthlyMarkupPercent', type: 'number', defaultValue: 10, min: 0, max: 100, label: 'Toeslag bij maandbetaling (%)' },
        {
          name: 'monthlyCommitment',
          type: 'select',
          defaultValue: 'annual',
          label: 'Looptijd bij maandbetaling',
          options: [
            { label: '12 maanden verplicht, maandelijks betaald', value: 'annual' },
            { label: 'Maandelijks opzegbaar', value: 'cancel_anytime' },
          ],
        },
      ],
    },
    {
      name: 'opleiders',
      type: 'group',
      label: 'Prijzen voor Opleiders',
      fields: audienceFields,
    },
    {
      name: 'brands',
      type: 'group',
      label: 'Prijzen voor Merken & Leveranciers',
      fields: audienceFields,
    },
    {
      name: 'intro',
      type: 'group',
      admin: { hidden: true },
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
      admin: { hidden: true },
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
      admin: { hidden: true },
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
      admin: { hidden: true },
      fields: [
        { name: 'title', type: 'text', defaultValue: 'Jouw praktijk begint hier.' },
        { name: 'body', type: 'textarea', defaultValue: 'Sluit je aan bij 124 opleiders die hun bereik uitbreiden via Blissify.' },
        { name: 'buttonLabel', type: 'text', defaultValue: 'Bied mijn opleidingen aan' },
        { name: 'buttonUrl', type: 'text', defaultValue: '/inloggen' },
      ],
    },
  ],
}
