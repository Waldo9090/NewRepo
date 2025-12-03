'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { UnifiedCampaignsDashboard } from "@/components/unified-campaigns-dashboard"
import { 
  Loader2, 
  LogOut, 
  Settings,
  Plus,
  Eye,
  Save
} from "lucide-react"

interface Campaign {
  id: string
  name: string
  campaignId: string
  workspaceId: string
  workspaceName: string
  category: 'roger' | 'reachify' | 'prusa'
  analytics?: any
}

export default function CreateDashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [dashboardName, setDashboardName] = useState('')
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])
  const [availableCampaigns, setAvailableCampaigns] = useState<Campaign[]>([])
  const [campaignsLoading, setCampaignsLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin')
    }
  }, [user, loading, router])

  useEffect(() => {
    fetchAllCampaigns()
  }, [])

  const fetchAllCampaigns = async () => {
    setCampaignsLoading(true)
    try {
      const categories = ['roger', 'reachify', 'prusa']
      const allCampaigns: Campaign[] = []

      for (const category of categories) {
        try {
          const response = await fetch(`/api/instantly/unified-analytics?category=${category}`)
          
          if (response.ok) {
            const categoryData = await response.json()
            
            const categoryCampaigns = categoryData.campaigns?.map((campaign: any) => ({
              id: `${category}-${campaign.id || campaign.campaign_id}`,
              name: campaign.name || campaign.campaign_name,
              campaignId: campaign.id || campaign.campaign_id,
              workspaceId: campaign.workspaceId || '1',
              workspaceName: campaign.workspaceName || 'Default Workspace',
              category: category as 'roger' | 'reachify' | 'prusa',
              analytics: campaign.analytics || campaign
            })) || []
            
            allCampaigns.push(...categoryCampaigns)
          }
        } catch (err) {
          console.warn(`Failed to fetch ${category} campaigns:`, err)
        }
      }

      setAvailableCampaigns(allCampaigns)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setCampaignsLoading(false)
    }
  }

  const toggleCampaignSelection = (campaignId: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId)
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    )
  }

  const selectAllInCategory = (category: string) => {
    const categoryCampaigns = availableCampaigns
      .filter(c => c.category === category)
      .map(c => c.id)
    
    setSelectedCampaigns(prev => [...new Set([...prev, ...categoryCampaigns])])
  }

  const createDashboard = async () => {
    if (!dashboardName.trim()) {
      alert('Please enter a dashboard name')
      return
    }

    if (selectedCampaigns.length === 0) {
      alert('Please select at least one campaign')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/create-dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: dashboardName.trim(),
          selectedCampaigns,
          campaigns: availableCampaigns.filter(c => selectedCampaigns.includes(c.id))
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Dashboard "${dashboardName}" created successfully!`)
        
        // Force a page reload to update the sidebar, then redirect
        const dashboardUrl = `/${result.slug}-campaigns`
        window.location.href = dashboardUrl
      } else {
        const error = await response.json()
        alert(`Error creating dashboard: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating dashboard:', error)
      alert('Failed to create dashboard')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard creator...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Check if this is mike@delectablecap.com for special layout
  const isMikeUser = user.email === 'mike@delectablecap.com'

  const renderContent = () => (
    <main className="p-8">
      {!showPreview ? (
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Create Dashboard</h1>
            <p className="text-slate-600 mt-2">Create a custom campaign dashboard with selected campaigns</p>
          </div>

          {/* Dashboard Name */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Dashboard Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dashboard Name *
                </label>
                <Input
                  type="text"
                  value={dashboardName}
                  onChange={(e) => setDashboardName(e.target.value)}
                  placeholder="Enter dashboard name (e.g., 'Q4 Sales', 'Client Overview')"
                  className="w-full max-w-md"
                />
                <p className="text-xs text-slate-500 mt-2">
                  This will create a URL like: /{dashboardName.toLowerCase().replace(/\s+/g, '')}-campaigns
                </p>
              </div>
            </div>
          </Card>

          {/* Campaign Selection */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Select Campaigns</h3>
              <div className="text-sm text-slate-600">
                {selectedCampaigns.length} of {availableCampaigns.length} selected
              </div>
            </div>

            {campaignsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
                <span className="ml-2 text-slate-600">Loading campaigns...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Category Sections */}
                {['roger', 'reachify', 'prusa'].map(category => {
                  const categoryCampaigns = availableCampaigns.filter(c => c.category === category)
                  const categorySelected = categoryCampaigns.filter(c => selectedCampaigns.includes(c.id)).length
                  
                  return (
                    <div key={category} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-slate-800 capitalize">
                          {category} Campaigns ({categoryCampaigns.length})
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">
                            {categorySelected} selected
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => selectAllInCategory(category)}
                          >
                            Select All
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categoryCampaigns.map(campaign => (
                          <div key={campaign.id} className="flex items-start space-x-3 p-3 border rounded hover:bg-slate-50">
                            <Checkbox
                              checked={selectedCampaigns.includes(campaign.id)}
                              onCheckedChange={() => toggleCampaignSelection(campaign.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{campaign.name}</div>
                              <div className="text-xs text-slate-500 capitalize">
                                {campaign.category} • {campaign.workspaceName}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={() => setShowPreview(true)}
              disabled={!dashboardName.trim() || selectedCampaigns.length === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview Dashboard
            </Button>
            
            <Button
              onClick={createDashboard}
              disabled={!dashboardName.trim() || selectedCampaigns.length === 0 || creating}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Dashboard
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Preview Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Dashboard Preview</h1>
              <p className="text-slate-600">Preview of "{dashboardName}" with {selectedCampaigns.length} campaigns</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setShowPreview(false)} variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Edit Settings
              </Button>
              <Button
                onClick={createDashboard}
                disabled={creating}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Dashboard
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Preview Dashboard */}
          <UnifiedCampaignsDashboard 
            title={`${dashboardName} Dashboard`}
            defaultCategory="all"
          />
        </div>
      )}
    </main>
  )

  // Special layout for mike@delectablecap.com (no sidebar)
  if (isMikeUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        {/* Custom header for Mike */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <div>
                <div className="font-semibold text-xl text-slate-800 tracking-tight">Create Dashboard</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span>09:53</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-xl hover:bg-red-100 text-slate-600 hover:text-red-600"
                onClick={() => router.push('/signin')}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>
        {renderContent()}
      </div>
    )
  }

  // Normal layout for other users (with sidebar)
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Sidebar />
      <div className="flex-1">
        <DashboardHeader />
        {renderContent()}
      </div>
    </div>
  )
}