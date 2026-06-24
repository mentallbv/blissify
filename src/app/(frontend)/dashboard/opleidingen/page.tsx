import React from 'react'
import { PageTitle } from '@/components/dashboard/DashSidebar'
import { CoursesManager } from '@/components/dashboard/CoursesManager'
import { Button } from '@/components/ui'
import { DASH_COURSES } from '@/lib/dashboard'

export default function DashboardCoursesPage() {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <PageTitle>Opleidingen</PageTitle>
        <Button variant="accent" size="sm" icon={<i className="ti ti-plus" />}>
          Opleiding toevoegen
        </Button>
      </div>
      <CoursesManager rows={DASH_COURSES} />
    </>
  )
}
