import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_users_billing_country" AS ENUM('BE', 'NL', 'EU', 'OTHER');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_users_pending_subscription_tier" AS ENUM('basis', 'medium', 'premium', 'partner_listing', 'partner_professional', 'partner_premium');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_users_pending_subscription_billing_cycle" AS ENUM('yearly', 'monthly');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_courses_certification_types" AS ENUM('certificate-included', 'diploma-possible', 'accredited-recognized', 'industry-recognized', 'mbo-recognized');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE TABLE IF NOT EXISTS "courses_certification_types" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_courses_certification_types",
  	"id" serial PRIMARY KEY NOT NULL
  );

  DO $$ BEGIN
    IF EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'enum_brands_product_type' AND e.enumlabel = 'nagels-hand-voet'
    ) THEN
      ALTER TABLE "brands_product_type" ALTER COLUMN "value" SET DATA TYPE text;
      UPDATE "brands_product_type" SET "value" = 'manicure' WHERE "value" = 'nagels-hand-voet';
      DROP TYPE "public"."enum_brands_product_type";
      CREATE TYPE "public"."enum_brands_product_type" AS ENUM('skincare-huidverbetering', 'esthetische-technologie', 'make-up-pmu', 'wenkbrauwen-wimpers', 'manicure', 'pedicure', 'haarverzorging-scalp', 'massage-body', 'waxing-ontharing', 'wellness-holistisch', 'aromatherapie', 'praktijkinrichting-meubilair', 'praktijkbenodigdheden-instrumenten', 'hygiene-desinfectie', 'textiel-accessoires', 'business-salon');
      ALTER TABLE "brands_product_type" ALTER COLUMN "value" SET DATA TYPE "public"."enum_brands_product_type" USING "value"::"public"."enum_brands_product_type";
    END IF;
  END $$;
  ALTER TABLE "pricing" ALTER COLUMN "billing_trial_enabled" SET DEFAULT false;
  ALTER TABLE "pricing" ALTER COLUMN "billing_trial_days" SET DEFAULT 0;
  ALTER TABLE "pricing" ALTER COLUMN "billing_monthly_markup_percent" SET DEFAULT 20;
  ALTER TABLE "pricing" ALTER COLUMN "billing_monthly_commitment" SET DEFAULT 'cancel_anytime';
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "vat_number" varchar;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "chamber_of_commerce_number" varchar;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "billing_country" "enum_users_billing_country" DEFAULT 'BE';
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "professional_buyer_confirmed" boolean DEFAULT false;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "professional_buyer_confirmed_at" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_started_at" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_cancel_at_period_end" boolean DEFAULT false;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_canceled_at" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pending_subscription_tier" "enum_users_pending_subscription_tier";
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pending_subscription_billing_cycle" "enum_users_pending_subscription_billing_cycle";
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pending_subscription_effective_at" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_inactive_since" timestamp(3) with time zone;
  ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "top_rated" boolean DEFAULT false;
  ALTER TABLE "pricing_opleiders_tiers" ADD COLUMN IF NOT EXISTS "monthly_price" numeric;
  ALTER TABLE "pricing_brands_tiers" ADD COLUMN IF NOT EXISTS "monthly_price" numeric;
  DO $$ BEGIN
    ALTER TABLE "courses_certification_types" ADD CONSTRAINT "courses_certification_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE INDEX IF NOT EXISTS "courses_certification_types_order_idx" ON "courses_certification_types" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "courses_certification_types_parent_idx" ON "courses_certification_types" USING btree ("parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses_certification_types" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "courses_certification_types" CASCADE;
  ALTER TABLE "brands_product_type" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_brands_product_type";
  UPDATE "brands_product_type" SET "value" = 'nagels-hand-voet' WHERE "value" IN ('manicure', 'pedicure');
  UPDATE "brands_product_type" SET "value" = 'business-salon' WHERE "value" IN ('aromatherapie', 'praktijkinrichting-meubilair', 'praktijkbenodigdheden-instrumenten', 'hygiene-desinfectie', 'textiel-accessoires');
  CREATE TYPE "public"."enum_brands_product_type" AS ENUM('skincare-huidverbetering', 'esthetische-technologie', 'make-up-pmu', 'wenkbrauwen-wimpers', 'nagels-hand-voet', 'haarverzorging-scalp', 'massage-body', 'waxing-ontharing', 'wellness-holistisch', 'business-salon');
  ALTER TABLE "brands_product_type" ALTER COLUMN "value" SET DATA TYPE "public"."enum_brands_product_type" USING "value"::"public"."enum_brands_product_type";
  ALTER TABLE "pricing" ALTER COLUMN "billing_trial_enabled" SET DEFAULT true;
  ALTER TABLE "pricing" ALTER COLUMN "billing_trial_days" SET DEFAULT 7;
  ALTER TABLE "pricing" ALTER COLUMN "billing_monthly_markup_percent" SET DEFAULT 10;
  ALTER TABLE "pricing" ALTER COLUMN "billing_monthly_commitment" SET DEFAULT 'annual';
  ALTER TABLE "users" DROP COLUMN "vat_number";
  ALTER TABLE "users" DROP COLUMN "chamber_of_commerce_number";
  ALTER TABLE "users" DROP COLUMN "billing_country";
  ALTER TABLE "users" DROP COLUMN "professional_buyer_confirmed";
  ALTER TABLE "users" DROP COLUMN "professional_buyer_confirmed_at";
  ALTER TABLE "users" DROP COLUMN "subscription_started_at";
  ALTER TABLE "users" DROP COLUMN "subscription_cancel_at_period_end";
  ALTER TABLE "users" DROP COLUMN "subscription_canceled_at";
  ALTER TABLE "users" DROP COLUMN "pending_subscription_tier";
  ALTER TABLE "users" DROP COLUMN "pending_subscription_billing_cycle";
  ALTER TABLE "users" DROP COLUMN "pending_subscription_effective_at";
  ALTER TABLE "users" DROP COLUMN "subscription_inactive_since";
  ALTER TABLE "brands" DROP COLUMN "top_rated";
  ALTER TABLE "pricing_opleiders_tiers" DROP COLUMN "monthly_price";
  ALTER TABLE "pricing_brands_tiers" DROP COLUMN "monthly_price";
  DROP TYPE "public"."enum_users_billing_country";
  DROP TYPE "public"."enum_users_pending_subscription_tier";
  DROP TYPE "public"."enum_users_pending_subscription_billing_cycle";
  DROP TYPE "public"."enum_courses_certification_types";`)
}
