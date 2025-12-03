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
    
    // Validate workspace ID
    if (!workspaceId || workspaceId === 'undefined' || workspaceId === 'null') {
      console.error('Invalid workspace ID:', workspaceId)
      return NextResponse.json(
        { error: 'Invalid workspace ID provided' },
        { status: 400 }
      )
    }
    
    // Validate campaign ID
    if (!campaignId || campaignId === 'undefined' || campaignId === 'null') {
      console.error('Invalid campaign ID:', campaignId)
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }
    
    const apiKey = getApiKeyForWorkspace(workspaceId)
    
    if (!apiKey) {
      console.error('No API key found for workspace:', workspaceId)
      return NextResponse.json(
        { error: 'API key not configured for selected workspace' },
        { status: 500 }
      )
    }
    
    // Get both campaign analytics and step analytics
    const campaignParams = new URLSearchParams()
    if (campaignId) campaignParams.append('id', campaignId)
    
    const stepsParams = new URLSearchParams()
    if (campaignId) stepsParams.append('campaign_id', campaignId)
    
    const [campaignsResponse, stepsResponse] = await Promise.allSettled([
      // Get all campaigns analytics
      fetch(`${INSTANTLY_BASE_URL}/api/v2/campaigns/analytics?${campaignParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }),
      // Get steps analytics
      fetch(`${INSTANTLY_BASE_URL}/api/v2/campaigns/analytics/steps?${stepsParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      })
    ])

    let campaigns = []
    let steps = []

    // Handle campaigns response
    if (campaignsResponse.status === 'fulfilled') {
      if (campaignsResponse.value.ok) {
        try {
          campaigns = await campaignsResponse.value.json()
        } catch (error) {
          console.error('Error parsing campaigns response:', error)
        }
      } else {
        console.error('Campaigns API error:', campaignsResponse.value.status, campaignsResponse.value.statusText)
      }
    } else {
      console.error('Campaigns request failed:', campaignsResponse.reason)
    }
    
    // Handle steps response
    if (stepsResponse.status === 'fulfilled') {
      if (stepsResponse.value.ok) {
        try {
          steps = await stepsResponse.value.json()
        } catch (error) {
          console.error('Error parsing steps response:', error)
        }
      } else {
        console.error('Steps API error:', stepsResponse.value.status, stepsResponse.value.statusText)
      }
    } else {
      console.error('Steps request failed:', stepsResponse.reason)
    }

    console.log('Campaign data:', campaigns)
    console.log('Steps data:', steps)

    // Map variant numbers to letters for display
    const variantLabels: { [key: string]: string } = {
      '0': 'A',
      '1': 'B', 
      '2': 'C',
      '3': 'D',
      '4': 'E'
    }

    // Attach steps data to each campaign
    const campaignsWithSteps = campaigns.map((campaign: any) => {
      // Filter steps for this campaign and format them
      const campaignSteps = steps
        .filter((step: any) => step.campaign_id === campaign.campaign_id || !step.campaign_id)
        .map((step: any) => ({
          step: step.step,
          variant: variantLabels[step.variant] || step.variant,
          sent: step.sent,
          opened: step.unique_opened,
          unique_opened: step.unique_opened,
          replies: step.unique_replies,
          unique_replies: step.unique_replies,
          clicks: step.unique_clicks,
          unique_clicks: step.unique_clicks
        }))
        .sort((a: any, b: any) => {
          // Sort by variant label (A, B, C, D, E)
          return a.variant.localeCompare(b.variant)
        })

      return {
        ...campaign,
        steps: campaignSteps
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