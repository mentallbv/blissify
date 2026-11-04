import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getSalesInvoice } from '@/lib/mollie'

/**
 * GET /api/invoices/:id/pdf - redirects to the PDF Mollie generated. The link
 * is fetched fresh because Mollie's PDF links expire; access is checked on our
 * Invoices row (own invoices only, admins all).
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await getHeaders() })
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 })

  const row = await payload.findByID({ collection: 'invoices', id: id as never, user, overrideAccess: false }).catch(() => null)
  if (!row) return NextResponse.json({ error: 'Factuur niet gevonden.' }, { status: 404 })

  try {
    const invoice = await getSalesInvoice((row as { mollieInvoiceId: string }).mollieInvoiceId)
    const href = invoice._links?.pdfLink?.href
    if (!href) return NextResponse.json({ error: 'De PDF wordt nog aangemaakt. Probeer het over een minuut opnieuw.' }, { status: 409 })
    return NextResponse.redirect(href)
  } catch (err) {
    console.error('[invoice] pdf lookup failed', err)
    return NextResponse.json({ error: 'De factuur is tijdelijk niet beschikbaar.' }, { status: 502 })
  }
}
