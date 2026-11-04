import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { checkVies, normalizeVatNumber } from '@/lib/vat'

const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/**
 * PATCH /api/billing - invoice details of the logged-in opleider/merk.
 * A VAT number is checked against VIES: valid → `vatVerifiedAt` (needed for
 * reverse charge), invalid → refused, VIES down → saved unverified.
 */
export async function PATCH(req: Request) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: await getHeaders() })
    if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })

    const body = (await req.json()) as Record<string, unknown>
    const billingCompanyName = str(body.billingCompanyName)
    const billingStreet = str(body.billingStreet)
    const billingPostalCode = str(body.billingPostalCode, 20)
    const billingCity = str(body.billingCity, 100)
    const billingCountry = ['BE', 'NL', 'EU'].includes(String(body.billingCountry)) ? String(body.billingCountry) : ''
    const vatNumber = normalizeVatNumber(str(body.vatNumber, 30))
    const chamberOfCommerceNumber = str(body.chamberOfCommerceNumber, 30)

    if (!billingCompanyName || !billingStreet || !billingPostalCode || !billingCity || !billingCountry) {
      return NextResponse.json({ error: 'Vul bedrijfsnaam, adres en land in.' }, { status: 400 })
    }
    if (!vatNumber && !chamberOfCommerceNumber) {
      return NextResponse.json({ error: 'Vul je btw-nummer en/of ondernemingsnummer in.' }, { status: 400 })
    }
    if (billingCountry === 'EU' && !vatNumber) {
      return NextResponse.json({ error: 'Voor een ander EU-land is een btw-nummer nodig.' }, { status: 400 })
    }
    if (vatNumber && billingCountry !== 'EU' && !vatNumber.startsWith(billingCountry)) {
      return NextResponse.json({ error: `Een btw-nummer uit ${billingCountry === 'BE' ? 'België' : 'Nederland'} begint met ${billingCountry}.` }, { status: 400 })
    }

    const current = user as { vatNumber?: string | null; vatVerifiedAt?: string | null }
    let vatVerifiedAt: string | null = normalizeVatNumber(current.vatNumber) === vatNumber ? current.vatVerifiedAt || null : null
    let viesUnavailable = false
    if (vatNumber && !vatVerifiedAt) {
      const vies = await checkVies(vatNumber)
      if (vies && !vies.valid) {
        return NextResponse.json({ error: 'Dit btw-nummer is niet geldig volgens de Europese VIES-controle. Controleer het nummer.' }, { status: 400 })
      }
      if (vies?.valid) vatVerifiedAt = new Date().toISOString()
      else viesUnavailable = true
    }

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        billingCompanyName,
        billingStreet,
        billingPostalCode,
        billingCity,
        billingCountry,
        vatNumber: vatNumber || null,
        chamberOfCommerceNumber: chamberOfCommerceNumber || null,
        vatVerifiedAt,
      } as never,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true, vatVerified: Boolean(vatVerifiedAt), viesUnavailable })
  } catch (err) {
    console.error('[billing] save failed', err)
    return NextResponse.json({ error: 'Opslaan is niet gelukt.' }, { status: 500 })
  }
}
