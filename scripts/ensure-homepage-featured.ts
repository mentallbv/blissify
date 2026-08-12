import { getPayload } from 'payload'

import config from '../src/payload.config'

type Owner = {
  subscriptionTier?: string | null
  brandTier?: string | null
}

type Profile = {
  id: number | string
  owner?: number | string | Owner | null
}

const relationID = (value: unknown): number | string | null => {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) {
    return (value as { id: number | string }).id
  }
  return null
}

async function run() {
  const payload = await getPayload({ config })
  const [trainers, brands] = await Promise.all([
    payload.find({ collection: 'trainers', depth: 1, limit: 500, overrideAccess: true }),
    payload.find({ collection: 'brands', depth: 1, limit: 500, overrideAccess: true }),
  ])

  const eligibleTrainers = (trainers.docs as Profile[]).filter(
    (profile) => typeof profile.owner === 'object' && profile.owner?.subscriptionTier === 'premium',
  )
  const eligibleBrands = (brands.docs as Profile[]).filter(
    (profile) =>
      typeof profile.owner === 'object' &&
      ['partner_professional', 'partner_premium'].includes(profile.owner?.brandTier || ''),
  )

  async function featureCourses(field: 'trainer' | 'brand', profiles: Profile[]) {
    let updated = 0
    for (const profile of profiles) {
      const profileID = relationID(profile)
      if (profileID == null) continue
      const courses = await payload.find({
        collection: 'courses',
        where: { and: [{ status: { equals: 'published' } }, { [field]: { equals: profileID } }] } as never,
        limit: 2,
        sort: '-createdAt',
        depth: 0,
        overrideAccess: true,
      })
      for (const course of courses.docs) {
        await payload.update({
          collection: 'courses',
          id: course.id,
          data: { featured: true } as never,
          overrideAccess: true,
        })
        updated += 1
      }
    }
    return updated
  }

  const trainerCourses = await featureCourses('trainer', eligibleTrainers)
  const brandCourses = await featureCourses('brand', eligibleBrands)

  console.log(`Eligible premium trainers: ${eligibleTrainers.length}`)
  console.log(`Eligible Professional/Premium brands: ${eligibleBrands.length}`)
  console.log(`Featured individual courses ensured: ${trainerCourses}`)
  console.log(`Featured brand courses ensured: ${brandCourses}`)
}

await run()
