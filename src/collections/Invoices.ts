import type { Access, CollectionConfig } from 'payload'

/**
 * One row per Mollie sales invoice, created by the Mollie webhook after a paid
 * payment (first payment, renewal or upgrade). Mollie holds the official
 * invoice and PDF; this row makes the webhook idempotent (unique payment id)
 * and lets the dashboard list a user's invoices.
 */
const ownOrAdmin: Access = ({ req }) => {
  const user = req.user as { id: number; role?: string } | null
  if (!user) return false
  if (user.role === 'admin') return true
  return { user: { equals: user.id } }
}
const adminOnly: Access = ({ req }) => (req.user as { role?: string } | null)?.role === 'admin'

export const Invoices: CollectionConfig = {
  slug: 'invoices',
  labels: { singular: 'Factuur', plural: 'Facturen' },
  admin: {
    useAsTitle: 'invoiceNumber',
    defaultColumns: ['invoiceNumber', 'user', 'totalAmount', 'vatRate', 'issuedAt'],
    description: 'Automatisch aangemaakt via Mollie na elke betaling.',
  },
  access: { read: ownOrAdmin, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    // Not required: invoices outlive a deleted account (Mollie keeps the official copy).
    { name: 'user', type: 'relationship', relationTo: 'users', index: true },
    { name: 'molliePaymentId', type: 'text', required: true, unique: true },
    { name: 'mollieInvoiceId', type: 'text', required: true },
    { name: 'invoiceNumber', type: 'text' },
    { name: 'description', type: 'text' },
    { name: 'totalAmount', type: 'number', label: 'Totaal incl. btw' },
    { name: 'vatAmount', type: 'number', label: 'Btw' },
    { name: 'netAmount', type: 'number', label: 'Excl. btw' },
    { name: 'vatRate', type: 'number', label: 'Btw-tarief (%)' },
    { name: 'reverseCharge', type: 'checkbox', defaultValue: false, label: 'Btw verlegd' },
    { name: 'isEInvoice', type: 'checkbox', defaultValue: false, label: 'Via Peppol' },
    { name: 'issuedAt', type: 'date' },
  ],
}
