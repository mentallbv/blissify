import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

export const maxDuration = 60

const BATCH_SIZE = 3
const coursePhotos = [
  '1519823551278-64ac92734fb1', '1604654894610-df63bc536371', '1512290923902-8a9f81dc236c',
  '1544367567-0f2fcb009e0b', '1490645935967-10de6ba17061', '1570172619644-dfd03ed5d881',
]
const brandPhotos = [
  '1560066984-138dadb4c035', '1596462502278-27bfdc403348',
  '1522337660859-02fbefca4702', '1600334089648-b0d9d3028eb2',
]
const staticPhotos = ['1570172619644-dfd03ed5d881', '1512290923902-8a9f81dc236c', '1544161515-4ab6ce6db874']
const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?w=1200&h=800&q=80&auto=format&fit=crop`

function safeName(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'image'
}

async function download(source: string, fallback: string) {
  const fetchImage = async (url: string) => {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Afbeelding ophalen mislukt (${response.status}).`)
    const mimetype = response.headers.get('content-type') || 'image/jpeg'
    return { data: Buffer.from(await response.arrayBuffer()), mimetype, extension: mimetype.includes('png') ? 'png' : 'jpg' }
  }
  try {
    return await fetchImage(source)
  } catch {
    return fetchImage(`https://picsum.photos/seed/${encodeURIComponent(fallback)}/1200/800`)
  }
}

async function context() {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await getHeaders() })
  if (!user || (user as { role?: string }).role !== 'admin') return null
  return payload
}

async function status(payload: Awaited<ReturnType<typeof getPayload>>) {
  const [courses, trainers, brands, pages, homepage] = await Promise.all([
    payload.find({ collection: 'courses', limit: 500, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'trainers', limit: 500, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'brands', limit: 500, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'pages', limit: 100, depth: 0, overrideAccess: true }),
    payload.findGlobal({ slug: 'homepage', depth: 0, overrideAccess: true }),
  ])
  return {
    courses: courses.docs.filter((item) => !item.coverImage).length,
    trainers: trainers.docs.filter((item) => !item.photo).length,
    brandLogos: brands.docs.filter((item) => !item.logo).length,
    brandCovers: brands.docs.filter((item) => !item.coverImage).length,
    pageHeroes: pages.docs.filter((item) => !item.hero?.image).length,
    homepageTiles: (homepage.photoSection?.tiles || []).filter((item) => !item.image).length,
  }
}

export async function GET() {
  const payload = await context()
  if (!payload) return NextResponse.json({ error: 'Alleen voor administrators.' }, { status: 403 })
  return NextResponse.json({ remaining: await status(payload) })
}

export async function POST() {
  const payload = await context()
  if (!payload) return NextResponse.json({ error: 'Alleen voor administrators.' }, { status: 403 })
  if (!process.env.BLOB_READ_WRITE_TOKEN?.startsWith('vercel_blob_rw_')) {
    return NextResponse.json({ error: 'De Blob-token ontbreekt in de productieomgeving.' }, { status: 500 })
  }

  let slots = BATCH_SIZE
  const populated: string[] = []
  const upload = async (source: string, alt: string, key: string) => {
    const image = await download(source, key)
    const media = await payload.create({
      collection: 'media', data: { alt }, overrideAccess: true,
      file: { data: image.data, mimetype: image.mimetype, name: `${safeName(key)}-${Date.now()}.${image.extension}`, size: image.data.length },
    })
    return media.id
  }

  try {
    const courses = await payload.find({ collection: 'courses', limit: 500, depth: 0, overrideAccess: true })
    for (const course of courses.docs.filter((item) => !item.coverImage)) {
      if (!slots) break
      const image = await upload(unsplash(coursePhotos[Number(course.id) % coursePhotos.length]), course.title, `course-${course.id}`)
      await payload.update({ collection: 'courses', id: course.id, data: { coverImage: image }, overrideAccess: true })
      populated.push(`Opleiding: ${course.title}`)
      slots--
    }

    if (slots) {
      const trainers = await payload.find({ collection: 'trainers', limit: 500, depth: 0, overrideAccess: true })
      for (const trainer of trainers.docs.filter((item) => !item.photo)) {
        if (!slots) break
        const index = Number(trainer.id) % 70 + 20
        const image = await upload(`https://randomuser.me/api/portraits/${index % 2 ? 'men' : 'women'}/${index}.jpg`, trainer.displayName, `trainer-${trainer.id}`)
        await payload.update({ collection: 'trainers', id: trainer.id, data: { photo: image }, overrideAccess: true })
        populated.push(`Opleider: ${trainer.displayName}`)
        slots--
      }
    }

    if (slots) {
      const brands = await payload.find({ collection: 'brands', limit: 500, depth: 0, overrideAccess: true })
      for (const brand of brands.docs) {
        if (!slots) break
        if (!brand.logo) {
          const logo = await upload(`https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&size=512&background=1a2e25&color=f5f0ea&bold=true&format=png`, `${brand.name} logo`, `brand-${brand.id}-logo`)
          await payload.update({ collection: 'brands', id: brand.id, data: { logo }, overrideAccess: true })
          populated.push(`Merklogo: ${brand.name}`)
          slots--
        }
        if (slots && !brand.coverImage) {
          const coverImage = await upload(unsplash(brandPhotos[Number(brand.id) % brandPhotos.length]), `${brand.name} sfeerbeeld`, `brand-${brand.id}-cover`)
          await payload.update({ collection: 'brands', id: brand.id, data: { coverImage }, overrideAccess: true })
          populated.push(`Merkomslag: ${brand.name}`)
          slots--
        }
      }
    }

    if (slots) {
      const pages = await payload.find({ collection: 'pages', limit: 100, depth: 0, overrideAccess: true })
      for (const page of pages.docs.filter((item) => !item.hero?.image)) {
        if (!slots) break
        const image = await upload(unsplash(staticPhotos[Number(page.id) % staticPhotos.length]), `${page.title} omslag`, `page-${page.id}-hero`)
        await payload.update({ collection: 'pages', id: page.id, data: { hero: { ...page.hero, image } }, overrideAccess: true })
        populated.push(`Pagina: ${page.title}`)
        slots--
      }
    }

    if (slots) {
      const homepage = await payload.findGlobal({ slug: 'homepage', depth: 0, overrideAccess: true })
      const tiles = homepage.photoSection?.tiles || []
      let changed = false
      for (let index = 0; index < tiles.length && slots; index++) {
        if (tiles[index].image) continue
        tiles[index].image = await upload(unsplash(staticPhotos[index % staticPhotos.length]), tiles[index].title || `Blissify stap ${index + 1}`, `homepage-tile-${index + 1}`)
        populated.push(`Homepage tegel: ${tiles[index].title || index + 1}`)
        changed = true
        slots--
      }
      if (changed) await payload.updateGlobal({ slug: 'homepage', data: { photoSection: { ...homepage.photoSection, tiles } }, overrideAccess: true })
    }

    return NextResponse.json({ populated, remaining: await status(payload), done: populated.length === 0 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Media aanvullen mislukt.' }, { status: 500 })
  }
}
