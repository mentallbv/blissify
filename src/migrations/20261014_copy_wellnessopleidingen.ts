import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-vercel-postgres'

/**
 * Copy fix: "De Europese standaard voor wellnessopleiding." → "…wellnessopleidingen."
 * The hero highlight and the Over ons page live in CMS data, so this is a data
 * migration. Only that phrase changes; correct singular uses elsewhere stay.
 * Idempotent.
 */
const fix = (s: string): string =>
  s === 'wellnessopleiding.'
    ? 'wellnessopleidingen.'
    : s
        .replace(/standaard voor wellnessopleiding(?!en)/gi, 'standaard voor wellnessopleidingen')
        .replace(/voor professionele wellnessopleiding(?!en)/gi, 'voor professionele wellnessopleidingen')

function deepFix(node: unknown): unknown {
  if (typeof node === 'string') return fix(node)
  if (Array.isArray(node)) return node.map(deepFix)
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) out[k] = deepFix(v)
    return out
  }
  return node
}

const strip = (doc: Record<string, unknown>) => {
  const d = { ...doc }
  delete d.id
  delete d.createdAt
  delete d.updatedAt
  return d
}

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const home = await payload.findGlobal({ slug: 'homepage' as never, depth: 0 })
  const fixedHome = deepFix(home)
  if (JSON.stringify(fixedHome) !== JSON.stringify(home)) {
    await payload.updateGlobal({ slug: 'homepage' as never, data: strip(fixedHome as Record<string, unknown>) as never })
  }
  const pages = await payload.find({ collection: 'pages' as never, depth: 0, limit: 200, overrideAccess: true })
  for (const page of pages.docs as unknown as Record<string, unknown>[]) {
    const fixed = deepFix(page)
    if (JSON.stringify(fixed) !== JSON.stringify(page)) {
      await payload.update({ collection: 'pages' as never, id: page.id as never, data: strip(fixed as Record<string, unknown>) as never, overrideAccess: true })
    }
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // No-op: the corrected copy is not reverted.
}
