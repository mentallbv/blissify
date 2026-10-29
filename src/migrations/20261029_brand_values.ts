import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * "Filosofie & waarden" becomes "Merkidentiteit & waarden" with nine options
 * (client round 3 #3). Existing picks are mapped; 'belgisch' (already the
 * Herkomst filter) and 'professioneel' (too vague) are dropped.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "brands_tags" ALTER COLUMN "value" SET DATA TYPE text;
    UPDATE "brands_tags" SET "value" = 'dierproefvrij' WHERE "value" = 'cruelty-free';
    UPDATE "brands_tags" SET "value" = 'luxe-exclusiviteit' WHERE "value" = 'luxe';
    DELETE FROM "brands_tags" WHERE "value" IN ('belgisch', 'professioneel');
    DROP TYPE "public"."enum_brands_tags";
    CREATE TYPE "public"."enum_brands_tags" AS ENUM('natuurlijk', 'vegan', 'dierproefvrij', 'duurzaam', 'holistisch', 'biologisch', 'clean-beauty', 'luxe-exclusiviteit', 'innovatie-technologie');
    ALTER TABLE "brands_tags" ALTER COLUMN "value" SET DATA TYPE "public"."enum_brands_tags" USING "value"::"public"."enum_brands_tags";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "brands_tags" ALTER COLUMN "value" SET DATA TYPE text;
    UPDATE "brands_tags" SET "value" = 'cruelty-free' WHERE "value" = 'dierproefvrij';
    UPDATE "brands_tags" SET "value" = 'luxe' WHERE "value" = 'luxe-exclusiviteit';
    DELETE FROM "brands_tags" WHERE "value" IN ('clean-beauty', 'innovatie-technologie');
    DROP TYPE "public"."enum_brands_tags";
    CREATE TYPE "public"."enum_brands_tags" AS ENUM('belgisch', 'vegan', 'natuurlijk', 'cruelty-free', 'duurzaam', 'holistisch', 'professioneel', 'biologisch', 'luxe');
    ALTER TABLE "brands_tags" ALTER COLUMN "value" SET DATA TYPE "public"."enum_brands_tags" USING "value"::"public"."enum_brands_tags";`)
}
