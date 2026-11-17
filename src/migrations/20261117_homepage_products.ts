import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-vercel-postgres'

/** Lonne, Nov 2026: the hero intro gives producten & materiaal more weight. Only replaces the untouched 10/2026 text. */
const OLD = 'Vind opleidingen en cursussen, merken en leveranciers, werkruimtes en vacatures voor beauty- en wellnessprofessionals. Alles overzichtelijk samengebracht op één platform, in België en Nederland.'
const NEW = 'Vind opleidingen, professionele producten en materiaal, werkruimtes en vacatures voor beauty- en wellnessprofessionals. Van merken en leveranciers tot opleiders en salons: alles overzichtelijk op één platform, in België en Nederland.'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const cur = (await payload.findGlobal({ slug: 'homepage' as never, depth: 0 })) as { hero?: Record<string, unknown> }
  if (cur?.hero?.subtitle !== OLD) return
  await payload.updateGlobal({ slug: 'homepage' as never, data: { hero: { ...cur.hero, subtitle: NEW } } as never })
}

export async function down(_: MigrateDownArgs): Promise<void> {}
