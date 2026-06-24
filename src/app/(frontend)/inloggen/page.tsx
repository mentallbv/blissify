import React from 'react'
import type { Metadata } from 'next'
import { AuthView } from '@/components/site/AuthView'

export const metadata: Metadata = { title: 'Inloggen' }

export default function InloggenPage() {
  return <AuthView mode="inloggen" />
}
