import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * "Niveau & doelgroep" keeps only Beginner friendly / Intermediate / Expert-
 * Advanced (client round 2 #3.4, also in the course form). Removes "Professional
 * only" and "Startende ondernemer" from existing courses and rebuilds the enum.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "courses_target_audience" WHERE "value" IN ('professional-only', 'startende-ondernemer');
    ALTER TYPE "public"."enum_courses_target_audience" RENAME TO "enum_courses_target_audience_old";
    CREATE TYPE "public"."enum_courses_target_audience" AS ENUM('beginner-friendly', 'intermediate', 'expert-advanced');
    ALTER TABLE "courses_target_audience" ALTER COLUMN "value" TYPE "public"."enum_courses_target_audience" USING "value"::text::"public"."enum_courses_target_audience";
    DROP TYPE "public"."enum_courses_target_audience_old";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_courses_target_audience" ADD VALUE IF NOT EXISTS 'professional-only';
    ALTER TYPE "public"."enum_courses_target_audience" ADD VALUE IF NOT EXISTS 'startende-ondernemer';`)
}
