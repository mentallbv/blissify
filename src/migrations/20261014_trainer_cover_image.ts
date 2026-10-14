import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/** Cover image on the opleider profile, like brands have (client round 2 #1.5). */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "trainers" ADD COLUMN IF NOT EXISTS "cover_image_id" integer;
    DO $$ BEGIN
      ALTER TABLE "trainers" ADD CONSTRAINT "trainers_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    CREATE INDEX IF NOT EXISTS "trainers_cover_image_idx" ON "trainers" USING btree ("cover_image_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "trainers" DROP COLUMN IF EXISTS "cover_image_id";`)
}
