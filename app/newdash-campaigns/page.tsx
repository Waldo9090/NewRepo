'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { UnifiedCampaignsDashboard } from "@/components/unified-campaigns-dashboard"
import { Loader2, LogOut } from "lucide-react"

export default function NewdashCampaignsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading campaigns...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Check if this is mike@delectablecap.com for special layout
  const isMikeUser = user.email === 'mike@delectablecap.com'

  // Special layout for mike@delectablecap.com (no sidebar)
  if (isMikeUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        {/* Custom header for Mike */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <div>
                <div className="font-semibold text-xl text-slate-800 tracking-tight">Welcome Immoo</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span>09:53</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-xl hover:bg-red-100 text-slate-600 hover:text-red-600"
                onClick={async () => {
                  try {
                    router.push('/signin')
                  } catch (error) {
                    router.push('/signin')
                  }
                }}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="p-8">
          <UnifiedCampaignsDashboard defaultCategory="roger" title="new dash Dashboard" />
        </main>
      </div>
    )
  }

  // Normal layout for other users (with sidebar)
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Sidebar />

      <div className="flex-1">
        <DashboardHeader />

        <main className="p-8">
          <UnifiedCampaignsDashboard defaultCategory="roger" title="new dash Dashboard" />
        </main>
      </div>
    </div>
  )
}
