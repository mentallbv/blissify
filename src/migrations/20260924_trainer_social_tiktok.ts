import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * Add a TikTok social channel to the opleider (trainer) profile (client
 * feedback #4). Trainers already had social_instagram / social_facebook /
 * social_linkedin; this adds social_tiktok to match brands and the dashboard
 * profile form.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "trainers" ADD COLUMN IF NOT EXISTS "social_tiktok" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "trainers" DROP COLUMN IF EXISTS "social_tiktok";`)
}
