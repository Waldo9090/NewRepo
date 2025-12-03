'use client'

import { Mail, Loader2, Users, MessageSquare, TrendingUp, Target } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useCampaignsAnalytics } from "@/hooks/use-campaigns-analytics"
import { isPrusaCampaign } from "@/hooks/use-prusa-mock-data"

interface RogerCampaignsMetricsProps {
  campaignId: string
  workspaceId: string
  startDate?: string
  endDate?: string
}

export function RogerCampaignsMetrics({ campaignId, workspaceId, startDate, endDate }: RogerCampaignsMetricsProps) {
  const isPrusa = isPrusaCampaign(campaignId)
  
  const { data: campaigns, loading, error } = useCampaignsAnalytics({
    campaignId: isPrusa ? undefined : campaignId, // Don't call API for PRUSA campaigns
    workspaceId: isPrusa ? undefined : workspaceId,
    startDate,
    endDate,
    excludeTotalLeadsCount: false // We need the leads count
  })

  // Get mock data for PRUSA campaigns
  const getMockCampaignData = () => {
    const mockCampaigns = [
      {
        campaign_name: 'PRUSA external company 7.9M+',
        campaign_id: '87dcc1bb-471a-4b5a-9416-3fb2d34a1691',
        campaign_status: 3,
        campaign_is_evergreen: false,
        leads_count: 1188,
        contacted_count: 1188,
        open_count: 601,
        reply_count: 3,
        link_click_count: 0,
        bounced_count: 50,
        unsubscribed_count: 5,
        completed_count: 1188,
        emails_sent_count: 1188,
        new_leads_contacted_count: 0,
        total_opportunities: 0,
        total_opportunity_value: 0
      },
      {
        campaign_name: 'PRUSA Target Company 7.9M+',
        campaign_id: 'f7275204-8c5f-449f-bb02-58e4027ecca8',
        campaign_status: 3,
        campaign_is_evergreen: false,
        leads_count: 23,
        contacted_count: 23,
        open_count: 14,
        reply_count: 0,
        link_click_count: 0,
        bounced_count: 0,
        unsubscribed_count: 0,
        completed_count: 23,
        emails_sent_count: 23,
        new_leads_contacted_count: 0,
        total_opportunities: 0,
        total_opportunity_value: 0
      },
      {
        campaign_name: 'PRUSA Compass 7.9M+',
        campaign_id: 'de0864ce-252a-4aa2-8cb7-e33e55ad5997',
        campaign_status: 3,
        campaign_is_evergreen: false,
        leads_count: 125,
        contacted_count: 125,
        open_count: 51,
        reply_count: 0,
        link_click_count: 0,
        bounced_count: 2,
        unsubscribed_count: 1,
        completed_count: 125,
        emails_sent_count: 125,
        new_leads_contacted_count: 0,
        total_opportunities: 0,
        total_opportunity_value: 0
      },
      {
        campaign_name: 'PRUSA Compass Florida: Texas',
        campaign_id: 'f211938a-9ffe-4262-9001-6e36892ba127',
        campaign_status: 1,
        campaign_is_evergreen: false,
        leads_count: 2999,
        contacted_count: 18,
        open_count: 1,
        reply_count: 0,
        link_click_count: 0,
        bounced_count: 0,
        unsubscribed_count: 0,
        completed_count: 0,
        emails_sent_count: 18,
        new_leads_contacted_count: 18,
        total_opportunities: 0,
        total_opportunity_value: 0
      },
      {
        campaign_name: 'PRUSA New Campaign',
        campaign_id: '51bab480-545d-4241-94e5-26d9e3fe34ad',
        campaign_status: 3,
        campaign_is_evergreen: false,
        leads_count: 9300,
        contacted_count: 9330,
        open_count: 7739,
        reply_count: 124,
        link_click_count: 0,
        bounced_count: 100,
        unsubscribed_count: 20,
        completed_count: 9330,
        emails_sent_count: 9330,
        new_leads_contacted_count: 0,
        total_opportunities: 15,
        total_opportunity_value: 75000
      }
    ]
    
    return mockCampaigns.find(c => c.campaign_id === campaignId)
  }

  const campaign = isPrusa ? getMockCampaignData() : campaigns?.[0] // Since we're passing a specific campaignId, we get one campaign

  if (loading && !isPrusa) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

  if (!campaign) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-8 bg-white/60 backdrop-blur-sm border-slate-200 shadow-sm col-span-full">
          <div className="text-center text-slate-600">
            <p className="text-sm font-medium">No campaign data available</p>
            <p className="text-xs mt-2 text-slate-500">Campaign data may still be processing</p>
          </div>
        </Card>
      </div>
    )
  }

  // Calculate rates
  const openRate = campaign.emails_sent_count > 0 ? (campaign.open_count / campaign.emails_sent_count) * 100 : 0
  const replyRate = campaign.contacted_count > 0 ? (campaign.reply_count / campaign.contacted_count) * 100 : 0
  
  // Check if this is the PRUSA Compass Florida: Texas campaign to hide certain cards
  const isFloridaTexasCampaign = campaign.campaign_name === 'PRUSA Compass Florida: Texas'
  const hideEmailsOpened = isFloridaTexasCampaign
  const hideReplyRate = isFloridaTexasCampaign
  
  // Count visible cards to adjust grid layout
  const visibleCards = 4 - (hideEmailsOpened ? 1 : 0) - (hideReplyRate ? 1 : 0)

  return (
    <div className="space-y-6 mb-8">
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${visibleCards === 2 ? 'lg:grid-cols-2' : visibleCards === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
        {/* Emails Opened Card - Hidden for PRUSA Compass Florida: Texas */}
        {!hideEmailsOpened && (
          <Card className="p-6 bg-green-50/30 border-green-100 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Emails Opened</h3>
              <Mail className="w-4 h-4 text-green-500" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-semibold">{campaign.open_count.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">
                out of {campaign.emails_sent_count.toLocaleString()} sent
              </p>
            </div>
          </Card>
        )}

        {/* Total Leads Card */}
        <Card className="p-6 bg-blue-50/30 border-blue-100 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Leads</h3>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-semibold">
              {campaign.leads_count.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">
              leads in list
            </p>
          </div>
        </Card>

        {/* Open Rate Card */}
        <Card className="p-6 bg-purple-50/30 border-purple-100 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Open Rate</h3>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-semibold">{openRate.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">
              email open rate
            </p>
          </div>
        </Card>

        {/* Opportunities Card - Hidden for PRUSA Compass Florida: Texas */}
        {!hideReplyRate && (
          <Card className="p-6 bg-orange-50/30 border-orange-100 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Opportunities</h3>
              <Target className="w-4 h-4 text-orange-500" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-semibold">{campaign.total_opportunities || 0}</div>
              <p className="text-sm text-muted-foreground">
                ${(campaign.total_opportunity_value || 0).toLocaleString()}
              </p>
            </div>
          </Card>
        )}
      </div>
      
      {/* Additional stats in smaller text */}
      <div className="text-xs text-slate-500 space-y-1 bg-white/30 rounded-lg p-4">
        <p><span className="font-medium">Campaign:</span> {campaign.campaign_name}</p>
        <p><span className="font-medium">Contacted:</span> {campaign.contacted_count.toLocaleString()} leads</p>
        {campaign.total_opportunities > 0 && (
          <p><span className="font-medium">Opportunities:</span> {campaign.total_opportunities.toLocaleString()}</p>
        )}
        <p><span className="font-medium">Status:</span> {getCampaignStatusLabel(campaign.campaign_status)}</p>
      </div>
    </div>
  )
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