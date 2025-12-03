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
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaign_id')
    const workspaceId = searchParams.get('workspace_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    
    console.log('=== Steps Analytics API Request ===')
    console.log('Request params:', { campaignId, workspaceId, startDate, endDate })
    
    const apiKey = getApiKeyForWorkspace(workspaceId)
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured for selected workspace' },
        { status: 500 }
      )
    }
    
    const params = new URLSearchParams()
    if (campaignId) params.append('campaign_id', campaignId)
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    
    const response = await fetch(
      `${INSTANTLY_BASE_URL}/api/v2/campaigns/analytics/steps?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Steps Analytics API Error:', errorData)
      return NextResponse.json(
        { error: errorData.message || `HTTP ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Steps analytics data:', data)
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Steps Analytics API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}