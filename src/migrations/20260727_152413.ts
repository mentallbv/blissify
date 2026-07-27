import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_brands_type_partner" AS ENUM('productmerken', 'apparatuurmerken', 'groothandels_distributeurs', 'leveranciers');
  CREATE TYPE "public"."enum_brands_herkomst" AS ENUM('belgisch', 'nederlands', 'europees', 'internationaal');
  ALTER TYPE "public"."enum_brands_tags" ADD VALUE 'cruelty-free' BEFORE 'professioneel';
  ALTER TABLE "brands" ADD COLUMN "type_partner" "enum_brands_type_partner";
  ALTER TABLE "brands" ADD COLUMN "herkomst" "enum_brands_herkomst";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "brands_tags" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_brands_tags";
  CREATE TYPE "public"."enum_brands_tags" AS ENUM('belgisch', 'vegan', 'natuurlijk', 'professioneel', 'biologisch', 'duurzaam', 'luxe');
  ALTER TABLE "brands_tags" ALTER COLUMN "value" SET DATA TYPE "public"."enum_brands_tags" USING "value"::"public"."enum_brands_tags";
  ALTER TABLE "brands" DROP COLUMN "type_partner";
  ALTER TABLE "brands" DROP COLUMN "herkomst";
  DROP TYPE "public"."enum_brands_type_partner";
  DROP TYPE "public"."enum_brands_herkomst";`)
}
