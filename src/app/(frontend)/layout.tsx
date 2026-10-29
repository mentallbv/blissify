import React from 'react'
import type { Metadata } from 'next'
import '../../styles/blissify.css'

export const metadata: Metadata = {
  title: {
    // Copy 10/2026 (homepage title, under 60 characters).
    default: 'Opleidingen, vacatures en werkruimtes beauty & wellness | Blissify',
    template: '%s | Blissify',
  },
  description:
    'Het platform voor beauty- en wellnessprofessionals in België en Nederland. Vind opleidingen, merken, werkruimtes en vacatures op één plek.',
  icons: {
    icon: [
      { url: '/brand/favicon.svg', type: 'image/svg+xml' },
      { url: '/brand/favicon-32.png', sizes: '32x32' },
      { url: '/brand/favicon-64.png', sizes: '64x64' },
    ],
    apple: '/brand/apple-touch-icon.png',
  },
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.31.0/dist/tabler-icons.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
