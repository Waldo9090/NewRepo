'use client'

import { TrendingUp, ThumbsUp, Mail, MousePointer, Loader2, Users, Eye, MessageCircle, ChevronRight, ChevronDown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useInstantlyOverview } from "@/hooks/use-instantly-analytics"
import { calculateReplyRate, calculatePositiveReplyRate, calculateOpenRate, calculateClickRate } from "@/lib/instantly-api"
import { useState, useEffect } from "react"

interface MetricCardsProps {
  campaignId?: string | null
  workspaceId?: string | null
  dateRange?: string
}

export function MetricCards({ campaignId, workspaceId, dateRange }: MetricCardsProps) {
  const { data: overview, loading, error } = useInstantlyOverview(campaignId, workspaceId)
  const [campaignsData, setCampaignsData] = useState<any[]>([])
  const [campaignsLoading, setCampaignsLoading] = useState(false)
  
  // State for toggling visibility of each metric card
  const [showMetrics, setShowMetrics] = useState({
    emailsOpened: true,
    totalLeads: true,
    openRate: true,
    replyRate: true
  })
  
  // State for toggling visibility of the checkbox bar
  const [showCheckboxBar, setShowCheckboxBar] = useState(false)

  const toggleMetric = (metricKey: keyof typeof showMetrics) => {
    setShowMetrics(prev => ({
      ...prev,
      [metricKey]: !prev[metricKey]
    }))
  }

  // Fetch campaigns data to get leads count when needed
  useEffect(() => {
    if (!overview || overview.leads_count !== undefined) {
      return // No need to fetch if we already have leads count or no overview data
    }

    const fetchCampaignsData = async () => {
      setCampaignsLoading(true)
      try {
        const params = new URLSearchParams()
        if (workspaceId) params.append('workspace_id', workspaceId)
        if (campaignId) params.append('id', campaignId)
        
        const response = await fetch(`/api/instantly/campaigns-analytics?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setCampaignsData(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Failed to fetch campaigns data:', error)
      } finally {
        setCampaignsLoading(false)
      }
    }

    fetchCampaignsData()
  }, [overview, workspaceId, campaignId])

  if (loading) {
    return (
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 bg-white/60 backdrop-blur-sm border-slate-200 shadow-sm">
              <div className="flex items-center justify-center h-20">
                <Loader2 className="w-6 h-6 animate-spin text-slate-500 dark:text-slate-400" />
              </div>
            </Card>
          ))}
        </div>
        
        {/* Toggle Button for Checkbox Bar - Disabled during loading */}
        <div className="flex justify-center mb-2">
          <button
            disabled
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 cursor-not-allowed rounded-lg opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
            <span>Metrics Controls</span>
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="p-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-sm col-span-full">
            <div className="text-center text-slate-600 dark:text-slate-300">
              <p className="text-sm font-medium">Unable to load analytics data</p>
              <p className="text-xs mt-2 text-slate-500 dark:text-slate-400">{error}</p>
              <p className="text-xs mt-3 text-indigo-600 font-medium">
                Check browser console for detailed error information
              </p>
            </div>
          </Card>
        </div>
        
        {/* Toggle Button for Checkbox Bar - Disabled during error */}
        <div className="flex justify-center mb-2">
          <button
            disabled
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 cursor-not-allowed rounded-lg opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
            <span>Metrics Controls</span>
          </button>
        </div>
      </div>
    )
  }

  if (!overview) {
    return (
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="p-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-sm col-span-full">
            <div className="text-center text-slate-600 dark:text-slate-300">
              <p className="text-sm font-medium">No analytics data available</p>
              <p className="text-xs mt-2 text-slate-500 dark:text-slate-400">Make sure you have active campaigns</p>
            </div>
          </Card>
        </div>
        
        {/* Toggle Button for Checkbox Bar - Disabled when no data */}
        <div className="flex justify-center mb-2">
          <button
            disabled
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 cursor-not-allowed rounded-lg opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
            <span>Metrics Controls</span>
          </button>
        </div>
      </div>
    )
  }

  // Calculate total leads from campaigns data if overview doesn't have it
  const totalLeads = overview.leads_count || campaignsData.reduce((sum, campaign) => sum + (campaign.leads_count || 0), 0)
  
  // Use the correct field names from the API
  const replyRate = calculateReplyRate(overview.reply_count_unique, overview.emails_sent_count)
  const positiveReplyRate = calculatePositiveReplyRate(overview.total_interested, overview.reply_count_unique)
  const openRate = calculateOpenRate(overview.open_count_unique, overview.emails_sent_count)
  const clickRate = calculateClickRate(overview.link_click_count_unique, overview.emails_sent_count)

  return (
    <div className="mb-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Emails Opened Card */}
        {showMetrics.emailsOpened && (
          <Card className="p-6 bg-green-50/30 dark:bg-green-900/20 border-green-100 dark:border-green-800 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Emails Opened</h3>
          <Mail className="w-4 h-4 text-green-500" />
        </div>
        <div className="space-y-1">
          <div className="text-4xl font-semibold">{overview.open_count_unique.toLocaleString()}</div>
          <p className="text-sm text-muted-foreground">
            out of {overview.emails_sent_count.toLocaleString()} emails sent
          </p>
        </div>
          </Card>
        )}

        {/* Total Leads in List Card */}
        {showMetrics.totalLeads && (
          <Card className="p-6 bg-blue-50/30 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total Leads</h3>
          <Users className="w-4 h-4 text-blue-500" />
        </div>
        <div className="space-y-1">
          <div className="text-4xl font-semibold">
            {(campaignsLoading && !totalLeads) ? '...' : totalLeads?.toLocaleString() || 'N/A'}
          </div>
          <p className="text-sm text-muted-foreground">
            leads in list
          </p>
        </div>
          </Card>
        )}

        {/* Open Rate Card */}
        {showMetrics.openRate && (
          <Card className="p-6 bg-indigo-50/30 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Open Rate</h3>
          <Eye className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="space-y-1">
          <div className="text-4xl font-semibold">
            {openRate.toFixed(1)}%
          </div>
          <p className="text-sm text-muted-foreground">
            email open rate
          </p>
        </div>
          </Card>
        )}

        {/* Reply Rate Card */}
        {showMetrics.replyRate && (
          <Card className="p-6 bg-purple-50/30 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Reply Rate</h3>
          <MessageCircle className="w-4 h-4 text-purple-500" />
        </div>
        <div className="space-y-1">
          <div className="text-4xl font-semibold">
            {replyRate.toFixed(1)}%
          </div>
          <p className="text-sm text-muted-foreground">
            reply rate
          </p>
        </div>
          </Card>
        )}
      </div>
      
      {/* Toggle Button for Checkbox Bar */}
      <div className="flex justify-center mb-2">
        <button
          onClick={() => setShowCheckboxBar(!showCheckboxBar)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {showCheckboxBar ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <span>Metrics Controls</span>
        </button>
      </div>
      
      {/* Metric Toggle Checkboxes - Collapsible */}
      {showCheckboxBar && (
        <div className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showMetrics.emailsOpened}
                onChange={() => toggleMetric('emailsOpened')}
                className="rounded border-slate-300 text-green-600 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              <span className="text-sm text-slate-600 dark:text-slate-300">1</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showMetrics.totalLeads}
                onChange={() => toggleMetric('totalLeads')}
                className="rounded border-slate-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-600 dark:text-slate-300">2</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showMetrics.openRate}
                onChange={() => toggleMetric('openRate')}
                className="rounded border-slate-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-600 dark:text-slate-300">3</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showMetrics.replyRate}
                onChange={() => toggleMetric('replyRate')}
                className="rounded border-slate-300 text-purple-600 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
              <span className="text-sm text-slate-600 dark:text-slate-300">4</span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}