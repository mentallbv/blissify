import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * Add a country to the opleider (trainer) location so the /opleiders overview
 * can offer a België / Nederland / Alle filter (client feedback #11). Existing
 * trainers default to België ('be').
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_trainers_location_country" AS ENUM('be', 'nl');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    ALTER TABLE "trainers" ADD COLUMN IF NOT EXISTS "location_country" "enum_trainers_location_country" DEFAULT 'be';
    UPDATE "trainers" SET "location_country" = 'be' WHERE "location_country" IS NULL;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "trainers" DROP COLUMN IF EXISTS "location_country";`)
}
