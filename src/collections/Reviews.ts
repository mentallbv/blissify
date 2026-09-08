import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access'

const adminField = ({ req }: { req: { user?: unknown } }) => (req.user as { role?: string } | null)?.role === 'admin'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'reviewerName',
    defaultColumns: ['reviewerName', 'course', 'rating', 'status', 'createdAt'],
    group: 'Inhoud',
    description: 'Beoordelingen met bevestigd e-mailadres. Alleen goedgekeurde reviews verschijnen op de website.',
  },
  access: {
    read: ({ req }) => ((req.user as { role?: string } | null)?.role === 'admin' ? true : { status: { equals: 'approved' } }),
    create: () => false,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'course', type: 'relationship', relationTo: 'courses', required: true, index: true },
    { name: 'reviewerName', type: 'text', required: true, label: 'Naam' },
    {
      name: 'reviewerEmail',
      type: 'email',
      required: true,
      label: 'E-mailadres',
      access: { read: adminField, update: adminField },
    },
    {
      name: 'emailFingerprint',
      type: 'text',
      required: true,
      index: true,
      admin: { hidden: true },
      access: { read: adminField, update: adminField },
    },
    {
      name: 'submissionKey',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { hidden: true },
      access: { read: adminField, update: adminField },
    },
    { name: 'rating', type: 'number', required: true, min: 1, max: 5 },
    { name: 'body', type: 'textarea', required: true, minLength: 20, maxLength: 2000, label: 'Review' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'awaiting_verification',
      index: true,
      options: [
        { label: 'Wacht op e-mailverificatie', value: 'awaiting_verification' },
        { label: 'Wacht op goedkeuring', value: 'pending' },
        { label: 'Goedgekeurd', value: 'approved' },
        { label: 'Afgewezen', value: 'rejected' },
      ],
    },
    { name: 'verifiedAt', type: 'date', admin: { readOnly: true } },
    { name: 'verificationSentAt', type: 'date', admin: { readOnly: true } },
    { name: 'verificationExpiresAt', type: 'date', admin: { readOnly: true } },
    {
      name: 'verificationTokenHash',
      type: 'text',
      admin: { hidden: true },
      access: { read: adminField, update: adminField },
    },
  ],
}
