import React from 'react'
import type { Metadata } from 'next'
import { AuthView } from '@/components/site/AuthView'

export const metadata: Metadata = { title: 'Account aanmaken' }

export default function RegistrerenPage() {
  return <AuthView mode="registreren" />
}
