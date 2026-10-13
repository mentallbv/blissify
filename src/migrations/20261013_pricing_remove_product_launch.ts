import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-vercel-postgres'

/**
 * Remove "Productlanceringen extra uitlichten" from the Partner Ultimate
 * pricing copy (client round 2 #2.12): there are no separate product pages, so
 * the feature no longer exists. Pricing copy lives in CMS data, so this is a
 * data migration. Idempotent.
 */
const isLaunch = (item: unknown) =>
  (typeof item === 'string' && /productlancering/i.test(item)) ||
  (!!item && typeof item === 'object' && /productlancering/i.test(String((item as { feature?: unknown }).feature ?? '')))

function deepFix(node: unknown): unknown {
  if (Array.isArray(node)) return node.filter((item) => !isLaunch(item)).map(deepFix)
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) out[k] = deepFix(v)
    return out
  }
  return node
}

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const current = await payload.findGlobal({ slug: 'pricing' as never, depth: 0 })
  const fixed = deepFix(current) as Record<string, unknown>
  delete fixed.id
  delete (fixed as { createdAt?: unknown }).createdAt
  delete (fixed as { updatedAt?: unknown }).updatedAt
  await payload.updateGlobal({ slug: 'pricing' as never, data: fixed as never })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // No-op: the removed marketing copy is not restored.
}
