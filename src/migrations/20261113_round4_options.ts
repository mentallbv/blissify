import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * Feedback round 4: "In overleg" as a werkruimte meerprijs unit (4.2) and the
 * vacancy sector "Management, sales & support" (6.2). Existing vacancies get
 * the new sector the next time they are saved (sectors follow the functions).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TYPE "public"."enum_workspaces_facilities_unit" ADD VALUE IF NOT EXISTS 'in-overleg';`)
  await db.execute(sql`ALTER TYPE "public"."enum_vacancies_sectors" ADD VALUE IF NOT EXISTS 'management' BEFORE 'overige';`)
}

// Postgres cannot drop a single enum value; the extra value is harmless.
export async function down(_: MigrateDownArgs): Promise<void> {}
