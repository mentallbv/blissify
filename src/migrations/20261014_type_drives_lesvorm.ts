import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * Type opleiding drives the lesvorm (client round 2 #2.9 / #3.7). Brings
 * existing courses in line with the new rule:
 *  1. A course without a type gets one from its lesvorm: online-only becomes
 *     "Online cursus (zelfstudie)", online + on location (hybride) "Live les"
 *     (which keeps "Beide"), anything else "Praktijkopleiding".
 *  2. Types that settle the lesvorm get exactly that one: Praktijkopleiding is
 *     on location, Online cursus and Webinar are online.
 * Workshops, coaching, events and live lessons keep the lesvorm they had.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "courses" c SET "course_type" = CASE
      WHEN EXISTS (SELECT 1 FROM "courses_format" f WHERE f."parent_id" = c."id" AND f."value" = 'online')
       AND NOT EXISTS (SELECT 1 FROM "courses_format" f WHERE f."parent_id" = c."id" AND f."value" <> 'online')
      THEN 'online_course'::"enum_courses_course_type"
      WHEN EXISTS (SELECT 1 FROM "courses_format" f WHERE f."parent_id" = c."id" AND f."value" = 'hybride')
        OR (EXISTS (SELECT 1 FROM "courses_format" f WHERE f."parent_id" = c."id" AND f."value" = 'online')
            AND EXISTS (SELECT 1 FROM "courses_format" f WHERE f."parent_id" = c."id" AND f."value" = 'fysiek'))
      THEN 'live_course'::"enum_courses_course_type"
      ELSE 'practice_training'::"enum_courses_course_type"
    END
    WHERE c."course_type" IS NULL;

    DELETE FROM "courses_format" f USING "courses" c
    WHERE f."parent_id" = c."id" AND c."course_type" IN ('practice_training', 'online_course', 'webinar');

    INSERT INTO "courses_format" ("order", "parent_id", "value")
    SELECT 1, c."id", CASE WHEN c."course_type" = 'practice_training' THEN 'fysiek' ELSE 'online' END::"enum_courses_format"
    FROM "courses" c
    WHERE c."course_type" IN ('practice_training', 'online_course', 'webinar');`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // No-op: the derived values are valid under the old model too.
}
