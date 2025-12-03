import { NextRequest, NextResponse } from 'next/server'

const INSTANTLY_BASE_URL = 'https://api.instantly.ai'

// Get API key based on workspace selection
function getApiKeyForWorkspace(workspaceId: string | null) {
  if (!workspaceId) {
    return process.env.INSTANTLY_API_KEY
  }
  
  switch (workspaceId) {
    case '1':
      return process.env.INSTANTLY_API_KEY_1
    case '2':
      return process.env.INSTANTLY_API_KEY_2
    case '3':
      return process.env.INSTANTLY_API_KEY_3
    case '4':
      return process.env.INSTANTLY_API_KEY_4
    default:
      return process.env.INSTANTLY_API_KEY
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('=== Daily Analytics API Request ===')
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const category = searchParams.get('category') // 'roger', 'reachify', 'prusa', 'all'
    const campaignId = searchParams.get('campaign_id') // optional specific campaign
    
    console.log('Request params:', { startDate, endDate, category, campaignId })

    // If specific campaign ID is provided, use it directly
    if (campaignId) {
      const workspaceId = searchParams.get('workspace_id') || '1'
      const apiKey = getApiKeyForWorkspace(workspaceId)
      
      if (!apiKey) {
        return NextResponse.json(
          { error: `No API key configured for workspace ${workspaceId}` },
          { status: 400 }
        )
      }

      const params = new URLSearchParams()
      params.append('campaign_id', campaignId)
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)

      const response = await fetch(
        `${INSTANTLY_BASE_URL}/api/v2/campaigns/analytics/daily?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        console.warn(`Failed to fetch daily analytics for campaign ${campaignId}: ${response.status}`)
        return NextResponse.json(
          { error: 'Failed to fetch daily analytics' },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json({ data, campaign_id: campaignId })
    }

    // For category-based requests, get all campaigns first
    const campaignsResponse = await fetch(`${new URL(request.url).origin}/api/instantly/unified-analytics?category=${category || 'all'}`)
    if (!campaignsResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      )
    }

    const campaignsData = await campaignsResponse.json()
    const campaigns = campaignsData.campaigns || []

    // Fetch daily analytics for each campaign and aggregate
    const dailyAnalyticsPromises = campaigns.map(async (campaign: any) => {
      const apiKey = getApiKeyForWorkspace(campaign.workspaceId)
      
      if (!apiKey) {
        console.warn(`No API key for workspace ${campaign.workspaceId}`)
        return null
      }

      try {
        const params = new URLSearchParams()
        params.append('campaign_id', campaign.campaignId)
        if (startDate) params.append('start_date', startDate)
        if (endDate) params.append('end_date', endDate)

        const response = await fetch(
          `${INSTANTLY_BASE_URL}/api/v2/campaigns/analytics/daily?${params.toString()}`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          console.warn(`Failed to fetch daily analytics for campaign ${campaign.campaignId}: ${response.status}`)
          return null
        }

        const data = await response.json()
        return {
          campaignId: campaign.campaignId,
          campaignName: campaign.name,
          data: data
        }
      } catch (error) {
        console.warn(`Error fetching daily analytics for campaign ${campaign.campaignId}:`, error)
        return null
      }
    })

    const results = await Promise.all(dailyAnalyticsPromises)
    const validResults = results.filter(result => result !== null)

    // Aggregate daily data across all campaigns
    const aggregatedData = new Map()

    validResults.forEach(result => {
      result.data.forEach((dailyEntry: any) => {
        const date = dailyEntry.date
        
        if (!aggregatedData.has(date)) {
          aggregatedData.set(date, {
            date,
            sent: 0,
            contacted: 0,
            opened: 0,
            unique_opened: 0,
            replies: 0,
            unique_replies: 0,
            replies_automatic: 0,
            unique_replies_automatic: 0,
            clicks: 0,
            unique_clicks: 0,
            opportunities: 0,
            unique_opportunities: 0
          })
        }

        const existing = aggregatedData.get(date)
        aggregatedData.set(date, {
          date,
          sent: existing.sent + (dailyEntry.sent || 0),
          contacted: existing.contacted + (dailyEntry.contacted || 0),
          opened: existing.opened + (dailyEntry.opened || 0),
          unique_opened: existing.unique_opened + (dailyEntry.unique_opened || 0),
          replies: existing.replies + (dailyEntry.replies || 0),
          unique_replies: existing.unique_replies + (dailyEntry.unique_replies || 0),
          replies_automatic: existing.replies_automatic + (dailyEntry.replies_automatic || 0),
          unique_replies_automatic: existing.unique_replies_automatic + (dailyEntry.unique_replies_automatic || 0),
          clicks: existing.clicks + (dailyEntry.clicks || 0),
          unique_clicks: existing.unique_clicks + (dailyEntry.unique_clicks || 0),
          opportunities: existing.opportunities + (dailyEntry.opportunities || 0),
          unique_opportunities: existing.unique_opportunities + (dailyEntry.unique_opportunities || 0)
        })
      })
    })

    // Convert map to array and sort by date
    const aggregatedArray = Array.from(aggregatedData.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    return NextResponse.json({
      data: aggregatedArray,
      campaigns: validResults.map(r => ({ campaignId: r.campaignId, campaignName: r.campaignName })),
      message: `Fetched daily analytics for ${validResults.length} campaigns`
    })
    
  } catch (error) {
    console.error('Daily Analytics API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}