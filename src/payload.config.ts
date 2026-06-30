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
  // During the build's migrate step (PAYLOAD_MIGRATING=true) we use the
  // node-postgres adapter over the direct/unpooled connection. The Vercel/Neon
  // serverless driver only speaks WebSocket to the pooled host and cannot use a
  // direct TCP connection (it falls back to wss://localhost and fails), so
  // migrations need a real TCP/SSL driver. At runtime we use the Vercel adapter
  // with the pooled DATABASE_URL, which is what serverless wants.
  db:
    process.env.PAYLOAD_MIGRATING === 'true'
      ? postgresAdapter({
          pool: {
            connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || '',
            ssl: { rejectUnauthorized: false },
          },
          push: false,
        })
      : vercelPostgresAdapter({
          pool: {
            connectionString: process.env.DATABASE_URL || '',
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
