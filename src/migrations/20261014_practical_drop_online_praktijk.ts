import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * Praktisch rework (client round 2 #3.8): "Online" and "Praktijkopleiding" are
 * already covered by Lesvorm / Type opleiding, so they leave Praktisch. Removes
 * them from existing courses and rebuilds the enum. ("Geen eigen model nodig"
 * and "Privé" come from existing fields, so they need no column.)
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "courses_practical" WHERE "value" IN ('online', 'praktijkopleiding');
    ALTER TYPE "public"."enum_courses_practical" RENAME TO "enum_courses_practical_old";
    CREATE TYPE "public"."enum_courses_practical" AS ENUM('een-dag', 'meerdere-dagen', 'op-locatie');
    ALTER TABLE "courses_practical" ALTER COLUMN "value" TYPE "public"."enum_courses_practical" USING "value"::text::"public"."enum_courses_practical";
    DROP TYPE "public"."enum_courses_practical_old";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_courses_practical" ADD VALUE IF NOT EXISTS 'online';
    ALTER TYPE "public"."enum_courses_practical" ADD VALUE IF NOT EXISTS 'praktijkopleiding';`)
}
