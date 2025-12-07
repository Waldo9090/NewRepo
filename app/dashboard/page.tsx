'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { isRogerCampaignsOnlyUser } from '@/lib/special-users'
import { OverviewDashboard } from "@/components/overview-dashboard"
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAdminAuth, setIsAdminAuth] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Set client flag to avoid SSR issues
    setIsClient(true)

    // Check if admin is logged in via localStorage (only on client)
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          if (userData.email === 'adimahna@gmail.com') {
            setIsAdminAuth(true)
            return
          }
        } catch (e) {
          console.error('Error parsing stored user:', e)
        }
      }
    }

    // Regular Firebase auth checks
    if (!loading) {
      if (!user) {
        router.push('/signin')
      } else if (isRogerCampaignsOnlyUser(user.email)) {
        // Redirect Roger Campaigns only users
        router.push('/roger-campaigns')
      }
    }
  }, [user, loading, router])

  // Show loading until client-side hydration is complete
  if (!isClient || (loading && !isAdminAuth)) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-500 dark:text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user && !isAdminAuth) {
    return null // Will redirect to signin
  }

  return <OverviewDashboard />
}