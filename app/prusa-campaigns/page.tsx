'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { RogerCampaignsMetrics } from "@/components/roger-campaigns-metrics"
import { ClientPerformanceChart } from "@/components/client-performance-chart"
import { ClientCampaignBreakdown } from "@/components/client-campaign-breakdown"
import { CampaignMessages } from "@/components/campaign-messages"
import { PrusaCampaignList } from "@/components/prusa-campaign-list"
import { DateRangeFilter, type DateRange } from "@/components/date-range-filter"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, BarChart3, LogOut, Mail, ExternalLink } from "lucide-react"

interface CampaignData {
  campaign_name: string
  campaign_id: string
  campaign_status: number
  campaign_is_evergreen: boolean
  leads_count: number
  contacted_count: number
  open_count: number
  reply_count: number
  link_click_count: number
  bounced_count: number
  unsubscribed_count: number
  completed_count: number
  emails_sent_count: number
  new_leads_contacted_count: number
  total_opportunities: number
  total_opportunity_value: number
}

function getDateRangeStart(range: DateRange): string {
  const today = new Date()
  const days = parseInt(range.toString())
  const startDate = new Date(today.getTime() - (days * 24 * 60 * 60 * 1000))
  return startDate.toISOString().split('T')[0]
}

function getDateRangeEnd(): string {
  return new Date().toISOString().split('T')[0]
}

function getCampaignStatusLabel(status: number): string {
  switch (status) {
    case 0: return 'Draft'
    case 1: return 'Active'
    case 2: return 'Paused'
    case 3: return 'Completed'
    case 4: return 'Running Subsequences'
    case -99: return 'Account Suspended'
    case -1: return 'Accounts Unhealthy'
    case -2: return 'Bounce Protect'
    default: return 'Unknown'
  }
}

