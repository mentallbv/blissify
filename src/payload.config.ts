import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Brands } from './collections/Brands'
import { Trainers } from './collections/Trainers'
import { Courses } from './collections/Courses'
import { Pages } from './collections/Pages'
import { Navigation } from './globals/Navigation'
import { Homepage } from './globals/Homepage'
import { Footer } from './globals/Footer'
import { Branding } from './globals/Branding'
import { SeoSettings } from './globals/SeoSettings'
import { Pricing } from './globals/Pricing'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Categories, Brands, Trainers, Courses, Pages],
  globals: [Navigation, Homepage, Footer, Branding, SeoSettings, Pricing],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: vercelPostgresAdapter({
    pool: {
      // Runtime uses the pooled connection (DATABASE_URL). During the build's
      // migrate step we set PAYLOAD_MIGRATING=true to use the direct/unpooled
      // connection (DATABASE_URL_UNPOOLED), since the pooler can break DDL.
      connectionString:
        (process.env.PAYLOAD_MIGRATING === 'true' && process.env.DATABASE_URL_UNPOOLED) ||
        process.env.DATABASE_URL ||
        '',
    },
    push: process.env.NODE_ENV === 'development',
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
})
