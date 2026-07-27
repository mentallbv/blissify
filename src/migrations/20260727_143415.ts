import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_brand_tier" AS ENUM('partner_listing', 'partner_professional', 'partner_premium');
  CREATE TABLE "courses_notification_recipients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar
  );
  
  ALTER TABLE "courses" ALTER COLUMN "external_url" DROP NOT NULL;
  ALTER TABLE "homepage" ALTER COLUMN "trust_text" SET DEFAULT 'Vertrouwd door 124 opleiders in heel België';
  ALTER TABLE "pricing" ALTER COLUMN "bottom_cta_body" SET DEFAULT 'Sluit je aan bij 124 opleiders die hun bereik uitbreiden via Blissify.';
  ALTER TABLE "users" ADD COLUMN "brand_tier" "enum_users_brand_tier" DEFAULT 'partner_listing';
  ALTER TABLE "trainers" ADD COLUMN "profile_accent_color" varchar;
  ALTER TABLE "courses" ADD COLUMN "is_bookable" boolean DEFAULT false;
  ALTER TABLE "courses_notification_recipients" ADD CONSTRAINT "courses_notification_recipients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "courses_notification_recipients_order_idx" ON "courses_notification_recipients" USING btree ("_order");
  CREATE INDEX "courses_notification_recipients_parent_id_idx" ON "courses_notification_recipients" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses_notification_recipients" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "courses_notification_recipients" CASCADE;
  ALTER TABLE "courses" ALTER COLUMN "external_url" SET NOT NULL;
  ALTER TABLE "homepage" ALTER COLUMN "trust_text" SET DEFAULT 'Vertrouwd door 124 geverifieerde opleiders in heel België';
  ALTER TABLE "pricing" ALTER COLUMN "bottom_cta_body" SET DEFAULT 'Sluit je aan bij 124 geverifieerde opleiders die hun bereik uitbreiden via Blissify.';
  ALTER TABLE "users" DROP COLUMN "brand_tier";
  ALTER TABLE "trainers" DROP COLUMN "profile_accent_color";
  ALTER TABLE "courses" DROP COLUMN "is_bookable";
  DROP TYPE "public"."enum_users_brand_tier";`)
}