export default function PrusaCampaignsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignData | null>(null)
  const [selectedTab, setSelectedTab] = useState("overview")
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>('30')
  const [prusaUser, setPrusaUser] = useState<any>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const workspaceId = '2' // PRUSA campaigns are in workspace 2

  useEffect(() => {
    // Check for PRUSA user session in localStorage
    const prusaUserData = localStorage.getItem('prusaUser')
    if (prusaUserData) {
      try {
        const userData = JSON.parse(prusaUserData)
        setPrusaUser(userData)
        setIsCheckingAuth(false)
        return
      } catch (e) {
        localStorage.removeItem('prusaUser')
      }
    }

    // If no PRUSA user, check regular auth
    if (!loading && !user) {
      router.push('/signin')
    } else {
      setIsCheckingAuth(false)
    }
  }, [user, loading, router])

  if (loading || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading PRUSA campaigns...</p>
        </div>
      </div>
    )
  }

  if (!user && !prusaUser) {
    return null
  }

  // Check if this is a PRUSA user for special layout (no sidebar)
  const isPrusaUser = prusaUser || (user && (user.email === 'misha@prusa.com' || user.email === 'VPrice@prusa.com' || user.email === 'mike@delectablecap.com'))

  // Special layout for PRUSA users (no sidebar)
  if (isPrusaUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        {/* Custom header for PRUSA users */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <div>
                <div className="font-semibold text-xl text-slate-800 tracking-tight">Candytrail</div>
                <div className="text-xs text-slate-500 mt-1 font-medium tracking-wide">PRUSA CAMPAIGNS</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span>Welcome, {prusaUser ? prusaUser.displayName : (user.displayName || user.email)}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-xl hover:bg-red-100 text-slate-600 hover:text-red-600"
                onClick={async () => {
                  if (prusaUser) {
                    // Clear PRUSA user session
                    localStorage.removeItem('prusaUser')
                  } else {
                    try {
                      const { logout } = await import('@/contexts/AuthContext')
                      // Handle logout here if needed
                    } catch (error) {
                      // Ignore error, just redirect
                    }
                  }
                  router.push('/signin')
                }}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="p-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="mb-3">
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">PRUSA Campaigns</h1>
              <p className="text-sm text-slate-600 font-medium">
                Manage and view analytics for all PRUSA campaign variations
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Campaign Selection */}
            <div className="lg:col-span-1">
              <PrusaCampaignList
                workspaceId={workspaceId}
                selectedCampaign={selectedCampaign}
                onSelectCampaign={setSelectedCampaign}
              />
            </div>

            {/* Right Panel - Campaign Analytics */}
            <div className="lg:col-span-2">
              {selectedCampaign ? (
                <div className="space-y-6">
                  {/* Selected Campaign Header */}
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-slate-800">{selectedCampaign.campaign_name}</h2>
                        <p className="text-sm text-slate-600">Paramount Realty USA</p>
                      </div>
                    </div>
                    
                    {/* Date Range Filter */}
                    <DateRangeFilter 
                      selectedRange={selectedDateRange}
                      onRangeChange={setSelectedDateRange}
                    />
                  </Card>

                  {/* Metrics */}
                  <RogerCampaignsMetrics 
                    campaignId={selectedCampaign.campaign_id}
                    workspaceId={workspaceId}
                    startDate={getDateRangeStart(selectedDateRange)}
                    endDate={getDateRangeEnd()}
                  />

                  {/* Tabs */}
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                    <div className="flex gap-2 p-4 border-b border-slate-200">
                      <button
                        onClick={() => setSelectedTab("overview")}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          selectedTab === "overview"
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        Overview
                      </button>
                      <button
                        onClick={() => setSelectedTab("breakdown")}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          selectedTab === "breakdown"
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        Campaign Breakdown
                      </button>
                      <button
                        onClick={() => setSelectedTab("messages")}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          selectedTab === "messages"
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <Mail className="w-4 h-4" />
                        Campaign Messages
                      </button>
                    </div>

                    <div className="p-6">
                      {selectedTab === "overview" && (
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-slate-800 mb-2">Campaign Overview</h3>
                          <p className="text-slate-600 text-sm mb-4">{selectedCampaign.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-left">
                              <span className="font-medium text-slate-700">Workspace:</span>
                              <p className="text-slate-600">{selectedCampaign.workspaceName}</p>
                            </div>
                            <div className="text-left">
                              <span className="font-medium text-slate-700">Client URL:</span>
                              <a 
                                href={selectedCampaign.clientUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
                              >
                                View Client Dashboard <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      )}


                      {selectedTab === "breakdown" && (
                        <ClientCampaignBreakdown 
                          campaignId={selectedCampaign.campaign_id}
                          workspaceId={workspaceId}
                          dateRange={selectedDateRange}
                        />
                      )}

                      {selectedTab === "messages" && (
                        <CampaignMessages 
                          campaignId={selectedCampaign.campaign_id}
                          workspaceId={workspaceId}
                        />
                      )}
                    </div>
                  </Card>
                </div>
              ) : (
                <Card className="p-12 bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm text-center">
                  <div className="text-slate-500">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-medium mb-2">Select a PRUSA Campaign</h3>
                    <p className="text-sm">
                      Choose a campaign from the left panel to view its analytics and performance data.
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
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
          {/* Page Header */}
          <div className="mb-8">
            <div className="mb-3">
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">PRUSA Campaigns</h1>
              <p className="text-sm text-slate-600 font-medium">
                Manage and view analytics for all PRUSA campaign variations
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Campaign Selection */}
            <div className="lg:col-span-1">
              <PrusaCampaignList
                workspaceId={workspaceId}
                selectedCampaign={selectedCampaign}
                onSelectCampaign={setSelectedCampaign}
              />
            </div>

            {/* Right Panel - Campaign Analytics */}
            <div className="lg:col-span-2">
              {selectedCampaign ? (
                <div className="space-y-6">
                  {/* Selected Campaign Header */}
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-slate-800">{selectedCampaign.campaign_name}</h2>
                        <p className="text-sm text-slate-600">Paramount Realty USA</p>
                      </div>
                    </div>
                    
                    {/* Date Range Filter */}
                    <DateRangeFilter 
                      selectedRange={selectedDateRange}
                      onRangeChange={setSelectedDateRange}
                    />
                  </Card>

                  {/* Metrics */}
                  <RogerCampaignsMetrics 
                    campaignId={selectedCampaign.campaign_id}
                    workspaceId={workspaceId}
                    startDate={getDateRangeStart(selectedDateRange)}
                    endDate={getDateRangeEnd()}
                  />

                  {/* Tabs */}
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                    <div className="flex gap-2 p-4 border-b border-slate-200">
                      <button
                        onClick={() => setSelectedTab("overview")}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          selectedTab === "overview"
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        Overview
                      </button>
                      <button
                        onClick={() => setSelectedTab("breakdown")}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          selectedTab === "breakdown"
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        Campaign Breakdown
                      </button>
                      <button
                        onClick={() => setSelectedTab("messages")}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          selectedTab === "messages"
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <Mail className="w-4 h-4" />
                        Campaign Messages
                      </button>
                    </div>

                    <div className="p-6">
                      {selectedTab === "overview" && (
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-slate-800 mb-2">Campaign Overview</h3>
                          <p className="text-slate-600 text-sm mb-4">{selectedCampaign.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-left">
                              <span className="font-medium text-slate-700">Workspace:</span>
                              <p className="text-slate-600">{selectedCampaign.workspaceName}</p>
                            </div>
                            <div className="text-left">
                              <span className="font-medium text-slate-700">Client URL:</span>
                              <a 
                                href={selectedCampaign.clientUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
                              >
                                View Client Dashboard <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      )}


                      {selectedTab === "breakdown" && (
                        <ClientCampaignBreakdown 
                          campaignId={selectedCampaign.campaign_id}
                          workspaceId={workspaceId}
                          dateRange={selectedDateRange}
                        />
                      )}

                      {selectedTab === "messages" && (
                        <CampaignMessages 
                          campaignId={selectedCampaign.campaign_id}
                          workspaceId={workspaceId}
                        />
                      )}
                    </div>
                  </Card>
                </div>
              ) : (
                <Card className="p-12 bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm text-center">
                  <div className="text-slate-500">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-medium mb-2">Select a PRUSA Campaign</h3>
                    <p className="text-sm">
                      Choose a campaign from the left panel to view its analytics and performance data.
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}