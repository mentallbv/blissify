import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * Add a country to the course location so visitors can also find courses in
 * Nederland (client round 2 #3.6 / #1.1). Existing courses default to België.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_courses_location_country" AS ENUM('be', 'nl');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "location_country" "enum_courses_location_country" DEFAULT 'be';
    UPDATE "courses" SET "location_country" = 'be' WHERE "location_country" IS NULL;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "courses" DROP COLUMN IF EXISTS "location_country";`)
}
