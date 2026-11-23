import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/** Item 13: discount codes + their redemptions. Matches `payload generate:db-schema` output. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN CREATE TYPE "public"."enum_discount_codes_tiers" AS ENUM('basis', 'medium', 'premium', 'partner_listing', 'partner_professional', 'partner_premium'); EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_discount_codes_billing_cycles" AS ENUM('yearly', 'monthly'); EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_discount_codes_discount_type" AS ENUM('percentage', 'fixed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_discount_codes_duration" AS ENUM('once', 'repeating', 'forever'); EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_discount_codes_audience" AS ENUM('all', 'trainer', 'brand'); EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_discount_redemptions_status" AS ENUM('pending', 'redeemed', 'failed'); EXCEPTION WHEN duplicate_object THEN null; END $$;

  CREATE TABLE IF NOT EXISTS "discount_codes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"active" boolean DEFAULT true,
  	"description" varchar,
  	"discount_type" "enum_discount_codes_discount_type" DEFAULT 'percentage' NOT NULL,
  	"percentage" numeric,
  	"amount" numeric,
  	"duration" "enum_discount_codes_duration" DEFAULT 'once' NOT NULL,
  	"duration_payments" numeric,
  	"valid_from" timestamp(3) with time zone,
  	"valid_until" timestamp(3) with time zone,
  	"max_redemptions" numeric,
  	"max_per_user" numeric DEFAULT 1,
  	"audience" "enum_discount_codes_audience" DEFAULT 'all',
  	"new_customers_only" boolean DEFAULT false,
  	"times_redeemed" numeric DEFAULT 0,
  	"total_discount_given" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  CREATE TABLE IF NOT EXISTS "discount_codes_tiers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_discount_codes_tiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  CREATE TABLE IF NOT EXISTS "discount_codes_billing_cycles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_discount_codes_billing_cycles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  CREATE TABLE IF NOT EXISTS "discount_redemptions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"discount_code_id" integer,
  	"code_text" varchar,
  	"user_id" integer,
  	"status" "enum_discount_redemptions_status" DEFAULT 'pending' NOT NULL,
  	"mollie_payment_id" varchar,
  	"tier" varchar,
  	"billing_cycle" varchar,
  	"full_amount" numeric,
  	"discount_amount" numeric,
  	"payments_left" numeric,
  	"mollie_subscription_id" varchar,
  	"redeemed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "discount_codes_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "discount_redemptions_id" integer;

  DO $$ BEGIN ALTER TABLE "discount_codes_tiers" ADD CONSTRAINT "discount_codes_tiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."discount_codes"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN ALTER TABLE "discount_codes_billing_cycles" ADD CONSTRAINT "discount_codes_billing_cycles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."discount_codes"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN ALTER TABLE "discount_redemptions" ADD CONSTRAINT "discount_redemptions_discount_code_id_discount_codes_id_fk" FOREIGN KEY ("discount_code_id") REFERENCES "public"."discount_codes"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN ALTER TABLE "discount_redemptions" ADD CONSTRAINT "discount_redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_discount_codes_fk" FOREIGN KEY ("discount_codes_id") REFERENCES "public"."discount_codes"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_discount_redemptions_fk" FOREIGN KEY ("discount_redemptions_id") REFERENCES "public"."discount_redemptions"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

  CREATE UNIQUE INDEX IF NOT EXISTS "discount_codes_code_idx" ON "discount_codes" USING btree ("code");
  CREATE INDEX IF NOT EXISTS "discount_codes_updated_at_idx" ON "discount_codes" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "discount_codes_created_at_idx" ON "discount_codes" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "discount_codes_tiers_order_idx" ON "discount_codes_tiers" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "discount_codes_tiers_parent_idx" ON "discount_codes_tiers" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "discount_codes_billing_cycles_order_idx" ON "discount_codes_billing_cycles" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "discount_codes_billing_cycles_parent_idx" ON "discount_codes_billing_cycles" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "discount_redemptions_discount_code_idx" ON "discount_redemptions" USING btree ("discount_code_id");
  CREATE INDEX IF NOT EXISTS "discount_redemptions_user_idx" ON "discount_redemptions" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "discount_redemptions_status_idx" ON "discount_redemptions" USING btree ("status");
  CREATE INDEX IF NOT EXISTS "discount_redemptions_mollie_payment_id_idx" ON "discount_redemptions" USING btree ("mollie_payment_id");
  CREATE INDEX IF NOT EXISTS "discount_redemptions_updated_at_idx" ON "discount_redemptions" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "discount_redemptions_created_at_idx" ON "discount_redemptions" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_discount_codes_id_idx" ON "payload_locked_documents_rels" USING btree ("discount_codes_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_discount_redemptions_id_idx" ON "payload_locked_documents_rels" USING btree ("discount_redemptions_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_discount_codes_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_discount_redemptions_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_discount_codes_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_discount_redemptions_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "discount_codes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "discount_redemptions_id";
  DROP TABLE IF EXISTS "discount_redemptions" CASCADE;
  DROP TABLE IF EXISTS "discount_codes_tiers" CASCADE;
  DROP TABLE IF EXISTS "discount_codes_billing_cycles" CASCADE;
  DROP TABLE IF EXISTS "discount_codes" CASCADE;
  DROP TYPE IF EXISTS "public"."enum_discount_redemptions_status";
  DROP TYPE IF EXISTS "public"."enum_discount_codes_audience";
  DROP TYPE IF EXISTS "public"."enum_discount_codes_duration";
  DROP TYPE IF EXISTS "public"."enum_discount_codes_discount_type";
  DROP TYPE IF EXISTS "public"."enum_discount_codes_billing_cycles";
  DROP TYPE IF EXISTS "public"."enum_discount_codes_tiers";`)
}
