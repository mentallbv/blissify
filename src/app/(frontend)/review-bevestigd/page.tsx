import { SiteChrome } from '@/components/site/SiteChrome'
import { ButtonLink } from '@/components/ui'

export default async function ReviewConfirmedPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const content =
    status === 'success'
      ? ['Bedankt, je e-mailadres is bevestigd.', 'Je review wordt nu door Blissify beoordeeld en verschijnt na goedkeuring.']
      : status === 'already'
        ? ['Deze review is al bevestigd.', 'De review staat klaar voor controle of is al gepubliceerd.']
        : status === 'expired'
          ? ['Deze verificatielink is verlopen.', 'Dien je review opnieuw in om een nieuwe link te ontvangen.']
          : ['Deze verificatielink is ongeldig.', 'Controleer of je de volledige link uit de e-mail hebt geopend.']
  return (
    <SiteChrome>
      <section className="bl-container" style={{ paddingTop: 120, paddingBottom: 140, textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 48, color: 'var(--text-brand)', margin: 0 }}>{content[0]}</h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', maxWidth: 560, margin: '18px auto 28px' }}>{content[1]}</p>
        <ButtonLink href="/opleidingen" variant="primary">Bekijk opleidingen</ButtonLink>
      </section>
    </SiteChrome>
  )
}
