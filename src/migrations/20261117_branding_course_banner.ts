import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

// Item 4: optional fallback banner for courses, set in Instellingen → Branding.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "branding" ADD COLUMN IF NOT EXISTS "course_fallback_banner_id" integer;
    DO $$ BEGIN
      ALTER TABLE "branding" ADD CONSTRAINT "branding_course_fallback_banner_id_media_id_fk" FOREIGN KEY ("course_fallback_banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
    CREATE INDEX IF NOT EXISTS "branding_course_fallback_banner_idx" ON "branding" USING btree ("course_fallback_banner_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "branding_course_fallback_banner_idx";
    ALTER TABLE "branding" DROP CONSTRAINT IF EXISTS "branding_course_fallback_banner_id_media_id_fk";
    ALTER TABLE "branding" DROP COLUMN IF EXISTS "course_fallback_banner_id";
  `)
}
