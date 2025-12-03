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
    const campaignId = searchParams.get('id')
    const workspaceId = searchParams.get('workspace_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const excludeTotalLeadsCount = searchParams.get('exclude_total_leads_count')
    
    console.log('=== Campaigns Analytics API Request ===')
    console.log('Request params:', { campaignId, workspaceId, startDate, endDate, excludeTotalLeadsCount })
    
    // Validate workspace ID
    if (!workspaceId || workspaceId === 'undefined' || workspaceId === 'null') {
      console.error('Invalid workspace ID:', workspaceId)
      return NextResponse.json(
        { error: 'Invalid workspace ID provided' },
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
    
    // Validate campaign ID
    if (campaignId && (campaignId === 'null' || campaignId === 'undefined')) {
      console.error('Invalid campaign ID:', campaignId)
      return NextResponse.json(
        { error: 'Invalid campaign ID provided' },
        { status: 400 }
      )
    }

    // Build query parameters for campaigns analytics
    const params = new URLSearchParams()
    if (campaignId) {
      params.append('id', campaignId)
    }
    if (startDate && startDate !== 'null') {
      params.append('start_date', startDate)
    }
    if (endDate && endDate !== 'null') {
      params.append('end_date', endDate)
    }
    if (excludeTotalLeadsCount === 'true') {
      params.append('exclude_total_leads_count', 'true')
    }
    
    const url = `${INSTANTLY_BASE_URL}/api/v2/campaigns/analytics?${params.toString()}`
    console.log('Fetching from URL:', url)
    
    // Get campaigns analytics
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const responseText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { message: responseText || 'Unknown error' }
      }
      
      console.error('Campaigns Analytics API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        url: url
      })
      
      return NextResponse.json(
        { 
          statusCode: response.status,
          error: response.statusText,
          message: errorData.message || 'Something went wrong, please try again'
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Campaigns analytics data:', data)
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Campaigns Analytics API Error:', error)
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