import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/** "Soort opleiding" (Lonne, Nov 2026): hasMany select on courses. Existing courses start without a kind. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_courses_kinds" AS ENUM('behandelingen-technieken', 'product-merktrainingen', 'apparatuur-toestellen', 'business-ondernemerschap');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    CREATE TABLE IF NOT EXISTS "courses_kinds" (
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "value" "enum_courses_kinds",
      "id" serial PRIMARY KEY NOT NULL
    );
    DO $$ BEGIN
      ALTER TABLE "courses_kinds" ADD CONSTRAINT "courses_kinds_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    CREATE INDEX IF NOT EXISTS "courses_kinds_order_idx" ON "courses_kinds" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "courses_kinds_parent_idx" ON "courses_kinds" USING btree ("parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "courses_kinds" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_courses_kinds";
  `)
}
