import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/** Add "Modules" as a course duration unit (client round 2 #2.5). */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TYPE "public"."enum_courses_duration_unit" ADD VALUE IF NOT EXISTS 'modules';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Postgres cannot drop a single enum value; move courses back to 'days' and rebuild the type.
  await db.execute(sql`
    UPDATE "courses" SET "duration_unit" = 'days' WHERE "duration_unit" = 'modules';
    ALTER TYPE "public"."enum_courses_duration_unit" RENAME TO "enum_courses_duration_unit_old";
    CREATE TYPE "public"."enum_courses_duration_unit" AS ENUM('hours', 'days', 'weeks', 'months');
    ALTER TABLE "courses" ALTER COLUMN "duration_unit" TYPE "public"."enum_courses_duration_unit" USING "duration_unit"::text::"public"."enum_courses_duration_unit";
    DROP TYPE "public"."enum_courses_duration_unit_old";`)
}
