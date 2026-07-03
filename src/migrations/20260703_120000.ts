import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * - Add 'pending_payment' to the users subscription status enum (new aanbieders
 *   start here until Mollie confirms payment).
 * - Drop the legacy Stripe columns (the platform runs on Mollie now).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_users_subscription_status" ADD VALUE IF NOT EXISTS 'pending_payment';
    ALTER TABLE "users" DROP COLUMN IF EXISTS "stripe_customer_id";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "stripe_subscription_id";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Re-add the Stripe columns. Postgres cannot drop an enum value, so
  // 'pending_payment' is intentionally left in place on rollback.
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_customer_id" varchar;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_subscription_id" varchar;
  `)
}
