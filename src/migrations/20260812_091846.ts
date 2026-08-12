import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_courses_target_audience" AS ENUM('beginner-friendly', 'intermediate', 'expert-advanced', 'professional-only', 'startende-ondernemer');
  CREATE TYPE "public"."enum_courses_practical" AS ENUM('online', 'praktijkopleiding', 'een-dag', 'meerdere-dagen', 'op-locatie', 'kleine-groepen');
  CREATE TYPE "public"."enum_courses_focus" AS ENUM('huidverbeterend', 'medisch-esthetisch', 'holistisch', 'ontspannend', 'cosmetisch', 'therapeutisch', 'energetisch');
  CREATE TABLE "users_response_templates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"subject" varchar NOT NULL,
  	"body" varchar NOT NULL
  );
  
  CREATE TABLE "brands_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE "brands_local_partners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"country" varchar NOT NULL,
  	"website" varchar
  );
  
  CREATE TABLE "courses_target_audience" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_courses_target_audience",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "courses_practical" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_courses_practical",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "courses_focus" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_courses_focus",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "brands" ADD COLUMN "social_instagram" varchar;
  ALTER TABLE "brands" ADD COLUMN "social_facebook" varchar;
  ALTER TABLE "brands" ADD COLUMN "social_tiktok" varchar;
  ALTER TABLE "courses" ADD COLUMN "tier_priority" numeric DEFAULT 0;
  ALTER TABLE "courses" ADD COLUMN "popular" boolean DEFAULT false;
  ALTER TABLE "users_response_templates" ADD CONSTRAINT "users_response_templates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brands_gallery" ADD CONSTRAINT "brands_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brands_gallery" ADD CONSTRAINT "brands_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brands_local_partners" ADD CONSTRAINT "brands_local_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_target_audience" ADD CONSTRAINT "courses_target_audience_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_practical" ADD CONSTRAINT "courses_practical_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_focus" ADD CONSTRAINT "courses_focus_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_response_templates_order_idx" ON "users_response_templates" USING btree ("_order");
  CREATE INDEX "users_response_templates_parent_id_idx" ON "users_response_templates" USING btree ("_parent_id");
  CREATE INDEX "brands_gallery_order_idx" ON "brands_gallery" USING btree ("_order");
  CREATE INDEX "brands_gallery_parent_id_idx" ON "brands_gallery" USING btree ("_parent_id");
  CREATE INDEX "brands_gallery_image_idx" ON "brands_gallery" USING btree ("image_id");
  CREATE INDEX "brands_local_partners_order_idx" ON "brands_local_partners" USING btree ("_order");
  CREATE INDEX "brands_local_partners_parent_id_idx" ON "brands_local_partners" USING btree ("_parent_id");
  CREATE INDEX "courses_target_audience_order_idx" ON "courses_target_audience" USING btree ("order");
  CREATE INDEX "courses_target_audience_parent_idx" ON "courses_target_audience" USING btree ("parent_id");
  CREATE INDEX "courses_practical_order_idx" ON "courses_practical" USING btree ("order");
  CREATE INDEX "courses_practical_parent_idx" ON "courses_practical" USING btree ("parent_id");
  CREATE INDEX "courses_focus_order_idx" ON "courses_focus" USING btree ("order");
  CREATE INDEX "courses_focus_parent_idx" ON "courses_focus" USING btree ("parent_id");
  CREATE INDEX "courses_tier_priority_idx" ON "courses" USING btree ("tier_priority");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_response_templates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "brands_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "brands_local_partners" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_target_audience" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_practical" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_focus" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "users_response_templates" CASCADE;
  DROP TABLE "brands_gallery" CASCADE;
  DROP TABLE "brands_local_partners" CASCADE;
  DROP TABLE "courses_target_audience" CASCADE;
  DROP TABLE "courses_practical" CASCADE;
  DROP TABLE "courses_focus" CASCADE;
  DROP INDEX "courses_tier_priority_idx";
  ALTER TABLE "brands" DROP COLUMN "social_instagram";
  ALTER TABLE "brands" DROP COLUMN "social_facebook";
  ALTER TABLE "brands" DROP COLUMN "social_tiktok";
  ALTER TABLE "courses" DROP COLUMN "tier_priority";
  ALTER TABLE "courses" DROP COLUMN "popular";
  DROP TYPE "public"."enum_courses_target_audience";
  DROP TYPE "public"."enum_courses_practical";
  DROP TYPE "public"."enum_courses_focus";`)
}
