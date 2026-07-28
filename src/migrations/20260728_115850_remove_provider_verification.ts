import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homepage" ALTER COLUMN "hero_subtitle" SET DEFAULT 'Vind professionele opleidingen in massage, nagelstyliste, reflexologie, yoga, voeding en beauty, overzichtelijk samengebracht door Blissify.';
  ALTER TABLE "seo_settings" ALTER COLUMN "default_description" SET DEFAULT 'Ontdek professionele opleidingen in massage, nagelstyliste, yoga, wellness en meer. Vergelijk trainers en merken in België.';
  ALTER TABLE "brands" DROP COLUMN "verified";
  ALTER TABLE "trainers" DROP COLUMN "verified";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homepage" ALTER COLUMN "hero_subtitle" SET DEFAULT 'Vind erkende, professionele opleidingen in massage, nagelstyliste, reflexologie, yoga, voeding en beauty, zorgvuldig samengebracht door Blissify.';
  ALTER TABLE "seo_settings" ALTER COLUMN "default_description" SET DEFAULT 'Ontdek erkende opleidingen in massage, nagelstyliste, yoga, wellness en meer. Vind de beste trainers en merken in België.';
  ALTER TABLE "brands" ADD COLUMN "verified" boolean DEFAULT false;
  ALTER TABLE "trainers" ADD COLUMN "verified" boolean DEFAULT false;`)
}
