import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/** How to apply for a vacancy: by email (popup) or a link to the poster's site. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_vacancies_apply_method" AS ENUM('email', 'link');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  ALTER TABLE "vacancies" ADD COLUMN IF NOT EXISTS "apply_method" "enum_vacancies_apply_method" DEFAULT 'email' NOT NULL;
  ALTER TABLE "vacancies" ADD COLUMN IF NOT EXISTS "apply_url" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "vacancies" DROP COLUMN IF EXISTS "apply_url";
  ALTER TABLE "vacancies" DROP COLUMN IF EXISTS "apply_method";
  DROP TYPE IF EXISTS "public"."enum_vacancies_apply_method";`)
}
