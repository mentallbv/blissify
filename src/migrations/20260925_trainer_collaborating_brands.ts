import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * Co-branding (client #12): the opleider→merk relationship is a hasMany
 * relationship (`collaboratingBrands`), which Payload stores in a `trainers_rels`
 * table. Trainers had no hasMany relationship before, so that table doesn't
 * exist yet — create it with the standard Payload/drizzle shape.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "trainers_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "brands_id" integer
    );
    DO $$ BEGIN
      ALTER TABLE "trainers_rels" ADD CONSTRAINT "trainers_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."trainers"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE "trainers_rels" ADD CONSTRAINT "trainers_rels_brands_fk" FOREIGN KEY ("brands_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    CREATE INDEX IF NOT EXISTS "trainers_rels_order_idx" ON "trainers_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "trainers_rels_parent_idx" ON "trainers_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "trainers_rels_path_idx" ON "trainers_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "trainers_rels_brands_id_idx" ON "trainers_rels" USING btree ("brands_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "trainers_rels";`)
}
