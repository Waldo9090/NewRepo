'use client'

import { Mail, Loader2, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useCampaignAnalytics } from "@/hooks/use-campaign-analytics"
import { isPrusaCampaign } from "@/hooks/use-prusa-mock-data"

interface ClientMetricCardsProps {
  campaignName: string
  campaignId?: string
  workspaceId: string
  startDate?: string
  endDate?: string
}

export function ClientMetricCards({ campaignName, campaignId, workspaceId, startDate, endDate }: ClientMetricCardsProps) {
  const isPrusa = isPrusaCampaign(campaignId || campaignName)
  
  const { data: analytics, loading, error } = useCampaignAnalytics({
    campaignName: isPrusa ? undefined : campaignName,
    workspaceId: isPrusa ? undefined : workspaceId,
    startDate,
    endDate
  })

  // Mock data for PRUSA campaigns
  const getMockAnalytics = () => {
    const mockData = [
      {
        campaign_name: 'PRUSA external company 7.9M+',
        campaign_id: '87dcc1bb-471a-4b5a-9416-3fb2d34a1691',
        leads_count: 1188,
        contacted_count: 1188,
        open_count: 601,
        reply_count: 3,
        emails_sent_count: 1188,
      },
      {
        campaign_name: 'PRUSA Target Company 7.9M+',
        campaign_id: 'f7275204-8c5f-449f-bb02-58e4027ecca8',
        leads_count: 23,
        contacted_count: 23,
        open_count: 14,
        reply_count: 0,
        emails_sent_count: 23,
      },
      {
        campaign_name: 'PRUSA Compass 7.9M+',
        campaign_id: 'de0864ce-252a-4aa2-8cb7-e33e55ad5997',
        leads_count: 125,
        contacted_count: 125,
        open_count: 51,
        reply_count: 0,
        emails_sent_count: 125,
      },
      {
        campaign_name: 'PRUSA Compass Florida: Texas',
        campaign_id: 'f211938a-9ffe-4262-9001-6e36892ba127',
        leads_count: 2999,
        contacted_count: 18,
        open_count: 1,
        reply_count: 0,
        emails_sent_count: 18,
      },
      {
        campaign_name: 'PRUSA New Campaign',
        campaign_id: '51bab480-545d-4241-94e5-26d9e3fe34ad',
        leads_count: 9300,
        contacted_count: 9330,
        open_count: 7739,
        reply_count: 124,
        emails_sent_count: 9330,
      }
    ]
    
    return mockData.find(c => c.campaign_id === (campaignId || campaignName))
  }

  const finalAnalytics = isPrusa ? getMockAnalytics() : analytics

  if (loading && !isPrusa) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="p-6 bg-white/60 backdrop-blur-sm border-slate-200 shadow-sm">
            <div className="flex items-center justify-center h-20">
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (error && !isPrusa) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl">
        <Card className="p-8 bg-white/60 backdrop-blur-sm border-slate-200 shadow-sm col-span-full">
          <div className="text-center text-slate-600">
            <p className="text-sm font-medium">Unable to load analytics data</p>
            <p className="text-xs mt-2 text-slate-500">{error}</p>
            <p className="text-xs mt-3 text-indigo-600 font-medium">
              Please contact support if this issue persists
            </p>
          </div>
        </Card>
      </div>
    )
  }

  if (!finalAnalytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl">
        <Card className="p-8 bg-white/60 backdrop-blur-sm border-slate-200 shadow-sm col-span-full">
          <div className="text-center text-slate-600">
            <p className="text-sm font-medium">No analytics data available</p>
            <p className="text-xs mt-2 text-slate-500">Campaign data may still be processing</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl">
      {/* Emails Opened Card */}
      <Card className="p-6 bg-green-50/30 border-green-100 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Emails Opened</h3>
          <Mail className="w-4 h-4 text-green-500" />
        </div>
        <div className="space-y-1">
          <div className="text-4xl font-semibold">{(finalAnalytics.open_count || finalAnalytics.open_count_unique || 0).toLocaleString()}</div>
          <p className="text-sm text-muted-foreground">
            out of {finalAnalytics.emails_sent_count.toLocaleString()} emails sent
          </p>
        </div>
      </Card>

      {/* Total Leads in List Card */}
      <Card className="p-6 bg-blue-50/30 border-blue-100 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total Leads</h3>
          <Users className="w-4 h-4 text-blue-500" />
        </div>
        <div className="space-y-1">
          <div className="text-4xl font-semibold">
            {finalAnalytics.leads_count?.toLocaleString() || 'N/A'}
          </div>
          <p className="text-sm text-muted-foreground">
            leads in list
          </p>
        </div>
      </Card>
      
      {/* Additional stats in smaller text - span full width */}
      <div className="col-span-full text-xs text-slate-500 space-y-1">
        {analytics.campaign_name && (
          <p><span className="font-medium">Campaign:</span> {analytics.campaign_name}</p>
        )}
        <p><span className="font-medium">Total Opens:</span> {analytics.open_count.toLocaleString()} (including repeats)</p>
        <p><span className="font-medium">Replies:</span> {analytics.reply_count_unique.toLocaleString()}</p>
        {analytics.total_interested > 0 && (
          <p><span className="font-medium">Interested:</span> {analytics.total_interested.toLocaleString()}</p>
        )}
      </div>
    </div>
  )
}