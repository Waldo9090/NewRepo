'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { UnifiedCampaignsDashboard } from "@/components/unified-campaigns-dashboard"
import { Loader2, LogOut, AlertCircle } from "lucide-react"

interface UserPermissions {
  isAdmin: boolean
  allowedCampaigns: string[]
}

export default function PrusaCampaignsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null)
  const [permissionLoading, setPermissionLoading] = useState(true)
  const [isAdminAuth, setIsAdminAuth] = useState(false)

  // EMERGENCY ADMIN BYPASS - Check localStorage immediately
  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null
  const isEmergencyAdmin = storedUser && JSON.parse(storedUser)?.email === 'adimahna@gmail.com'
  
  console.log('🚨 EMERGENCY ADMIN CHECK (PRUSA):', { isEmergencyAdmin, storedUser: storedUser ? 'exists' : 'none' })

  useEffect(() => {
    console.log('🔍 First useEffect - Auth check (PRUSA):', { user: user?.email, loading, isAdminAuth, isEmergencyAdmin })
    
    // Skip all auth checks if emergency admin
    if (isEmergencyAdmin) {
      console.log('🚨 SKIPPING AUTH CHECK - Emergency admin detected (PRUSA)')
      return
    }
    
    // Check if admin is authenticated via localStorage first
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        if (userData.email === 'adimahna@gmail.com') {
          setIsAdminAuth(true)
          return // Don't do Firebase checks for admin
        }
      } catch (e) {
        console.error('Error parsing stored user:', e)
      }
    }

    // Regular Firebase auth check only if not admin
    if (!loading && !user && !isAdminAuth) {
      router.push('/signin')
    }
  }, [user, loading, router, isAdminAuth, isEmergencyAdmin])

  useEffect(() => {
    console.log('🔍 Second useEffect - Permission check trigger (PRUSA):', { 
      hasUser: !!user, 
      loading, 
      isAdminAuth, 
      userEmail: user?.email,
      isEmergencyAdmin 
    })
    
    // Skip all permission checks if emergency admin
    if (isEmergencyAdmin) {
      console.log('🚨 SKIPPING PERMISSION CHECK - Emergency admin detected (PRUSA)')
      return
    }
    
    if ((user && !loading) || isAdminAuth) {
      checkUserPermissions()
    }
  }, [user, loading, isAdminAuth, isEmergencyAdmin])

  const checkUserPermissions = async () => {
    try {
      let email, password
      
      // Use localStorage data for admin, Firebase data for others
      if (isAdminAuth) {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          email = userData.email
          password = userData.password
        }
        
        // For admin users, set permissions directly without API call
        if (email === 'adimahna@gmail.com') {
          console.log('Setting admin permissions directly for prusa-campaigns')
          setUserPermissions({
            isAdmin: true,
            allowedCampaigns: ['roger', 'reachify', 'prusa', 'unified']
          })
          setPermissionLoading(false)
          return
        }
      } else {
        email = user?.email
        // Remove password from Firebase user as it doesn't exist
        password = 'firebase-auth' // Placeholder for Firebase users
      }

      if (!email || !password) {
        router.push('/signin')
        return
      }

      const response = await fetch('/api/user-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const data = await response.json()
        setUserPermissions({
          isAdmin: data.isAdmin,
          allowedCampaigns: data.allowedCampaigns || []
        })

        // Check if user has access to prusa campaigns
        if (!data.isAdmin && !data.allowedCampaigns?.includes('prusa')) {
          // Redirect to a campaign they do have access to, or show error
          if (data.allowedCampaigns?.length > 0) {
            const firstAllowedCampaign = data.allowedCampaigns[0]
            router.push(`/${firstAllowedCampaign}-campaigns`)
          } else {
            router.push('/signin') // No access to any campaigns
          }
        }
      } else {
        router.push('/signin')
      }
    } catch (error) {
      console.error('Error checking permissions:', error)
      router.push('/signin')
    } finally {
      setPermissionLoading(false)
    }
  }

  // EMERGENCY ADMIN BYPASS - Render immediately for admin
  if (isEmergencyAdmin) {
    console.log('🚨 EMERGENCY ADMIN RENDER BYPASS (PRUSA)')
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <Sidebar />
        <div className="flex-1">
          <DashboardHeader />
          <main className="p-8">
            <UnifiedCampaignsDashboard defaultCategory="prusa" title="PRUSA Campaigns Dashboard" />
          </main>
        </div>
      </div>
    )
  }

  if ((loading && !isAdminAuth) || permissionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading PRUSA campaigns...</p>
        </div>
      </div>
    )
  }

  if ((!user && !isAdminAuth) || !userPermissions) {
    return null
  }

  // If user is not admin, show simplified layout without sidebar
  const isAdmin = userPermissions.isAdmin

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        {/* Simple header for regular users */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <div>
                <div className="font-semibold text-xl text-slate-800 tracking-tight">
                  PRUSA Campaigns
                </div>
                <div className="text-xs text-slate-500">
                  Welcome, {isAdminAuth ? 'Admin User' : (user?.displayName || user?.email)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-xl hover:bg-red-100 text-slate-600 hover:text-red-600"
                onClick={() => {
                  localStorage.removeItem('user')
                  router.push('/signin')
                }}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="p-8">
          <UnifiedCampaignsDashboard defaultCategory="prusa" title="PRUSA Campaigns Dashboard" />
        </main>
      </div>
    )
  }

  // Admin layout with sidebar
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Sidebar />

      <div className="flex-1">
        <DashboardHeader />

        <main className="p-8">
          <UnifiedCampaignsDashboard defaultCategory="prusa" title="PRUSA Campaigns Dashboard" />
        </main>
      </div>
    </div>
  )
}