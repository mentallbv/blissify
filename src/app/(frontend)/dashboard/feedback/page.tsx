import React from 'react'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { FeedbackForm } from '@/components/dashboard/FeedbackForm'

export default function DashboardFeedbackPage() {
  return (
    <>
      <PageTitle>Suggesties &amp; klachten</PageTitle>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.7, color: 'var(--text-body)', margin: '-8px 0 24px', maxWidth: 620 }}>
        Heb je een idee om Blissify beter te maken, of loopt er iets mis? Laat het ons weten. Je bericht gaat rechtstreeks naar het Blissify-team.
      </p>
      <FeedbackForm />
    </>
  )
}
