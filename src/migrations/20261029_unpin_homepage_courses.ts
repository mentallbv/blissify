import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * Untick the four courses that were pinned as "featured" from the start, so all
 * six homepage places rotate among top-plan accounts (feedback round 3 #1.4).
 */
const SLUGS = ['deep-tissue-massage', 'premium-facial-technieken', 'medisch-esthetische-behandelingen', 'huidanalyse-en-behandeling']

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`UPDATE "courses" SET "featured" = false WHERE "slug" IN (${sql.join(SLUGS.map((s) => sql`${s}`), sql`, `)});`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`UPDATE "courses" SET "featured" = true WHERE "slug" IN (${sql.join(SLUGS.map((s) => sql`${s}`), sql`, `)});`)
}
