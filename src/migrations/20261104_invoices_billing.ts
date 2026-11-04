import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/** VAT at checkout + Mollie invoices: billing address on users, invoices collection. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "billing_company_name" varchar;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "billing_street" varchar;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "billing_postal_code" varchar;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "billing_city" varchar;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "vat_verified_at" timestamp(3) with time zone;
  CREATE TABLE IF NOT EXISTS "invoices" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer,
  	"mollie_payment_id" varchar NOT NULL,
  	"mollie_invoice_id" varchar NOT NULL,
  	"invoice_number" varchar,
  	"description" varchar,
  	"total_amount" numeric,
  	"vat_amount" numeric,
  	"net_amount" numeric,
  	"vat_rate" numeric,
  	"reverse_charge" boolean DEFAULT false,
  	"is_e_invoice" boolean DEFAULT false,
  	"issued_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "invoices_id" integer;
  DO $$ BEGIN
    ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_invoices_fk" FOREIGN KEY ("invoices_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  CREATE INDEX IF NOT EXISTS "invoices_user_idx" ON "invoices" USING btree ("user_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "invoices_mollie_payment_id_idx" ON "invoices" USING btree ("mollie_payment_id");
  CREATE INDEX IF NOT EXISTS "invoices_updated_at_idx" ON "invoices" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "invoices_created_at_idx" ON "invoices" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_invoices_id_idx" ON "payload_locked_documents_rels" USING btree ("invoices_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_invoices_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_invoices_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "invoices_id";
  DROP TABLE IF EXISTS "invoices" CASCADE;
  ALTER TABLE "users" DROP COLUMN IF EXISTS "vat_verified_at";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "billing_city";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "billing_postal_code";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "billing_street";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "billing_company_name";`)
}
