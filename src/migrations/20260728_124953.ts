import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_courses_course_type" AS ENUM('practice_training', 'online_course', 'live_course', 'coaching', 'workshop', 'webinar', 'event');
  CREATE TYPE "public"."enum_courses_model_required" AS ENUM('not_applicable', 'yes', 'no');
  CREATE TYPE "public"."enum_courses_lunch_provided" AS ENUM('not_applicable', 'yes', 'no');
  CREATE TYPE "public"."enum_reviews_status" AS ENUM('awaiting_verification', 'pending', 'approved', 'rejected');
  CREATE TABLE "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"course_id" integer NOT NULL,
  	"reviewer_name" varchar NOT NULL,
  	"reviewer_email" varchar NOT NULL,
  	"email_fingerprint" varchar NOT NULL,
  	"submission_key" varchar NOT NULL,
  	"rating" numeric NOT NULL,
  	"body" varchar NOT NULL,
  	"status" "enum_reviews_status" DEFAULT 'awaiting_verification' NOT NULL,
  	"verified_at" timestamp(3) with time zone,
  	"verification_sent_at" timestamp(3) with time zone,
  	"verification_expires_at" timestamp(3) with time zone,
  	"verification_token_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "courses_start_dates" ADD COLUMN "end_date" timestamp(3) with time zone;
  ALTER TABLE "courses_start_dates" ADD COLUMN "start_time" varchar;
  ALTER TABLE "courses_start_dates" ADD COLUMN "end_time" varchar;
  ALTER TABLE "courses" ADD COLUMN "course_type" "enum_courses_course_type";
  ALTER TABLE "courses" ADD COLUMN "participants_maximum" numeric;
  ALTER TABLE "courses" ADD COLUMN "participants_private_one_to_one" boolean DEFAULT false;
  ALTER TABLE "courses" ADD COLUMN "model_required" "enum_courses_model_required";
  ALTER TABLE "courses" ADD COLUMN "lunch_provided" "enum_courses_lunch_provided";
  ALTER TABLE "courses" ADD COLUMN "contact_email" varchar;
  ALTER TABLE "courses" ADD COLUMN "contact_website" varchar;
  ALTER TABLE "courses" ADD COLUMN "contact_instagram" varchar;
  ALTER TABLE "courses" ADD COLUMN "contact_facebook" varchar;
  ALTER TABLE "courses" ADD COLUMN "contact_tiktok" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "reviews_id" integer;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "reviews_course_idx" ON "reviews" USING btree ("course_id");
  CREATE INDEX "reviews_email_fingerprint_idx" ON "reviews" USING btree ("email_fingerprint");
  CREATE UNIQUE INDEX "reviews_submission_key_idx" ON "reviews" USING btree ("submission_key");
  CREATE INDEX "reviews_status_idx" ON "reviews" USING btree ("status");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reviews" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "reviews" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_reviews_fk";
  
  DROP INDEX "payload_locked_documents_rels_reviews_id_idx";
  ALTER TABLE "courses_start_dates" DROP COLUMN "end_date";
  ALTER TABLE "courses_start_dates" DROP COLUMN "start_time";
  ALTER TABLE "courses_start_dates" DROP COLUMN "end_time";
  ALTER TABLE "courses" DROP COLUMN "course_type";
  ALTER TABLE "courses" DROP COLUMN "participants_maximum";
  ALTER TABLE "courses" DROP COLUMN "participants_private_one_to_one";
  ALTER TABLE "courses" DROP COLUMN "model_required";
  ALTER TABLE "courses" DROP COLUMN "lunch_provided";
  ALTER TABLE "courses" DROP COLUMN "contact_email";
  ALTER TABLE "courses" DROP COLUMN "contact_website";
  ALTER TABLE "courses" DROP COLUMN "contact_instagram";
  ALTER TABLE "courses" DROP COLUMN "contact_facebook";
  ALTER TABLE "courses" DROP COLUMN "contact_tiktok";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "reviews_id";
  DROP TYPE "public"."enum_courses_course_type";
  DROP TYPE "public"."enum_courses_model_required";
  DROP TYPE "public"."enum_courses_lunch_provided";
  DROP TYPE "public"."enum_reviews_status";`)
}
