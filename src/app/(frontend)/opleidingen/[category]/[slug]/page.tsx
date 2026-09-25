import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteChrome } from '@/components/site/SiteChrome'
import { Eyebrow, Avatar, TypeBadge, Button, Tag } from '@/components/ui'
import { RequestInfoButton } from '@/components/site/RequestInfoButton'
import { RegisterCourseButton } from '@/components/site/RegisterCourseButton'
import { TrackedLink } from '@/components/site/TrackedLink'
import { ReviewForm } from '@/components/site/ReviewForm'
import { CourseCard } from '@/components/ui/CourseCard'
import { TrackPageView } from '@/components/site/TrackPageView'
import { getApprovedCourseReviews, getCourseBySlug, getCourseCards, getCourseTierContext } from '@/lib/data'
import { FALLBACK_COURSES } from '@/lib/fallback'
import { formatPrice, formatDuration, formatFormat, courseLocation } from '@/lib/format'
import { isCitySlug, cityName } from '@/lib/cities'
import { CATEGORY_CONTENT } from '@/lib/categories'
import { CityLanding } from '@/components/site/CityLanding'
import { publicMediaUrl } from '@/lib/media'
import { RichTextContent } from '@/components/site/RichTextContent'
import type { Course, Category, Brand, Trainer } from '@/payload-types'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ category: string; slug: string }> }


type DetailView = {
  title: string
  category: string
  provider: string
  providerSlug: string
  providerType: 'brand' | 'trainer'
  providerEmail: string
  location: string
  price: string
  format: string
  chips: { icon: string; label: string }[]
  keywords: string[]
  about: string[]
  courseType: string
  languages: string
  level: string
  maximumParticipants?: number
  privateOneToOne: boolean
  modelRequired: string
  lunchProvided: string
  startDates: { date: string; endDate?: string; startTime?: string; endTime?: string; spotsAvailable?: number }[]
  contact: { email?: string; website?: string; instagram?: string; facebook?: string; tiktok?: string }
  description: unknown
  targetAudience: string[]
  practical: string[]
  focus: string[]
  accreditation: string
}

const TARGET_AUDIENCE_LABEL: Record<string, string> = {
  'beginner-friendly': 'Beginner friendly',
  intermediate: 'Intermediate',
  'expert-advanced': 'Expert / Advanced',
  'professional-only': 'Professional only',
  'startende-ondernemer': 'Startende ondernemer',
}

const PRACTICAL_LABEL: Record<string, string> = {
  online: 'Online',
  praktijkopleiding: 'Praktijkopleiding',
  'een-dag': '1-daagse opleiding',
  'meerdere-dagen': 'Meerdere dagen',
  'op-locatie': 'Op locatie',
  'kleine-groepen': 'Kleine groepen (<12)',
}

const FOCUS_LABEL: Record<string, string> = {
  huidverbeterend: 'Huidverbeterend',
  'medisch-esthetisch': 'Medisch-esthetisch',
  holistisch: 'Holistisch',
  ontspannend: 'Ontspannend',
  cosmetisch: 'Cosmetisch',
  therapeutisch: 'Therapeutisch',
  energetisch: 'Energetisch',
}

const labelsFor = (values: string[] | null | undefined, map: Record<string, string>): string[] =>
  (values || []).map((value) => map[value] || value)

