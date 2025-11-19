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
    console.log('=== Campaign Breakdown API Request ===')
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspace_id')
    const campaignId = searchParams.get('campaign_id')
    
    console.log('Request params:', { workspaceId, campaignId })
    
    const apiKey = getApiKeyForWorkspace(workspaceId)
    
    if (!apiKey) {
      console.error('No API key found for workspace:', workspaceId)
      return NextResponse.json(
        { error: 'API key not configured for selected workspace' },
        { status: 500 }
      )
    }
    
    // Get campaign analytics only - step analytics endpoint may not exist
    const [campaignsResponse] = await Promise.allSettled([
      // Get all campaigns analytics
      fetch(`${INSTANTLY_BASE_URL}/api/v2/campaigns/analytics${campaignId ? `?id=${campaignId}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      })
    ])

    let campaigns = []

    if (campaignsResponse.status === 'fulfilled' && campaignsResponse.value.ok) {
      campaigns = await campaignsResponse.value.json()
    }


    // Return campaigns with empty steps array instead of fake variants
    const campaignsWithSteps = campaigns.map((campaign: any) => {
      return {
        ...campaign,
        steps: [] // Return empty steps array - no fake variants
      }
    })
    
    return NextResponse.json(campaignsWithSteps)
    
  } catch (error) {
    console.error('Campaign Breakdown API Error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}