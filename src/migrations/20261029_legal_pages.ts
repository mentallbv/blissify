import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-vercel-postgres'

/**
 * Privacybeleid and Cookiebeleid as editable CMS pages (admin → Pages), linked
 * from the footer. Placeholder text until the lawyer's texts arrive. Idempotent:
 * an existing page with the slug is left alone.
 */
const paragraph = (text: string) => ({
  type: 'paragraph',
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  children: [{ type: 'text', version: 1, text, detail: 0, format: 0, mode: 'normal', style: '' }],
})

const PAGES = [
  { slug: 'privacybeleid', title: 'Privacybeleid', intro: 'Hoe Blissify omgaat met jouw persoonsgegevens.' },
  { slug: 'cookiebeleid', title: 'Cookiebeleid', intro: 'Welke cookies Blissify gebruikt en waarom.' },
]

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  for (const p of PAGES) {
    const existing = await payload.find({ collection: 'pages', where: { slug: { equals: p.slug } }, limit: 1, depth: 0 })
    if (existing.docs.length) continue
    await payload.create({
      collection: 'pages',
      data: {
        title: p.title,
        slug: p.slug,
        hero: { eyebrow: 'Juridisch', title: p.title, subtitle: p.intro },
        blocks: [
          {
            blockType: 'richText',
            content: {
              root: {
                type: 'root',
                version: 1,
                direction: 'ltr',
                format: '',
                indent: 0,
                children: [paragraph('Deze tekst wordt binnenkort aangevuld. Heb je intussen een vraag? Neem gerust contact met ons op.')],
              },
            },
          },
        ],
        seo: { title: p.title, description: p.intro },
      } as never,
    })
  }
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.delete({ collection: 'pages', where: { slug: { in: PAGES.map((p) => p.slug) } } })
}