function viewFromCourse(c: Course): DetailView {
  const details = c as Course & {
    courseType?: string
    participants?: { maximum?: number; privateOneToOne?: boolean }
    modelRequired?: string
    lunchProvided?: string
    startDates?: DetailView['startDates']
    contact?: DetailView['contact']
  }
  const cat = typeof c.category === 'object' ? (c.category as Category) : null
  const brand = typeof c.brand === 'object' ? (c.brand as Brand) : null
  const trainer = typeof c.trainer === 'object' ? (c.trainer as Trainer) : null
  const dur = formatDuration(c.duration)
  const fmt = formatFormat(c.format)
  // Icon travels with its chip so a missing value (e.g. no duration) can never
  // shift the icons out of alignment with their labels.
  const chips = [
    { icon: 'ti-clock', label: dur },
    { icon: 'ti-device-laptop', label: fmt },
    { icon: 'ti-map-pin', label: courseLocation(c) },
    { icon: 'ti-certificate', label: c.certificate ? 'Certificaat inbegrepen' : 'Geen certificaat' },
  ].filter((chip): chip is { icon: string; label: string } => Boolean(chip.label))
  return {
    title: c.title,
    category: cat?.name || 'Opleiding',
    provider: brand?.name || trainer?.displayName || 'Blissify-opleider',
    providerSlug: brand?.slug || trainer?.slug || '',
    providerType: brand ? 'brand' : 'trainer',
    providerEmail: details.contact?.email || brand?.email || trainer?.email || '',
    location: courseLocation(c),
    price: formatPrice(c.price),
    format: [dur, fmt].filter(Boolean).join(' · ') || 'Op aanvraag',
    chips,
    keywords: (c.tags || []).slice(0, 4),
    about: [c.shortDescription].filter(Boolean) as string[],
    courseType: details.courseType || '',
    languages: (c.language || []).map((language) => ({ nl: 'Nederlands', fr: 'Frans', en: 'Engels' }[language] || language)).join(', '),
    level: ({ beginner: 'Beginner', gevorderd: 'Gevorderd', expert: 'Expert', all: 'Alle niveaus' } as Record<string, string>)[c.level || ''] || '',
    maximumParticipants: details.participants?.maximum,
    privateOneToOne: Boolean(details.participants?.privateOneToOne),
    modelRequired: details.modelRequired || 'not_applicable',
    lunchProvided: details.lunchProvided || 'not_applicable',
    startDates: details.startDates || [],
    contact: details.contact || {},
    description: c.description,
    targetAudience: labelsFor(c.targetAudience, TARGET_AUDIENCE_LABEL),
    practical: labelsFor(c.practical, PRACTICAL_LABEL),
    focus: labelsFor(c.focus, FOCUS_LABEL),
    accreditation: c.accreditation || '',
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category, slug } = await params
  // City landing page
  if (isCitySlug(slug)) {
    const cName = cityName(slug)!
    const cat = CATEGORY_CONTENT[category]
    const catName = cat?.name || category
    return {
      title: `Opleiding ${catName.toLowerCase()} in ${cName} - Cursussen vergelijken | Blissify`,
      description: `Ontdek ${catName.toLowerCase()} opleidingen in ${cName}. Dag, avond of weekend - vergelijk lesmomenten en certificaatinformatie. Schrijf in via de aanbieder.`,
    }
  }
  const { course } = await getCourseBySlug(slug)
  const fb = FALLBACK_COURSES.find((c) => c.slug === slug)
  const title = course?.title || fb?.title
  if (!title) return {}
  return { title: `${title} | Blissify`, description: course?.shortDescription || undefined }
}

