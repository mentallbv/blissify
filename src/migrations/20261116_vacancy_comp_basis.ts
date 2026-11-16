import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/** Feedback round 4 (6.1): what a vacancy's pay amount means (bruto, excl./incl. btw, %, n.v.t.). */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_vacancies_compensation_basis" AS ENUM('bruto', 'excl-btw', 'incl-btw', 'percentage', 'nvt');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    ALTER TABLE "vacancies" ADD COLUMN IF NOT EXISTS "compensation_basis" "enum_vacancies_compensation_basis";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "vacancies" DROP COLUMN IF EXISTS "compensation_basis";
    DROP TYPE IF EXISTS "public"."enum_vacancies_compensation_basis";
  `)
}
