"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { InterestedLeadsThreads } from "@/components/interested-leads-threads"
import { FromAddressList } from "@/components/from-address-list"
import { EmailFrameworks } from "@/components/email-frameworks"
import { UserManagement } from "@/components/user-management"
import { 
  Loader2, 
  BarChart3, 
  Inbox, 
  FileText, 
  Mail, 
  Users, 
  TrendingUp, 
  Calendar, 
  ChevronDown,
  Settings,
  Check,
  UserCog
} from "lucide-react"

interface Campaign {
  id: string
  name: string
  campaignId: string
  workspaceId: string
  workspaceName: string
  category: 'roger' | 'reachify' | 'prusa'
  analytics?: any
  selected: boolean
}

interface CampaignAnalytics {
  campaign_name: string
  campaign_id: string
  campaign_status: number
  leads_count: number
  contacted_count: number
  emails_sent_count: number
  open_count: number
  reply_count: number
  link_click_count: number
  bounced_count: number
  unsubscribed_count: number
  completed_count: number
  total_opportunities: number
  total_opportunity_value: number
}

interface UnifiedCampaignsDashboardProps {
  defaultCategory?: 'roger' | 'reachify' | 'prusa' | 'all'
  title?: string
}

export function UnifiedCampaignsDashboard({ 
  defaultCategory = 'all', 
  title = "Unified Campaigns Dashboard" 
}: UnifiedCampaignsDashboardProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('analytics')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totals, setTotals] = useState<CampaignAnalytics | null>(null)
  const [showCampaignSelector, setShowCampaignSelector] = useState(false)

  // Check if current user is admin
  const isAdmin = user?.email === 'adimahna@gmail.com'

  // Get selected campaigns and determine display category
  const selectedCampaigns = campaigns.filter(c => c.selected)
  const selectedCategories = [...new Set(selectedCampaigns.map(c => c.category))]
  const displayCategory = selectedCategories.length === 1 ? selectedCategories[0] : 'all'

  useEffect(() => {
    async function fetchAllCampaigns() {
      setLoading(true)
      setError(null)
      
      try {
        const categories = ['roger', 'reachify', 'prusa']
        const allCampaignsData: Campaign[] = []
        let aggregatedTotals: CampaignAnalytics = {
          campaign_name: 'All Campaigns',
          campaign_id: 'unified',
          campaign_status: 1,
          leads_count: 0,
          contacted_count: 0,
          emails_sent_count: 0,
          open_count: 0,
          reply_count: 0,
          link_click_count: 0,
          bounced_count: 0,
          unsubscribed_count: 0,
          completed_count: 0,
          total_opportunities: 0,
          total_opportunity_value: 0
        }

        // Fetch campaigns from each category
        for (const category of categories) {
          try {
            const response = await fetch(`/api/instantly/unified-analytics?category=${category}`)
            
            if (response.ok) {
              const categoryData = await response.json()
              
              // Add campaigns with category info
              const categoryCampaigns = categoryData.campaigns?.map((campaign: any) => ({
                id: `${category}-${campaign.id || campaign.campaign_id}`,
                name: campaign.name || campaign.campaign_name,
                campaignId: campaign.id || campaign.campaign_id,
                workspaceId: campaign.workspaceId || '1',
                workspaceName: campaign.workspaceName || 'Default Workspace',
                category: category as 'roger' | 'reachify' | 'prusa',
                analytics: campaign.analytics || campaign,
                selected: defaultCategory === 'all' || defaultCategory === category
              })) || []
              
              allCampaignsData.push(...categoryCampaigns)
              
              // Aggregate totals
              if (categoryData.totals) {
                const totals = categoryData.totals
                aggregatedTotals.leads_count += totals.leads_count || 0
                aggregatedTotals.contacted_count += totals.contacted_count || 0
                aggregatedTotals.emails_sent_count += totals.emails_sent_count || 0
                aggregatedTotals.open_count += totals.open_count || 0
                aggregatedTotals.reply_count += totals.reply_count || 0
                aggregatedTotals.link_click_count += totals.link_click_count || 0
                aggregatedTotals.bounced_count += totals.bounced_count || 0
                aggregatedTotals.unsubscribed_count += totals.unsubscribed_count || 0
                aggregatedTotals.completed_count += totals.completed_count || 0
                aggregatedTotals.total_opportunities += totals.total_opportunities || 0
                aggregatedTotals.total_opportunity_value += totals.total_opportunity_value || 0
              }
            }
          } catch (err) {
            console.warn(`Failed to fetch ${category} campaigns:`, err)
          }
        }

        setCampaigns(allCampaignsData)
        setTotals(aggregatedTotals)
      } catch (err) {
        console.error('Error fetching campaigns:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch campaigns')
      } finally {
        setLoading(false)
      }
    }

    fetchAllCampaigns()
  }, [defaultCategory])

  const toggleCampaignSelection = (campaignId: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, selected: !campaign.selected }
        : campaign
    ))
  }

  const selectAllCampaigns = () => {
    setCampaigns(prev => prev.map(campaign => ({ ...campaign, selected: true })))
  }

  const deselectAllCampaigns = () => {
    setCampaigns(prev => prev.map(campaign => ({ ...campaign, selected: false })))
  }

  const selectCategoryOnly = (category: 'roger' | 'reachify' | 'prusa') => {
    setCampaigns(prev => prev.map(campaign => ({ 
      ...campaign, 
      selected: campaign.category === category 
    })))
  }

  // Calculate metrics from selected campaigns
  const selectedTotals = selectedCampaigns.reduce((acc, campaign) => {
    const analytics = campaign.analytics
    if (analytics) {
      acc.leads_count += analytics.leads_count || 0
      acc.emails_sent_count += analytics.emails_sent_count || 0
      acc.reply_count += analytics.reply_count || 0
      acc.open_count += analytics.open_count || 0
      acc.total_opportunities += analytics.total_opportunities || 0
      acc.total_opportunity_value += analytics.total_opportunity_value || 0
    }
    return acc
  }, {
    leads_count: 0,
    emails_sent_count: 0,
    reply_count: 0,
    open_count: 0,
    total_opportunities: 0,
    total_opportunity_value: 0
  })

  const replyRate = selectedTotals.emails_sent_count > 0 
    ? ((selectedTotals.reply_count / selectedTotals.emails_sent_count) * 100) 
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading unified campaigns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header with Campaign Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
          <p className="text-slate-600">
            {selectedCampaigns.length} of {campaigns.length} campaigns selected
          </p>
        </div>
        
        {isAdmin && (
          <Button
            onClick={() => setShowCampaignSelector(!showCampaignSelector)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Select Campaigns
            <ChevronDown className={`w-4 h-4 transition-transform ${showCampaignSelector ? 'rotate-180' : ''}`} />
          </Button>
        )}
      </div>

      {/* Campaign Selection Panel */}
      {isAdmin && showCampaignSelector && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Campaign Selection</h3>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={selectAllCampaigns}>
                Select All
              </Button>
              <Button size="sm" variant="outline" onClick={deselectAllCampaigns}>
                Deselect All
              </Button>
              <Button size="sm" variant="outline" onClick={() => selectCategoryOnly('roger')}>
                Roger Only
              </Button>
              <Button size="sm" variant="outline" onClick={() => selectCategoryOnly('reachify')}>
                Reachify Only
              </Button>
              <Button size="sm" variant="outline" onClick={() => selectCategoryOnly('prusa')}>
                PRUSA Only
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="flex items-center space-x-3 p-3 border rounded">
                <Checkbox
                  checked={campaign.selected}
                  onCheckedChange={() => toggleCampaignSelection(campaign.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{campaign.name}</div>
                  <div className="text-xs text-gray-500 capitalize">
                    {campaign.category} • {campaign.workspaceName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-8 mb-8 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
            activeTab === 'analytics'
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
            activeTab === 'inbox'
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <Inbox className="w-4 h-4" />
          Inbox
        </button>
        <button
          onClick={() => setActiveTab('emails')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
            activeTab === 'emails'
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <FileText className="w-4 h-4" />
          Email Frameworks
        </button>
        <button
          onClick={() => setActiveTab('mailboxes')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
            activeTab === 'mailboxes'
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <Mail className="w-4 h-4" />
          Mailboxes
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
              activeTab === 'settings'
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            <UserCog className="w-4 h-4" />
            Settings
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Performance Overview */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Performance Overview</h2>
            
            {/* Metrics Cards */}
            <div className="grid grid-cols-5 gap-6 mb-8">
              {/* Sourced */}
              <Card className="p-6 bg-white border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-medium text-slate-600">Sourced</span>
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-2">
                  {selectedTotals.leads_count.toLocaleString()}
                </div>
                <div className="text-sm text-slate-500">
                  From {selectedCampaigns.length} campaigns
                </div>
              </Card>

              {/* Emails Sent */}
              <Card className="p-6 bg-white border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-medium text-slate-600">Emails Sent</span>
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-2">
                  {selectedTotals.emails_sent_count.toLocaleString()}
                </div>
              </Card>

              {/* Replies */}
              <Card className="p-6 bg-white border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-medium text-slate-600">Replies</span>
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-2">
                  {selectedTotals.reply_count.toLocaleString()}
                </div>
                <div className="text-sm text-slate-500">
                  ({replyRate.toFixed(1)}%)
                </div>
              </Card>

              {/* Opens */}
              <Card className="p-6 bg-white border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-medium text-slate-600">Opens</span>
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-2">
                  {selectedTotals.open_count.toLocaleString()}
                </div>
              </Card>

              {/* Opportunities */}
              <Card className="p-6 bg-white border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-medium text-slate-600">Opportunities</span>
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-2">
                  {selectedTotals.total_opportunities.toLocaleString()}
                </div>
                <div className="text-sm text-slate-500">
                  ${selectedTotals.total_opportunity_value.toLocaleString()}
                </div>
              </Card>
            </div>

            {/* Selected Campaigns Table */}
            <Card className="p-6 mt-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Selected Campaigns ({selectedCampaigns.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-2 font-medium text-slate-600 text-sm">Campaign</th>
                      <th className="text-left py-3 px-2 font-medium text-slate-600 text-sm">Category</th>
                      <th className="text-left py-3 px-2 font-medium text-slate-600 text-sm">Sourced</th>
                      <th className="text-left py-3 px-2 font-medium text-slate-600 text-sm">Emails Sent</th>
                      <th className="text-left py-3 px-2 font-medium text-slate-600 text-sm">Replies</th>
                      <th className="text-left py-3 px-2 font-medium text-slate-600 text-sm">Opens</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedCampaigns.map((campaign) => {
                      const analytics = campaign.analytics
                      const campaignReplyRate = analytics?.emails_sent_count > 0 
                        ? ((analytics.reply_count / analytics.emails_sent_count) * 100) 
                        : 0
                      
                      return (
                        <tr key={campaign.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-2">
                            <div className="font-medium text-slate-800 text-sm">{campaign.name}</div>
                          </td>
                          <td className="py-4 px-2">
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                              campaign.category === 'roger' ? 'bg-blue-100 text-blue-800' :
                              campaign.category === 'reachify' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {campaign.category}
                            </span>
                          </td>
                          <td className="py-4 px-2">
                            <div className="text-sm font-medium text-slate-800">
                              {analytics?.leads_count?.toLocaleString() || 0}
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="text-sm font-medium text-slate-800">
                              {analytics?.emails_sent_count?.toLocaleString() || 0}
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="text-sm font-medium text-slate-800">
                              {analytics?.reply_count?.toLocaleString() || 0}
                            </div>
                            <div className="text-xs text-slate-500">({campaignReplyRate.toFixed(1)}%)</div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="text-sm font-medium text-slate-800">
                              {analytics?.open_count?.toLocaleString() || 0}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'inbox' && (
        <InterestedLeadsThreads category={displayCategory as 'roger' | 'reachify' | 'prusa' | 'all'} />
      )}

      {activeTab === 'emails' && (
        <EmailFrameworks category={displayCategory as 'roger' | 'reachify' | 'prusa' | 'all'} />
      )}

      {activeTab === 'mailboxes' && (
        <FromAddressList category={displayCategory} />
      )}

      {activeTab === 'settings' && isAdmin && (
        <UserManagement />
      )}
    </div>
  )
}