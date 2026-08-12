import { getPayload } from 'payload'
import { config as loadEnv } from 'dotenv'

const hasInjectedProductionEnv =
  Boolean(process.env.BLOB_READ_WRITE_TOKEN?.startsWith('vercel_blob_rw_')) &&
  Boolean(
    (process.env.DATABASE_URL || process.env.POSTGRES_DATABASE_URL || process.env.POSTGRES_URL)?.match(/^postgres(ql)?:\/\//),
  )

// Local fallback only. `vercel env run -e production` is preferred because
// encrypted Vercel variables may be written as placeholders by `env pull`.
if (!hasInjectedProductionEnv) loadEnv({ path: '.env.production.local', override: true })

const APPLY = process.argv.includes('--apply')
const CONFIRMED = process.env.POPULATE_PRODUCTION_MEDIA === 'yes'
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_DATABASE_URL || process.env.POSTGRES_URL || ''

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1200&h=800&q=80&auto=format&fit=crop`

const coursePhotos = [
  '1519823551278-64ac92734fb1',
  '1604654894610-df63bc536371',
  '1512290923902-8a9f81dc236c',
  '1544367567-0f2fcb009e0b',
  '1490645935967-10de6ba17061',
  '1570172619644-dfd03ed5d881',
]
const brandPhotos = [
  '1560066984-138dadb4c035',
  '1596462502278-27bfdc403348',
  '1522337660859-02fbefca4702',
  '1600334089648-b0d9d3028eb2',
]
const staticPhotos = [
  '1570172619644-dfd03ed5d881',
  '1512290923902-8a9f81dc236c',
  '1544161515-4ab6ce6db874',
]

function safeName(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'image'
}

function databaseTarget(value: string) {
  try {
    const url = new URL(value)
    return `${url.hostname}/${url.pathname.replace(/^\//, '') || '(default)'}`
  } catch {
    return value ? 'configured (host unavailable)' : 'NOT CONFIGURED'
  }
}

async function download(url: string, fallbackKey: string) {
  const fetchImage = async (source: string) => {
    const response = await fetch(source)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const mimetype = response.headers.get('content-type') || 'image/jpeg'
    return {
      data: Buffer.from(await response.arrayBuffer()),
      mimetype,
      extension: mimetype.includes('png') ? 'png' : 'jpg',
    }
  }

  try {
    return await fetchImage(url)
  } catch {
    return fetchImage(`https://picsum.photos/seed/${encodeURIComponent(fallbackKey)}/1200/800`)
  }
}

async function run() {
  console.log('Blissify media population')
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}`)
  console.log(`Database: ${databaseTarget(databaseUrl)}`)
  console.log(`Blob token: ${process.env.BLOB_READ_WRITE_TOKEN ? 'configured' : 'MISSING'}`)

  if (!databaseUrl) throw new Error('No production database URL was loaded.')
  if (APPLY && !process.env.BLOB_READ_WRITE_TOKEN) throw new Error('BLOB_READ_WRITE_TOKEN is missing.')
  if (APPLY && !CONFIRMED) {
    throw new Error('Apply mode requires POPULATE_PRODUCTION_MEDIA=yes.')
  }

  // Payload config reads its connection and Blob settings during module
  // evaluation, so import it only after the production env file is loaded.
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })
  const createdMedia: number[] = []
  let updates = 0

  async function upload(source: string, alt: string, key: string) {
    const image = await download(source, key)
    const document = await payload.create({
      collection: 'media',
      data: { alt },
      file: {
        data: image.data,
        mimetype: image.mimetype,
        name: `${safeName(key)}-${Date.now()}.${image.extension}`,
        size: image.data.length,
      },
      overrideAccess: true,
    })
    createdMedia.push(document.id)
    return document.id
  }

  const courses = await payload.find({ collection: 'courses', limit: 500, depth: 0, overrideAccess: true })
  const trainers = await payload.find({ collection: 'trainers', limit: 500, depth: 0, overrideAccess: true })
  const brands = await payload.find({ collection: 'brands', limit: 500, depth: 0, overrideAccess: true })
  const pages = await payload.find({ collection: 'pages', limit: 100, depth: 0, overrideAccess: true })
  const homepage = await payload.findGlobal({ slug: 'homepage', depth: 0, overrideAccess: true })

  const missingCourses = courses.docs.filter((course) => !course.coverImage)
  const missingTrainers = trainers.docs.filter((trainer) => !trainer.photo)
  const brandTasks = brands.docs.reduce((count, brand) => count + Number(!brand.logo) + Number(!brand.coverImage), 0)
  const missingPageHeroes = pages.docs.filter((page) => !page.hero?.image)
  const homepageTiles = homepage.photoSection?.tiles || []
  const missingHomepageTiles = homepageTiles.filter((tile) => !tile.image)

  console.log('\nDatabase fingerprint:')
  console.log(`  Courses/trainers/brands: ${courses.totalDocs}/${trainers.totalDocs}/${brands.totalDocs}`)
  console.log(`  First courses: ${courses.docs.slice(0, 3).map((course) => course.title).join(' | ') || '(none)'}`)

  console.log('\nPlanned changes (empty fields only):')
  console.log(`  Course covers: ${missingCourses.length}`)
  console.log(`  Trainer photos: ${missingTrainers.length}`)
  console.log(`  Brand logos/covers: ${brandTasks}`)
  console.log(`  Page hero images: ${missingPageHeroes.length}`)
  console.log(`  Homepage photo tiles: ${missingHomepageTiles.length}`)

  if (!APPLY) {
    console.log('\nDry run complete. No files uploaded and no records changed.')
    return
  }

  for (let index = 0; index < missingCourses.length; index++) {
    const course = missingCourses[index]
    const image = await upload(unsplash(coursePhotos[index % coursePhotos.length]), course.title, `course-${course.id}`)
    await payload.update({ collection: 'courses', id: course.id, data: { coverImage: image }, overrideAccess: true })
    updates++
    console.log(`  ✓ Course: ${course.title}`)
  }

  for (let index = 0; index < missingTrainers.length; index++) {
    const trainer = missingTrainers[index]
    const image = await upload(`https://randomuser.me/api/portraits/${index % 2 ? 'men' : 'women'}/${20 + (index % 70)}.jpg`, trainer.displayName, `trainer-${trainer.id}`)
    await payload.update({ collection: 'trainers', id: trainer.id, data: { photo: image }, overrideAccess: true })
    updates++
    console.log(`  ✓ Trainer: ${trainer.displayName}`)
  }

  for (let index = 0; index < brands.docs.length; index++) {
    const brand = brands.docs[index]
    const data: { logo?: number; coverImage?: number } = {}
    if (!brand.logo) {
      data.logo = await upload(`https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&size=512&background=1a2e25&color=f5f0ea&bold=true&format=png`, `${brand.name} logo`, `brand-${brand.id}-logo`)
    }
    if (!brand.coverImage) {
      data.coverImage = await upload(unsplash(brandPhotos[index % brandPhotos.length]), `${brand.name} sfeerbeeld`, `brand-${brand.id}-cover`)
    }
    if (Object.keys(data).length) {
      await payload.update({ collection: 'brands', id: brand.id, data, overrideAccess: true })
      updates += Object.keys(data).length
      console.log(`  ✓ Brand: ${brand.name}`)
    }
  }

  for (let index = 0; index < missingPageHeroes.length; index++) {
    const page = missingPageHeroes[index]
    const image = await upload(unsplash(staticPhotos[index % staticPhotos.length]), `${page.title} omslag`, `page-${page.id}-hero`)
    await payload.update({ collection: 'pages', id: page.id, data: { hero: { ...page.hero, image } }, overrideAccess: true })
    updates++
    console.log(`  ✓ Page: ${page.title}`)
  }

  if (missingHomepageTiles.length) {
    const tiles = []
    for (let index = 0; index < homepageTiles.length; index++) {
      const tile = homepageTiles[index]
      const image = tile.image || await upload(unsplash(staticPhotos[index % staticPhotos.length]), tile.title || `Blissify stap ${index + 1}`, `homepage-tile-${index + 1}`)
      tiles.push({ ...tile, image })
      if (!tile.image) updates++
    }
    await payload.updateGlobal({ slug: 'homepage', data: { photoSection: { ...homepage.photoSection, tiles } }, overrideAccess: true })
    console.log('  ✓ Homepage photo tiles')
  }

  console.log(`\nDone: ${createdMedia.length} media files uploaded, ${updates} empty image fields populated.`)
}

run().catch((error) => {
  const details = error instanceof Error
    ? `${error.name}: ${error.message}${error.cause ? ` (${String(error.cause)})` : ''}`
    : JSON.stringify(error)
  console.error(`\nFailed: ${details}`)
  process.exitCode = 1
})
