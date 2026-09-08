import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "product_launch_highlighted" boolean DEFAULT false;
    ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "co_brand_partner" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "courses" DROP COLUMN IF EXISTS "product_launch_highlighted";
    ALTER TABLE "courses" DROP COLUMN IF EXISTS "co_brand_partner";
  `)
}