export default async function CourseDetailPage({ params }: Params) {
  const { category, slug } = await params

  // ── City landing page (e.g. /opleidingen/massage/antwerpen) ──
  if (isCitySlug(slug)) {
    const cName = cityName(slug)!
    const cat = CATEGORY_CONTENT[category]
    const catName = cat?.name || category
    const { cards, total } = await getCourseCards({ categorySlug: category, city: slug, limit: 24 })
    return (
      <CityLanding
        categoryName={catName}
        categorySlug={category}
        cityName={cName}
        cards={cards}
        total={total}
        intro={`Professionele ${catName.toLowerCase()} opleidingen in ${cName} en omgeving. Filter op jouw lesmoment en certificaatinformatie, en vraag rechtstreeks informatie aan bij de opleider.`}
      />
    )
  }

  const { course } = await getCourseBySlug(slug)
  const fb = FALLBACK_COURSES.find((c) => c.slug === slug)
  if (!course && !fb) notFound()

  const v: DetailView = course
    ? viewFromCourse(course)
    : {
        title: fb!.title,
        category: fb!.category,
        provider: fb!.provider,
        providerSlug: fb!.providerSlug,
        providerType: 'trainer',
        providerEmail: '',
        location: fb!.location,
        price: fb!.price,
        format: fb!.format,
        chips: [
          { icon: 'ti-device-laptop', label: fb!.format },
          { icon: 'ti-map-pin', label: fb!.location },
          { icon: 'ti-certificate', label: 'Certificaat inbegrepen' },
          { icon: 'ti-users', label: 'Max 12 deelnemers' },
        ],
        keywords: [],
        about: [],
        courseType: '',
        languages: '',
        level: '',
        privateOneToOne: false,
        modelRequired: 'not_applicable',
        lunchProvided: 'not_applicable',
        description: null,
        targetAudience: [],
        practical: [],
        focus: [],
        accreditation: '',
        startDates: [],
        contact: {},
      }

  const aboutParas = v.about
  // The provider's own description. No invented fallback: an empty description
  // means the section is simply not rendered.
  const descriptionContent = <RichTextContent data={v.description} />

  const courseRef = course ? String(course.id) : slug
  const reviews = course ? await getApprovedCourseReviews(course.id) : []
  const tierContext = course ? await getCourseTierContext(course) : null
  const similarResult = course ? await getCourseCards({ categorySlug: category, limit: 4 }) : { cards: [], total: 0, isFallback: false }
  const similarCourses = similarResult.cards.filter((card) => card.slug !== slug).slice(0, 3)
  const averageRating = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0
  // Registration mode: Brand courses on Partner Professional/Premium (server-set).
  const bookable = Boolean(course && (course as { isBookable?: boolean }).isBookable)
  const coverImg =
    course && typeof (course as { coverImage?: unknown }).coverImage === 'object'
      ? publicMediaUrl((course as { coverImage?: { filename?: string | null; url?: string | null } }).coverImage)
      : null

  return (
    <SiteChrome>
      <div>
      <TrackPageView kind="course" id={courseRef} />
      {/* Hero image band */}
      <div
        style={{
          height: 400,
          background: 'var(--surface-dark)',
          backgroundImage: coverImg ? `url(${coverImg})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="bl-container">
        <div style={{ padding: '20px 0 0', fontFamily: 'var(--font-ui)', fontSize: 'var(--type-xs)', color: 'var(--text-body)' }}>
          <a href="/opleidingen">Opleidingen</a> → {v.category} → {v.title}
        </div>

        <div className="bl-detail-split" style={{ padding: '24px 0 96px' }}>
          {/* Left */}
          <div>
            <Eyebrow tone="accent">{v.category}</Eyebrow>
            {tierContext?.features.hasPremiumBadge ? (
              <div style={{ marginTop: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 'var(--radius-pill)', padding: '5px 11px', background: 'var(--surface-dark)', color: 'var(--blissify-chalk)', fontFamily: 'var(--font-ui)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                  <i className="ti ti-crown" /> Premium
                </span>
              </div>
            ) : null}
            {tierContext?.features.hasProductLaunchHighlighting && (course as { productLaunchHighlighted?: boolean } | null)?.productLaunchHighlighted ? (
              <div style={{ marginTop: 8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 'var(--radius-pill)', padding: '5px 11px', background: 'var(--text-accent)', color: 'white', fontFamily: 'var(--font-ui)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                  <i className="ti ti-rocket" /> Productlancering
                </span>
              </div>
            ) : null}
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 'var(--fw-display-light)',
                fontSize: 48,
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
                color: 'var(--text-brand)',
                margin: '14px 0 10px',
              }}
            >
              {v.title}
            </h1>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-body)', margin: '0 0 18px' }}>
              {v.provider} · {v.location}
            </p>
            {tierContext?.features.hasCoBrandedCourses && (course as { coBrandPartner?: string | null } | null)?.coBrandPartner ? (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-accent)', margin: '-8px 0 18px' }}>
                In samenwerking met {(course as { coBrandPartner?: string }).coBrandPartner}
              </p>
            ) : null}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {v.chips.map((c) => (
                <span
                  key={c.label}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    border: '0.5px solid var(--border-hairline)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '7px 12px',
                    background: 'var(--surface-card)',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 'var(--fw-ui-regular)',
                    fontSize: 13,
                    color: 'var(--text-body)',
                  }}
                >
                  <i className={`ti ${c.icon}`} style={{ fontSize: 16, color: 'var(--text-meta)' }} />
                  {c.label}
                </span>
              ))}
            </div>
            {v.keywords.length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
                {v.keywords.map((k) => (
                  <Tag key={k} as="span">
                    {k}
                  </Tag>
                ))}
              </div>
            ) : null}

            {descriptionContent || aboutParas.length ? (
              <Section title="Over deze opleiding">
                {aboutParas.map((p, i) => (
                  <Para key={i}>{p}</Para>
                ))}
                {descriptionContent}
              </Section>
            ) : null}

            {v.focus.length ? (
              <Section title="Waar ligt de focus?">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {v.focus.map((item) => (
                    <Tag key={item} as="span">{item}</Tag>
                  ))}
                </div>
              </Section>
            ) : null}

            {v.targetAudience.length ? (
              <Section title="Voor wie is deze opleiding bedoeld?">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {v.targetAudience.map((item) => (
                    <Tag key={item} as="span">{item}</Tag>
                  ))}
                </div>
              </Section>
            ) : null}

            <Section title="Praktische informatie">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, maxWidth: 620 }}>
                {[
                  ['Type', ({ practice_training: 'Praktijktraining', online_course: 'Online cursus', live_course: 'Live cursus', coaching: 'Coachingsessie', workshop: 'Workshop', webinar: 'Webinar', event: 'Evenement' } as Record<string, string>)[v.courseType]],
                  ['Taal', v.languages],
                  ['Niveau', v.level],
                  ['Deelnemers', v.privateOneToOne ? 'Privé / één-op-één' : v.maximumParticipants ? `Maximaal ${v.maximumParticipants}` : 'Niet vermeld'],
                  ['Model meenemen', v.modelRequired === 'yes' ? 'Ja' : v.modelRequired === 'no' ? 'Nee' : 'Niet van toepassing'],
                  ['Lunch voorzien', v.lunchProvided === 'yes' ? 'Ja' : v.lunchProvided === 'no' ? 'Nee' : 'Niet van toepassing'],
                  ['Accreditatie / erkenning', v.accreditation],
                ].filter(([, value]) => Boolean(value)).map(([label, value]) => (
                  <div key={label} style={{ border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', padding: 14 }}>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-meta)', marginBottom: 5 }}>{label}</div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-strong)' }}>{value}</div>
                  </div>
                ))}
              </div>
              {v.practical.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                  {v.practical.map((item) => (
                    <Tag key={item} as="span">{item}</Tag>
                  ))}
                </div>
              ) : null}
            </Section>

            {v.startDates.length ? <Section title="Volgende data">
              <div style={{ display: 'flex', flexDirection: 'column', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxWidth: 520 }}>
                {v.startDates.map((item, index) => {
                  const start = new Date(item.date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })
                  const end = item.endDate ? new Date(item.endDate).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
                  return <div key={`${item.date}-${index}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '16px 18px', borderBottom: '0.5px solid var(--border-hairline)', background: 'var(--surface-card)' }}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 15, color: 'var(--text-strong)' }}>
                      {start}{end ? ` – ${end}` : ''}{item.startTime ? ` · ${item.startTime}${item.endTime ? `–${item.endTime}` : ''}` : ''}
                    </span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-accent)', whiteSpace: 'nowrap' }}>
                      {item.spotsAvailable != null ? `${item.spotsAvailable} plaatsen vrij` : 'Plaatsen beschikbaar'}
                    </span>
                  </div>
                })}
              </div>
            </Section> : null}

            {similarCourses.length ? (
              <Section title="Gelijkaardige opleidingen">
                <div className="bl-cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {similarCourses.map((card) => <CourseCard key={card.href} {...card} />)}
                </div>
              </Section>
            ) : null}

            <Section title="Reviews">
              {reviews.length ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <strong style={{ fontFamily: 'var(--display)', fontSize: 28, color: 'var(--text-brand)' }}>{averageRating.toFixed(1).replace('.', ',')}</strong>
                    <span style={{ color: 'var(--blissify-terracotta)' }}>{'★'.repeat(Math.round(averageRating))}{'☆'.repeat(5 - Math.round(averageRating))}</span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)' }}>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
                  </div>
                  <div style={{ display: 'grid', gap: 12, marginBottom: 32 }}>
                    {reviews.map((review) => (
                      <article key={review.id} style={{ border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                          <strong style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-strong)' }}>{review.reviewerName}</strong>
                          <span style={{ color: 'var(--blissify-terracotta)', fontSize: 14 }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                        </div>
                        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.7, color: 'var(--text-body)', margin: 0 }}>{review.body}</p>
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <Para>Er zijn nog geen goedgekeurde reviews voor deze opleiding.</Para>
              )}
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)', margin: '28px 0 16px' }}>Deel jouw ervaring</h3>
              <ReviewForm courseId={courseRef} />
            </Section>
          </div>

          {/* Right - sticky booking card */}
          <div style={{ position: 'sticky', top: 92 }}>
            <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 24 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 40, lineHeight: 1, letterSpacing: '-0.01em', color: 'var(--text-brand)' }}>
                {v.price}
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--type-sm)', color: 'var(--text-body)', margin: '6px 0 20px' }}>
                incl. btw · {v.format}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {bookable ? (
                  <RegisterCourseButton courseId={courseRef} courseTitle={v.title} />
                ) : (
                  <RequestInfoButton
                    courseId={courseRef}
                    courseTitle={v.title}
                    courseSlug={`${category}/${slug}`}
                    providerEmail={v.providerEmail}
                    providerName={v.provider}
                  />
                )}
                <Button variant="ghost" fullWidth>
                  Opleiding opslaan
                </Button>
              </div>
              <div style={{ borderTop: '0.5px solid var(--border-hairline)', marginTop: 24, paddingTop: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
                <Avatar initial={v.provider[0]} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 18, color: 'var(--text-brand)', lineHeight: 1.2 }}>
                    {v.provider}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <TypeBadge type={v.providerType} />
                  </div>
                </div>
              </div>
              {v.providerSlug ? (
                <a href={v.providerType === 'brand' ? `/merken/${v.providerSlug}` : `/opleiders/${v.providerSlug}`} className="bl-textlink" style={{ display: 'inline-block', marginTop: 14 }}>
                  Bekijk {v.providerType === 'brand' ? 'merkprofiel' : 'opleiderprofiel'}
                </a>
              ) : null}
              {Object.values(v.contact).some(Boolean) ? (
                <div style={{ borderTop: '0.5px solid var(--border-hairline)', marginTop: 18, paddingTop: 16, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {v.contact.email ? <a href={`mailto:${v.contact.email}`} aria-label="E-mail"><i className="ti ti-mail" /></a> : null}
                  {v.contact.website ? <TrackedLink kind="course" entityId={courseRef} type="website_click" href={v.contact.website} target="_blank" rel="noreferrer" aria-label="Website"><i className="ti ti-world" /></TrackedLink> : null}
                  {v.contact.instagram ? <TrackedLink kind="course" entityId={courseRef} type="social_click" href={v.contact.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><i className="ti ti-brand-instagram" /></TrackedLink> : null}
                  {v.contact.facebook ? <TrackedLink kind="course" entityId={courseRef} type="social_click" href={v.contact.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><i className="ti ti-brand-facebook" /></TrackedLink> : null}
                  {v.contact.tiktok ? <TrackedLink kind="course" entityId={courseRef} type="social_click" href={v.contact.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok"><i className="ti ti-brand-tiktok" /></TrackedLink> : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      </div>
    </SiteChrome>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ borderTop: '0.5px solid var(--border-hairline)', paddingTop: 28, marginTop: 28 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 28, color: 'var(--text-brand)', margin: '0 0 16px' }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', margin: '0 0 14px', maxWidth: 620 }}>
      {children}
    </p>
  )
}
