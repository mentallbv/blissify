import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access'

/**
 * Samenwerkingen opleider ↔ merk (client round 2, section 5). A Partner
 * Ultimate brand sends a request, the opleider approves or declines, and either
 * side can end it later. Dashboard users never touch this collection directly:
 * /api/dashboard/collaborations checks ownership and plan, then writes with
 * overrideAccess. Whether an approved collaboration is shown publicly also
 * depends on the brand still having an active Partner Ultimate plan (see
 * src/lib/collaborations.ts), so a downgrade hides it without losing it.
 */
export const Collaborations: CollectionConfig = {
  slug: 'collaborations',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['brand', 'trainer', 'status', 'updatedAt'],
    group: 'Inhoud',
    description: 'Samenwerkingen tussen merken (Partner Ultimate) en opleiders.',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'brand', type: 'relationship', relationTo: 'brands', required: true, index: true, label: 'Merk' },
    { name: 'trainer', type: 'relationship', relationTo: 'trainers', required: true, index: true, label: 'Opleider' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Aangevraagd', value: 'pending' },
        { label: 'Goedgekeurd', value: 'approved' },
        { label: 'Geweigerd', value: 'declined' },
        { label: 'Beëindigd', value: 'removed' },
      ],
    },
    {
      name: 'endedBy',
      type: 'select',
      label: 'Beëindigd door',
      options: [
        { label: 'Merk', value: 'brand' },
        { label: 'Opleider', value: 'trainer' },
      ],
    },
    { name: 'respondedAt', type: 'date', label: 'Beantwoord op' },
  ],
}
