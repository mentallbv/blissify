import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { MediaPopulator } from '@/components/admin/MediaPopulator'

export const dynamic = 'force-dynamic'

export default async function AdminMediaPopulationPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/inloggen?next=/admin-media-populatie')
  if ((user as { role?: string }).role !== 'admin') redirect('/')
  return <MediaPopulator />
}
