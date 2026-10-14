import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * One level field (client round 2 #2.1): the course form had both the "Niveau"
 * dropdown (`level`) and the "Niveau & doelgroep" checkboxes (`targetAudience`).
 * The checkboxes stay (the filter uses them); each course's dropdown value is
 * copied over without creating duplicates:
 *   beginner -> beginner-friendly, gevorderd -> intermediate,
 *   expert -> expert-advanced, all -> all three.
 * The old `level` column is kept (hidden) so nothing is lost.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    WITH mapped AS (
      SELECT c.id AS parent_id, m.value
      FROM "courses" c
      JOIN (VALUES
        ('beginner', 'beginner-friendly'),
        ('gevorderd', 'intermediate'),
        ('expert', 'expert-advanced'),
        ('all', 'beginner-friendly'),
        ('all', 'intermediate'),
        ('all', 'expert-advanced')
      ) AS m(level, value) ON m.level = c."level"::text
    ),
    missing AS (
      SELECT mp.parent_id, mp.value FROM mapped mp
      WHERE NOT EXISTS (
        SELECT 1 FROM "courses_target_audience" t
        WHERE t."parent_id" = mp.parent_id AND t."value"::text = mp.value
      )
    )
    INSERT INTO "courses_target_audience" ("order", "parent_id", "value")
    SELECT
      COALESCE((SELECT MAX(t."order") FROM "courses_target_audience" t WHERE t."parent_id" = ms.parent_id), 0)
        + ROW_NUMBER() OVER (PARTITION BY ms.parent_id ORDER BY ms.value),
      ms.parent_id,
      ms.value::"public"."enum_courses_target_audience"
    FROM missing ms;`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // No-op: the copied levels are valid data on their own and `level` was kept.
}
