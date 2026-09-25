import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-vercel-postgres'

/**
 * Remove the "Eigen branding" feature from the pricing global (client feedback
 * #7). The pricing copy lives in CMS data, not code, so this runs as a data
 * migration (automatic on deploy) rather than a manual script:
 *  - "Eigen branding en Ultimate badge" -> "Ultimate badge"
 *  - drop the standalone "Eigen branding" comparison row
 *  - trim the phrase from the Ultimate tier description
 * Idempotent: re-running finds nothing left to change.
 */
function deepFix(node: unknown): unknown {
  if (Array.isArray(node)) {
    return node
      .filter((item) => !(item && typeof item === 'object' && (item as { feature?: string }).feature === 'Eigen branding'))
      .map(deepFix)
  }
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) out[k] = deepFix(v)
    return out
  }
  if (typeof node === 'string') {
    if (node === 'Eigen branding en Ultimate badge') return 'Ultimate badge'
    return node.replace('met eigen branding, ', 'met ')
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
