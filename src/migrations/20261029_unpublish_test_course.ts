import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/** Take the leftover "Web development" test course (account reshad-56) offline. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`UPDATE "courses" SET "status" = 'draft' WHERE "slug" = 'web-development';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`UPDATE "courses" SET "status" = 'published' WHERE "slug" = 'web-development';`)
}
