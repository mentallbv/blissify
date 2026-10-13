import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * Drop the "Kleine groepen (<12)" option from course Praktisch (client round 2
 * #2.2 / #3.5). Removes the value from existing courses, then rebuilds the enum
 * without it. Only that one tag is removed; the courses themselves are untouched.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "courses_practical" WHERE "value" = 'kleine-groepen';
    ALTER TYPE "public"."enum_courses_practical" RENAME TO "enum_courses_practical_old";
    CREATE TYPE "public"."enum_courses_practical" AS ENUM('online', 'praktijkopleiding', 'een-dag', 'meerdere-dagen', 'op-locatie');
    ALTER TABLE "courses_practical" ALTER COLUMN "value" TYPE "public"."enum_courses_practical" USING "value"::text::"public"."enum_courses_practical";
    DROP TYPE "public"."enum_courses_practical_old";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TYPE "public"."enum_courses_practical" ADD VALUE IF NOT EXISTS 'kleine-groepen';`)
}
