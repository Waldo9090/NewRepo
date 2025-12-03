import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

interface Campaign {
  id: string
  name: string
  campaignId: string
  workspaceId: string
  workspaceName: string
  category: 'roger' | 'reachify' | 'prusa'
  analytics?: any
}

interface CreateDashboardRequest {
  name: string
  selectedCampaigns: string[]
  campaigns: Campaign[]
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateDashboardRequest = await request.json()
    const { name, selectedCampaigns, campaigns } = body

    if (!name || !selectedCampaigns || selectedCampaigns.length === 0) {
      return NextResponse.json(
        { error: 'Name and selected campaigns are required' },
        { status: 400 }
      )
    }

    // Create a URL-safe slug from the dashboard name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '') // Remove spaces
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()

    if (!slug) {
      return NextResponse.json(
        { error: 'Invalid dashboard name' },
        { status: 400 }
      )
    }

    const dashboardPath = join(process.cwd(), 'app', `${slug}-campaigns`)
    
    // Check if directory already exists
    if (existsSync(dashboardPath)) {
      return NextResponse.json(
        { error: 'Dashboard with this name already exists' },
        { status: 409 }
      )
    }

    // Create the directory
    await mkdir(dashboardPath, { recursive: true })

    // Get the selected campaign details
    const selectedCampaignDetails = campaigns.filter(campaign => 
      selectedCampaigns.includes(campaign.id)
    )

    // Determine the primary category (most common category in selected campaigns)
    const categoryCounts = selectedCampaignDetails.reduce((acc, campaign) => {
      acc[campaign.category] = (acc[campaign.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const primaryCategory = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)[0][0] || 'all'

    // Generate the page.tsx content
    const pageContent = `'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { UnifiedCampaignsDashboard } from "@/components/unified-campaigns-dashboard"
import { Loader2, LogOut } from "lucide-react"

export default function ${slug.charAt(0).toUpperCase() + slug.slice(1)}CampaignsPage() {
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
          <UnifiedCampaignsDashboard defaultCategory="${primaryCategory}" title="${name} Dashboard" />
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
          <UnifiedCampaignsDashboard defaultCategory="${primaryCategory}" title="${name} Dashboard" />
        </main>
      </div>
    </div>
  )
}
`

    // Write the page.tsx file
    const pagePath = join(dashboardPath, 'page.tsx')
    await writeFile(pagePath, pageContent, 'utf-8')

    // Store dashboard metadata (you might want to use a database in production)
    const metadataPath = join(dashboardPath, 'metadata.json')
    const metadata = {
      name,
      slug,
      selectedCampaigns,
      campaigns: selectedCampaignDetails,
      primaryCategory,
      createdAt: new Date().toISOString(),
      isActive: true
    }
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8')

    return NextResponse.json({
      success: true,
      slug,
      name,
      url: `/${slug}-campaigns`,
      selectedCampaigns: selectedCampaigns.length,
      primaryCategory
    })

  } catch (error) {
    console.error('Error creating dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to create dashboard' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Create Dashboard API endpoint' })
}