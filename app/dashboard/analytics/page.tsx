'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { isRogerCampaignsOnlyUser } from '@/lib/special-users'
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { Loader2 } from 'lucide-react'

export default function DashboardAnalyticsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/signin')
      } else if (isRogerCampaignsOnlyUser(user.email)) {
        // Redirect Roger Campaigns only users
        router.push('/roger-campaigns')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-500 dark:text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to signin
  }

  return <AnalyticsDashboard />
}