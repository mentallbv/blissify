import type { Payload } from 'payload'
import { createPaidSalesInvoice, planLabel, type MolliePayment, type PlanTier, type SalesInvoice } from '@/lib/mollie'
import { invoiceCountry, isReverseCharge, normalizeVatNumber, REVERSE_CHARGE_MEMO, type BillingUser } from '@/lib/vat'
import { sendEmail, emailHtml, ADMIN_EMAIL } from '@/lib/email'

/** Countries Mollie can deliver Peppol e-invoices to (merchant and recipient). */
const PEPPOL_COUNTRIES = new Set(['BE', 'NL', 'DE'])

/**
 * Creates the Mollie sales invoice for a paid payment, once (the Invoices row
 * with a unique payment id makes Mollie's webhook retries harmless).
 * Business with a VAT number in BE/NL/DE → Peppol e-invoice; Mollie emails the
 * PDF in every case. Never throws: a failed invoice must not undo a payment,
 * it is reported to the admin instead.
 */
export async function invoicePayment(opts: {
  payload: Payload
  user: BillingUser & { id: number }
  payment: MolliePayment
  tier: PlanTier
  periodStart: Date
  periodEnd: Date
  proratedCredit?: number
}): Promise<void> {
  const { payload, user, payment } = opts
  try {
    const existing = await payload.find({ collection: 'invoices', where: { molliePaymentId: { equals: payment.id } }, limit: 1, overrideAccess: true })
    if (existing.docs.length) return

    const gross = payment.amount?.value
    const country = invoiceCountry(user)
    if (!gross || Number(gross) <= 0 || !country || !user.billingStreet || !user.billingPostalCode || !user.billingCity) {
      throw new Error(`facturatiegegevens of bedrag ontbreken (bedrag ${gross || '-'}, land ${country || '-'})`)
    }

    const reverseCharge = isReverseCharge(user)
    const vatRate = reverseCharge ? 0 : 21
    const vatNumber = normalizeVatNumber(user.vatNumber) || undefined
    const fmt = (d: Date) => d.toLocaleDateString('nl-BE')
    const description = `Blissify abonnement ${planLabel(opts.tier)} · ${fmt(opts.periodStart)} – ${fmt(opts.periodEnd)}`
    const memo = [
      reverseCharge ? REVERSE_CHARGE_MEMO : '',
      opts.proratedCredit && opts.proratedCredit > 0
        ? `Verrekend tegoed van het vorige abonnement: € ${opts.proratedCredit.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} excl. btw.`
        : '',
    ].filter(Boolean).join('\n')

    const base = {
      paymentId: payment.id,
      recipientIdentifier: `user-${user.id}`,
      recipient: {
        type: 'business' as const,
        email: user.email,
        organizationName: user.billingCompanyName || user.name || user.email,
        vatNumber,
        organizationNumber: vatNumber ? undefined : user.chamberOfCommerceNumber || undefined,
        streetAndNumber: user.billingStreet,
        postalCode: user.billingPostalCode,
        city: user.billingCity,
        country,
        locale: country === 'NL' ? ('nl_NL' as const) : country === 'BE' ? ('nl_BE' as const) : ('en_GB' as const),
      },
      description,
      grossAmount: gross,
      vatRate,
      memo,
      emailDetails: {
        subject: 'Je factuur van Blissify',
        body: `Beste ${user.name || ''},\n\nIn bijlage vind je de factuur voor je Blissify-abonnement (${planLabel(opts.tier)}). Het bedrag is al betaald.\n\nMet vriendelijke groet,\nBlissify`,
      },
      metadata: { userId: user.id, paymentId: payment.id },
    }

    const wantsPeppol = Boolean(vatNumber && PEPPOL_COUNTRIES.has(country))
    let invoice: SalesInvoice
    try {
      invoice = await createPaidSalesInvoice({ ...base, isEInvoice: wantsPeppol })
    } catch (err) {
      // E-invoicing not enabled in Mollie (yet) → still issue the PDF invoice.
      if (!wantsPeppol) throw err
      console.error('[invoice] e-invoice refused, retrying as PDF', err)
      invoice = await createPaidSalesInvoice({ ...base, isEInvoice: false })
    }

    await payload.create({
      collection: 'invoices',
      data: {
        user: user.id,
        molliePaymentId: payment.id,
        mollieInvoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber || null,
        description,
        totalAmount: Number(invoice.totalAmount?.value ?? gross),
        vatAmount: invoice.totalVatAmount ? Number(invoice.totalVatAmount.value) : null,
        netAmount: invoice.discountedSubtotalAmount ? Number(invoice.discountedSubtotalAmount.value) : null,
        vatRate,
        reverseCharge,
        isEInvoice: Boolean(invoice.isEInvoice),
        issuedAt: invoice.issuedAt || new Date().toISOString(),
      } as never,
      overrideAccess: true,
    })
  } catch (err) {
    console.error('[invoice] creation failed', payment.id, err)
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `Factuur niet aangemaakt - ${user.email}`,
      html: emailHtml([
        `De betaling ${payment.id} (${payment.amount?.value || '?'} EUR) is gelukt, maar de factuur kon niet automatisch worden aangemaakt.`,
        `Reden: ${err instanceof Error ? err.message.slice(0, 300) : 'onbekend'}`,
        'Maak de factuur manueel aan in Mollie (Facturen) of controleer de facturatiegegevens van de klant.',
      ]),
    }).catch(() => {})
  }
}
