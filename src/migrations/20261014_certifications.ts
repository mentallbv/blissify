import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * "Certificaten, diploma's & erkenningen" (client round 2, section 6).
 *
 * Schema: the certification choices become the client's six options, and three
 * groups hold the details of the mbo-diploma, branche-diploma and accredited
 * training choices. The old `certificate` / `accreditation` columns stay.
 *
 * Data: every course on the platform is still test data, so (at the request of
 * the team) each course gets a varied, realistic set of choices and details,
 * picked deterministically from its id, instead of a lossy mapping of the old
 * five tags. Re-running produces the same result.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "courses_certification_types";
    ALTER TYPE "public"."enum_courses_certification_types" RENAME TO "enum_courses_certification_types_old";
    CREATE TYPE "public"."enum_courses_certification_types" AS ENUM('certificaat', 'diploma', 'mbo-diploma', 'branche-diploma', 'geaccrediteerde-bijscholing', 'geen');
    ALTER TABLE "courses_certification_types" ALTER COLUMN "value" TYPE "public"."enum_courses_certification_types" USING "value"::text::"public"."enum_courses_certification_types";
    DROP TYPE "public"."enum_courses_certification_types_old";

    DO $$ BEGIN
      CREATE TYPE "public"."enum_courses_accredited_training_amount_unit" AS ENUM('points', 'hours');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    ALTER TABLE "courses"
      ADD COLUMN IF NOT EXISTS "mbo_diploma_name" varchar,
      ADD COLUMN IF NOT EXISTS "mbo_diploma_crebo" varchar,
      ADD COLUMN IF NOT EXISTS "mbo_diploma_institution" varchar,
      ADD COLUMN IF NOT EXISTS "mbo_diploma_url" varchar,
      ADD COLUMN IF NOT EXISTS "branche_diploma_name" varchar,
      ADD COLUMN IF NOT EXISTS "branche_diploma_organisation" varchar,
      ADD COLUMN IF NOT EXISTS "branche_diploma_url" varchar,
      ADD COLUMN IF NOT EXISTS "accredited_training_authority" varchar,
      ADD COLUMN IF NOT EXISTS "accredited_training_register" varchar,
      ADD COLUMN IF NOT EXISTS "accredited_training_amount" numeric,
      ADD COLUMN IF NOT EXISTS "accredited_training_amount_unit" "enum_courses_accredited_training_amount_unit" DEFAULT 'points',
      ADD COLUMN IF NOT EXISTS "accredited_training_number" varchar,
      ADD COLUMN IF NOT EXISTS "accredited_training_url" varchar;

    -- Test data: seven combinations, rotated by course id.
    WITH combos(k, value, ord) AS (VALUES
      (0, 'certificaat', 1),
      (1, 'certificaat', 1), (1, 'diploma', 2),
      (2, 'mbo-diploma', 1),
      (3, 'certificaat', 1), (3, 'branche-diploma', 2),
      (4, 'geaccrediteerde-bijscholing', 1),
      (5, 'geen', 1),
      (6, 'diploma', 1), (6, 'geaccrediteerde-bijscholing', 2)
    )
    INSERT INTO "courses_certification_types" ("order", "parent_id", "value")
    SELECT cb.ord, c.id, cb.value::"public"."enum_courses_certification_types"
    FROM "courses" c JOIN combos cb ON cb.k = c.id % 7;

    UPDATE "courses" c SET
      "mbo_diploma_name" = (ARRAY['Schoonheidsspecialist', 'Allround schoonheidsspecialist', 'Medewerker Uiterlijke Verzorging'])[1 + c.id % 3],
      "mbo_diploma_crebo" = (ARRAY['25404', '25405', '25401'])[1 + c.id % 3],
      "mbo_diploma_institution" = (ARRAY['ROC van Amsterdam', 'Graafschap College', 'ROC Midden Nederland'])[1 + c.id % 3],
      "mbo_diploma_url" = CASE WHEN c.id % 2 = 0 THEN 'https://www.s-bb.nl' ELSE NULL END
    WHERE c.id % 7 = 2;

    UPDATE "courses" c SET
      "branche_diploma_name" = (ARRAY['Schoonheidsspecialist ANBOS', 'Pedicure ProVoet', 'Huidtherapie Beauty Expert'])[1 + c.id % 3],
      "branche_diploma_organisation" = (ARRAY['ANBOS', 'ProVoet', 'Beautyprofs'])[1 + c.id % 3],
      "branche_diploma_url" = CASE WHEN c.id % 2 = 0 THEN 'https://www.anbos.nl' ELSE NULL END
    WHERE c.id % 7 = 3;

    UPDATE "courses" c SET
      "accredited_training_authority" = (ARRAY['ANBOS', 'Kwaliteitsregister Paramedici', 'SKB Huidtherapie'])[1 + c.id % 3],
      "accredited_training_register" = (ARRAY['Schoonheidsspecialisten', 'Huidtherapeuten', 'Pedicures'])[1 + c.id % 3],
      "accredited_training_amount" = (ARRAY[4, 8, 12, 16])[1 + c.id % 4],
      "accredited_training_amount_unit" = CASE WHEN c.id % 2 = 0 THEN 'points' ELSE 'hours' END::"public"."enum_courses_accredited_training_amount_unit",
      "accredited_training_number" = CASE WHEN c.id % 3 = 0 THEN NULL ELSE 'ACC-' || (2026000 + c.id)::text END,
      "accredited_training_url" = NULL
    WHERE c.id % 7 IN (4, 6);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "courses_certification_types";
    ALTER TYPE "public"."enum_courses_certification_types" RENAME TO "enum_courses_certification_types_old";
    CREATE TYPE "public"."enum_courses_certification_types" AS ENUM('certificate-included', 'diploma-possible', 'accredited-recognized', 'industry-recognized', 'mbo-recognized');
    ALTER TABLE "courses_certification_types" ALTER COLUMN "value" TYPE "public"."enum_courses_certification_types" USING "value"::text::"public"."enum_courses_certification_types";
    DROP TYPE "public"."enum_courses_certification_types_old";`)
}
