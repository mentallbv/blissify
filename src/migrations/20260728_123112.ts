import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_subscription_billing_cycle" AS ENUM('yearly', 'monthly');
  CREATE TYPE "public"."enum_users_subscription_commitment" AS ENUM('annual', 'cancel_anytime');
  CREATE TYPE "public"."enum_pricing_billing_monthly_commitment" AS ENUM('annual', 'cancel_anytime');
  CREATE TABLE "pricing_opleiders_tiers_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature" varchar NOT NULL
  );
  
  CREATE TABLE "pricing_opleiders_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"tagline" varchar,
  	"annual_price" numeric NOT NULL,
  	"desc" varchar,
  	"recommended" boolean DEFAULT false
  );
  
  CREATE TABLE "pricing_opleiders_comparison_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature" varchar NOT NULL,
  	"v1" varchar,
  	"v2" varchar,
  	"v3" varchar
  );
  
  CREATE TABLE "pricing_brands_tiers_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature" varchar NOT NULL
  );
  
  CREATE TABLE "pricing_brands_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"tagline" varchar,
  	"annual_price" numeric NOT NULL,
  	"desc" varchar,
  	"recommended" boolean DEFAULT false
  );
  
  CREATE TABLE "pricing_brands_comparison_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature" varchar NOT NULL,
  	"v1" varchar,
  	"v2" varchar,
  	"v3" varchar
  );
  
  ALTER TABLE "users" ADD COLUMN "subscription_billing_cycle" "enum_users_subscription_billing_cycle" DEFAULT 'yearly';
  ALTER TABLE "users" ADD COLUMN "subscription_commitment" "enum_users_subscription_commitment" DEFAULT 'annual';
  ALTER TABLE "users" ADD COLUMN "subscription_trial_ends_at" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN "subscription_minimum_ends_at" timestamp(3) with time zone;
  ALTER TABLE "pricing" ADD COLUMN "billing_trial_enabled" boolean DEFAULT true;
  ALTER TABLE "pricing" ADD COLUMN "billing_trial_days" numeric DEFAULT 7;
  ALTER TABLE "pricing" ADD COLUMN "billing_monthly_enabled" boolean DEFAULT true;
  ALTER TABLE "pricing" ADD COLUMN "billing_monthly_markup_percent" numeric DEFAULT 10;
  ALTER TABLE "pricing" ADD COLUMN "billing_monthly_commitment" "enum_pricing_billing_monthly_commitment" DEFAULT 'annual';
  ALTER TABLE "pricing" ADD COLUMN "opleiders_intro_eyebrow" varchar;
  ALTER TABLE "pricing" ADD COLUMN "opleiders_intro_title" varchar;
  ALTER TABLE "pricing" ADD COLUMN "opleiders_intro_subtitle" varchar;
  ALTER TABLE "pricing" ADD COLUMN "opleiders_comparison_col1" varchar;
  ALTER TABLE "pricing" ADD COLUMN "opleiders_comparison_col2" varchar;
  ALTER TABLE "pricing" ADD COLUMN "opleiders_comparison_col3" varchar;
  ALTER TABLE "pricing" ADD COLUMN "opleiders_bottom_cta_title" varchar;
  ALTER TABLE "pricing" ADD COLUMN "opleiders_bottom_cta_body" varchar;
  ALTER TABLE "pricing" ADD COLUMN "opleiders_bottom_cta_button_label" varchar;
  ALTER TABLE "pricing" ADD COLUMN "opleiders_bottom_cta_button_url" varchar;
  ALTER TABLE "pricing" ADD COLUMN "brands_intro_eyebrow" varchar;
  ALTER TABLE "pricing" ADD COLUMN "brands_intro_title" varchar;
  ALTER TABLE "pricing" ADD COLUMN "brands_intro_subtitle" varchar;
  ALTER TABLE "pricing" ADD COLUMN "brands_comparison_col1" varchar;
  ALTER TABLE "pricing" ADD COLUMN "brands_comparison_col2" varchar;
  ALTER TABLE "pricing" ADD COLUMN "brands_comparison_col3" varchar;
  ALTER TABLE "pricing" ADD COLUMN "brands_bottom_cta_title" varchar;
  ALTER TABLE "pricing" ADD COLUMN "brands_bottom_cta_body" varchar;
  ALTER TABLE "pricing" ADD COLUMN "brands_bottom_cta_button_label" varchar;
  ALTER TABLE "pricing" ADD COLUMN "brands_bottom_cta_button_url" varchar;
  ALTER TABLE "pricing_opleiders_tiers_features" ADD CONSTRAINT "pricing_opleiders_tiers_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing_opleiders_tiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_opleiders_tiers" ADD CONSTRAINT "pricing_opleiders_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_opleiders_comparison_rows" ADD CONSTRAINT "pricing_opleiders_comparison_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_brands_tiers_features" ADD CONSTRAINT "pricing_brands_tiers_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing_brands_tiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_brands_tiers" ADD CONSTRAINT "pricing_brands_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_brands_comparison_rows" ADD CONSTRAINT "pricing_brands_comparison_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pricing_opleiders_tiers_features_order_idx" ON "pricing_opleiders_tiers_features" USING btree ("_order");
  CREATE INDEX "pricing_opleiders_tiers_features_parent_id_idx" ON "pricing_opleiders_tiers_features" USING btree ("_parent_id");
  CREATE INDEX "pricing_opleiders_tiers_order_idx" ON "pricing_opleiders_tiers" USING btree ("_order");
  CREATE INDEX "pricing_opleiders_tiers_parent_id_idx" ON "pricing_opleiders_tiers" USING btree ("_parent_id");
  CREATE INDEX "pricing_opleiders_comparison_rows_order_idx" ON "pricing_opleiders_comparison_rows" USING btree ("_order");
  CREATE INDEX "pricing_opleiders_comparison_rows_parent_id_idx" ON "pricing_opleiders_comparison_rows" USING btree ("_parent_id");
  CREATE INDEX "pricing_brands_tiers_features_order_idx" ON "pricing_brands_tiers_features" USING btree ("_order");
  CREATE INDEX "pricing_brands_tiers_features_parent_id_idx" ON "pricing_brands_tiers_features" USING btree ("_parent_id");
  CREATE INDEX "pricing_brands_tiers_order_idx" ON "pricing_brands_tiers" USING btree ("_order");
  CREATE INDEX "pricing_brands_tiers_parent_id_idx" ON "pricing_brands_tiers" USING btree ("_parent_id");
  CREATE INDEX "pricing_brands_comparison_rows_order_idx" ON "pricing_brands_comparison_rows" USING btree ("_order");
  CREATE INDEX "pricing_brands_comparison_rows_parent_id_idx" ON "pricing_brands_comparison_rows" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pricing_opleiders_tiers_features" CASCADE;
  DROP TABLE "pricing_opleiders_tiers" CASCADE;
  DROP TABLE "pricing_opleiders_comparison_rows" CASCADE;
  DROP TABLE "pricing_brands_tiers_features" CASCADE;
  DROP TABLE "pricing_brands_tiers" CASCADE;
  DROP TABLE "pricing_brands_comparison_rows" CASCADE;
  ALTER TABLE "users" DROP COLUMN "subscription_billing_cycle";
  ALTER TABLE "users" DROP COLUMN "subscription_commitment";
  ALTER TABLE "users" DROP COLUMN "subscription_trial_ends_at";
  ALTER TABLE "users" DROP COLUMN "subscription_minimum_ends_at";
  ALTER TABLE "pricing" DROP COLUMN "billing_trial_enabled";
  ALTER TABLE "pricing" DROP COLUMN "billing_trial_days";
  ALTER TABLE "pricing" DROP COLUMN "billing_monthly_enabled";
  ALTER TABLE "pricing" DROP COLUMN "billing_monthly_markup_percent";
  ALTER TABLE "pricing" DROP COLUMN "billing_monthly_commitment";
  ALTER TABLE "pricing" DROP COLUMN "opleiders_intro_eyebrow";
  ALTER TABLE "pricing" DROP COLUMN "opleiders_intro_title";
  ALTER TABLE "pricing" DROP COLUMN "opleiders_intro_subtitle";
  ALTER TABLE "pricing" DROP COLUMN "opleiders_comparison_col1";
  ALTER TABLE "pricing" DROP COLUMN "opleiders_comparison_col2";
  ALTER TABLE "pricing" DROP COLUMN "opleiders_comparison_col3";
  ALTER TABLE "pricing" DROP COLUMN "opleiders_bottom_cta_title";
  ALTER TABLE "pricing" DROP COLUMN "opleiders_bottom_cta_body";
  ALTER TABLE "pricing" DROP COLUMN "opleiders_bottom_cta_button_label";
  ALTER TABLE "pricing" DROP COLUMN "opleiders_bottom_cta_button_url";
  ALTER TABLE "pricing" DROP COLUMN "brands_intro_eyebrow";
  ALTER TABLE "pricing" DROP COLUMN "brands_intro_title";
  ALTER TABLE "pricing" DROP COLUMN "brands_intro_subtitle";
  ALTER TABLE "pricing" DROP COLUMN "brands_comparison_col1";
  ALTER TABLE "pricing" DROP COLUMN "brands_comparison_col2";
  ALTER TABLE "pricing" DROP COLUMN "brands_comparison_col3";
  ALTER TABLE "pricing" DROP COLUMN "brands_bottom_cta_title";
  ALTER TABLE "pricing" DROP COLUMN "brands_bottom_cta_body";
  ALTER TABLE "pricing" DROP COLUMN "brands_bottom_cta_button_label";
  ALTER TABLE "pricing" DROP COLUMN "brands_bottom_cta_button_url";
  DROP TYPE "public"."enum_users_subscription_billing_cycle";
  DROP TYPE "public"."enum_users_subscription_commitment";
  DROP TYPE "public"."enum_pricing_billing_monthly_commitment";`)
}
