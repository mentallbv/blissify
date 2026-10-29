import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  // Allow phones on the local network to load the dev client and hydrate
  // interactive components (navigation, search, counters and FAQ).
  allowedDevOrigins: ['192.168.0.106'],
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  // URL structure from the copy (10/2026); old URLs keep their SEO via 301s.
  async redirects() {
    return [
      { source: '/opleiders', destination: '/salons-professionals', permanent: true },
      { source: '/opleiders/:slug', destination: '/salons-professionals/:slug', permanent: true },
      { source: '/merken', destination: '/merken-leveranciers', permanent: true },
      { source: '/merken/:slug', destination: '/merken-leveranciers/:slug', permanent: true },
      { source: '/prijzen', destination: '/abonnementen-tarieven', permanent: true },
      { source: '/prijzen/opleiders', destination: '/abonnementen-tarieven', permanent: true },
      { source: '/prijzen/merken-leveranciers', destination: '/abonnementen-tarieven?voor=merken', permanent: true },
      { source: '/voor-aanbieders', destination: '/abonnementen-tarieven', permanent: true },
      { source: '/bewaard', destination: '/favorieten', permanent: true },
      // Old category URLs -> the copy's SEO pages.
      { source: '/opleidingen/schoonheid', destination: '/opleidingen/schoonheidsspecialiste', permanent: true },
      { source: '/opleidingen/voetreflexologie', destination: '/opleidingen/reflexologie', permanent: true },
    ]
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
