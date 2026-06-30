import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { postgresAdapter } from '@payloadcms/db-postgres'
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

// Pooled connection (WebSocket-based) used at runtime by the Vercel adapter.
const RUNTIME_URL =
  process.env.DATABASE_URL || process.env.POSTGRES_DATABASE_URL || process.env.POSTGRES_URL || ''
// Direct/unpooled connection (plain TCP/SSL) used by node-postgres for migrations.
const MIGRATE_URL =
  process.env.POSTGRES_DATABASE_URL_UNPOOLED || process.env.DATABASE_URL_UNPOOLED || RUNTIME_URL

// During the build's migrate step (PAYLOAD_MIGRATING=true) we use the
// node-postgres adapter over the direct/unpooled connection. The Vercel/Neon
// serverless driver only speaks WebSocket to the pooled host and cannot use a
// direct TCP connection (it falls back to wss://localhost and fails), so
// migrations need a real TCP/SSL driver. At runtime we use the Vercel adapter
// with the pooled connection, which is what serverless wants.
const dbAdapter =
  process.env.PAYLOAD_MIGRATING === 'true'
    ? postgresAdapter({
        pool: {
          connectionString: MIGRATE_URL,
          ssl: { rejectUnauthorized: false },
        },
        push: false,
      })
    : vercelPostgresAdapter({
        pool: {
          connectionString: RUNTIME_URL,
        },
        // Push (dynamic dev schema sync) must NEVER run on Vercel - it bypasses
        // migrations and creates drift that triggers the destructive "run in dev
        // mode" prompt on deploy. It is only allowed in true local development
        // (NODE_ENV=development AND not on Vercel), where .env must point at a
        // dev-only database branch, never production.
        push: process.env.NODE_ENV === 'development' && !process.env.VERCEL,
      })

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
  db: dbAdapter,
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
