/**
 * VAT at checkout. Blissify is a Belgian supplier selling B2B subscriptions:
 *   BE customer                         → 21% Belgian VAT
 *   other EU country, valid VAT number  → 0%, reverse charge ("btw verlegd")
 *   other EU country, no valid number   → 21% (treated as not VAT-registered)
 * Prices in the Pricing global are always excl. btw; what Mollie charges is the
 * total incl. btw, and the invoice is created from that same total.
 * To confirm with the accountant (notes/PAYMENT_PEPPOL.md).
 */
export const BE_VAT_RATE = 21

export const REVERSE_CHARGE_MEMO = 'Btw verlegd – artikel 196 Btw-richtlijn 2006/112/EG. Btw te voldoen door de afnemer.'

export type VatCustomer = { billingCountry?: string | null; vatNumber?: string | null; vatVerifiedAt?: string | null }

export type VatQuote = { rate: number; reverseCharge: boolean; net: string; vat: string; gross: string }

const round2 = (n: number) => Math.round(n * 100) / 100

/** Normalised VAT number: uppercase, no spaces/dots/dashes, e.g. "BE0123456789". */
export function normalizeVatNumber(raw: string | null | undefined): string {
  return String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
}

/** ISO country the invoice is addressed to: BE/NL directly, "EU" from the VAT prefix. */
export function invoiceCountry(c: VatCustomer): string | null {
  if (c.billingCountry === 'BE' || c.billingCountry === 'NL') return c.billingCountry
  if (c.billingCountry === 'EU') {
    const prefix = normalizeVatNumber(c.vatNumber).slice(0, 2)
    // Greece uses "EL" in VAT numbers but "GR" as ISO code.
    return /^[A-Z]{2}$/.test(prefix) ? (prefix === 'EL' ? 'GR' : prefix) : null
  }
  return null
}

export function isReverseCharge(c: VatCustomer): boolean {
  const country = invoiceCountry(c)
  return Boolean(country && country !== 'BE' && normalizeVatNumber(c.vatNumber) && c.vatVerifiedAt)
}

export function vatRateFor(c: VatCustomer): number {
  return isReverseCharge(c) ? 0 : BE_VAT_RATE
}

/** Price excl. btw → what we charge. */
export function quote(net: string | number, c: VatCustomer): VatQuote {
  const rate = vatRateFor(c)
  const n = round2(Number(net))
  const vat = round2((n * rate) / 100)
  return { rate, reverseCharge: rate === 0, net: n.toFixed(2), vat: vat.toFixed(2), gross: (n + vat).toFixed(2) }
}

/**
 * Checks a VAT number against the EU VIES service. Returns null when VIES is
 * unreachable (it often is) so the caller can decide; never throws.
 */
export async function checkVies(vatNumber: string): Promise<{ valid: boolean; name?: string } | null> {
  const v = normalizeVatNumber(vatNumber)
  const cc = v.slice(0, 2)
  const num = v.slice(2)
  if (!/^[A-Z]{2}$/.test(cc) || !num) return { valid: false }
  try {
    const res = await fetch(`https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${cc}/vat/${num}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { isValid?: boolean; valid?: boolean; name?: string; userError?: string }
    if (data.userError && data.userError !== 'VALID' && data.userError !== 'INVALID') return null
    return { valid: Boolean(data.isValid ?? data.valid), name: data.name && data.name !== '---' ? data.name : undefined }
  } catch {
    return null
  }
}

export const formatEuro = (v: string | number) =>
  `€ ${Number(v).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export type BillingUser = VatCustomer & {
  email: string
  name?: string | null
  billingCompanyName?: string | null
  billingStreet?: string | null
  billingPostalCode?: string | null
  billingCity?: string | null
  chamberOfCommerceNumber?: string | null
}

/** Everything an invoice needs. Missing → checkout asks for it first. */
export function billingComplete(u: BillingUser): boolean {
  return Boolean(
    u.billingCompanyName && u.billingStreet && u.billingPostalCode && u.billingCity && invoiceCountry(u) &&
      (normalizeVatNumber(u.vatNumber) || u.chamberOfCommerceNumber),
  )
}
