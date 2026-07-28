import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_brands_product_type" AS ENUM('skincare-huidverbetering', 'esthetische-technologie', 'make-up-pmu', 'wenkbrauwen-wimpers', 'nagels-hand-voet', 'haarverzorging-scalp', 'massage-body', 'waxing-ontharing', 'wellness-holistisch', 'business-salon');
  CREATE TYPE "public"."enum_brands_positionering" AS ENUM('starter-friendly', 'premium-luxe', 'professioneel-salon', 'medisch-esthetisch');
  CREATE TYPE "public"."enum_subscription_settings_homepage_opleider_tiers" AS ENUM('basis', 'medium', 'premium');
  CREATE TYPE "public"."enum_subscription_settings_homepage_brand_tiers" AS ENUM('partner_listing', 'partner_professional', 'partner_premium');
  CREATE TABLE "brands_product_type" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_brands_product_type",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "subscription_settings_homepage_opleider_tiers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_subscription_settings_homepage_opleider_tiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "subscription_settings_homepage_brand_tiers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_subscription_settings_homepage_brand_tiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "subscription_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "brands_tags" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_brands_tags";
  CREATE TYPE "public"."enum_brands_tags" AS ENUM('belgisch', 'vegan', 'natuurlijk', 'cruelty-free', 'duurzaam', 'holistisch', 'professioneel', 'biologisch', 'luxe');
  ALTER TABLE "brands_tags" ALTER COLUMN "value" SET DATA TYPE "public"."enum_brands_tags" USING "value"::"public"."enum_brands_tags";
  ALTER TABLE "brands" ADD COLUMN "positionering" "enum_brands_positionering";
  ALTER TABLE "brands_product_type" ADD CONSTRAINT "brands_product_type_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subscription_settings_homepage_opleider_tiers" ADD CONSTRAINT "subscription_settings_homepage_opleider_tiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."subscription_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subscription_settings_homepage_brand_tiers" ADD CONSTRAINT "subscription_settings_homepage_brand_tiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."subscription_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "brands_product_type_order_idx" ON "brands_product_type" USING btree ("order");
  CREATE INDEX "brands_product_type_parent_idx" ON "brands_product_type" USING btree ("parent_id");
  CREATE INDEX "subscription_settings_homepage_opleider_tiers_order_idx" ON "subscription_settings_homepage_opleider_tiers" USING btree ("order");
  CREATE INDEX "subscription_settings_homepage_opleider_tiers_parent_idx" ON "subscription_settings_homepage_opleider_tiers" USING btree ("parent_id");
  CREATE INDEX "subscription_settings_homepage_brand_tiers_order_idx" ON "subscription_settings_homepage_brand_tiers" USING btree ("order");
  CREATE INDEX "subscription_settings_homepage_brand_tiers_parent_idx" ON "subscription_settings_homepage_brand_tiers" USING btree ("parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "brands_product_type" CASCADE;
  DROP TABLE "subscription_settings_homepage_opleider_tiers" CASCADE;
  DROP TABLE "subscription_settings_homepage_brand_tiers" CASCADE;
  DROP TABLE "subscription_settings" CASCADE;
  ALTER TABLE "brands_tags" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_brands_tags";
  CREATE TYPE "public"."enum_brands_tags" AS ENUM('belgisch', 'vegan', 'natuurlijk', 'cruelty-free', 'professioneel', 'biologisch', 'duurzaam', 'luxe');
  ALTER TABLE "brands_tags" ALTER COLUMN "value" SET DATA TYPE "public"."enum_brands_tags" USING "value"::"public"."enum_brands_tags";
  ALTER TABLE "brands" DROP COLUMN "positionering";
  DROP TYPE "public"."enum_brands_product_type";
  DROP TYPE "public"."enum_brands_positionering";
  DROP TYPE "public"."enum_subscription_settings_homepage_opleider_tiers";
  DROP TYPE "public"."enum_subscription_settings_homepage_brand_tiers";`)
}
