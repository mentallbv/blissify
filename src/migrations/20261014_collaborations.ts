import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * Samenwerkingen opleider ↔ merk (client round 2, section 5).
 *  - New `collaborations` collection (brand, trainer, status, ended by, answered at).
 *  - Courses get `collaboration_brand_id` ("In samenwerking met") and
 *    `delivered_by_trainer_id` ("Opleiding verzorgd door").
 *  - The round 1 links (trainers.collaboratingBrands, chosen freely by the
 *    opleider) become approved collaborations, as agreed with the team.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_collaborations_status" AS ENUM('pending', 'approved', 'declined', 'removed');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      CREATE TYPE "public"."enum_collaborations_ended_by" AS ENUM('brand', 'trainer');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "collaborations" (
      "id" serial PRIMARY KEY NOT NULL,
      "brand_id" integer NOT NULL,
      "trainer_id" integer NOT NULL,
      "status" "enum_collaborations_status" DEFAULT 'pending' NOT NULL,
      "ended_by" "enum_collaborations_ended_by",
      "responded_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    DO $$ BEGIN
      ALTER TABLE "collaborations" ADD CONSTRAINT "collaborations_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE "collaborations" ADD CONSTRAINT "collaborations_trainer_id_trainers_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    CREATE INDEX IF NOT EXISTS "collaborations_brand_idx" ON "collaborations" USING btree ("brand_id");
    CREATE INDEX IF NOT EXISTS "collaborations_trainer_idx" ON "collaborations" USING btree ("trainer_id");
    CREATE INDEX IF NOT EXISTS "collaborations_status_idx" ON "collaborations" USING btree ("status");
    CREATE INDEX IF NOT EXISTS "collaborations_updated_at_idx" ON "collaborations" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "collaborations_created_at_idx" ON "collaborations" USING btree ("created_at");

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "collaborations_id" integer;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_collaborations_fk" FOREIGN KEY ("collaborations_id") REFERENCES "public"."collaborations"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_collaborations_id_idx" ON "payload_locked_documents_rels" USING btree ("collaborations_id");

    ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "collaboration_brand_id" integer;
    ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "delivered_by_trainer_id" integer;
    DO $$ BEGIN
      ALTER TABLE "courses" ADD CONSTRAINT "courses_collaboration_brand_id_brands_id_fk" FOREIGN KEY ("collaboration_brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE "courses" ADD CONSTRAINT "courses_delivered_by_trainer_id_trainers_id_fk" FOREIGN KEY ("delivered_by_trainer_id") REFERENCES "public"."trainers"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    CREATE INDEX IF NOT EXISTS "courses_collaboration_brand_idx" ON "courses" USING btree ("collaboration_brand_id");
    CREATE INDEX IF NOT EXISTS "courses_delivered_by_trainer_idx" ON "courses" USING btree ("delivered_by_trainer_id");

    -- Round 1 links -> approved collaborations (one per pair).
    INSERT INTO "collaborations" ("brand_id", "trainer_id", "status", "responded_at")
    SELECT DISTINCT r."brands_id", r."parent_id", 'approved'::"enum_collaborations_status", now()
    FROM "trainers_rels" r
    WHERE r."path" = 'collaboratingBrands' AND r."brands_id" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "collaborations" c WHERE c."brand_id" = r."brands_id" AND c."trainer_id" = r."parent_id"
      );`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "courses" DROP COLUMN IF EXISTS "collaboration_brand_id";
    ALTER TABLE "courses" DROP COLUMN IF EXISTS "delivered_by_trainer_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "collaborations_id";
    DROP TABLE IF EXISTS "collaborations";
    DROP TYPE IF EXISTS "public"."enum_collaborations_status";
    DROP TYPE IF EXISTS "public"."enum_collaborations_ended_by";`)
}
