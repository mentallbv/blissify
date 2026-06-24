import React from 'react'
import type { Metadata } from 'next'
import { SystemView } from '@/components/site/SystemView'

export const metadata: Metadata = { title: 'Betaling geslaagd' }

export default function BetalingSuccesPage() {
  return <SystemView state="betaling-succes" />
}
