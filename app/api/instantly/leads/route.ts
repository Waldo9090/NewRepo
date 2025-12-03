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

// Helper function to get status text
function getInterestStatusText(status: any): string {
  // Convert to number if it's a string
  const numStatus = typeof status === 'string' ? parseInt(status, 10) : status;
  
  // Handle null, undefined, or NaN - but allow 0 as valid status
  if (status === null || status === undefined || (typeof status !== 'number' && isNaN(numStatus))) {
    return 'No Status Set';
  }
  
  switch (numStatus) {
    case 0: return 'Out of Office'
    case 1: return 'Interested'
    case 2: return 'Meeting Booked'
    case 3: return 'Meeting Completed'
    case 4: return 'Closed'
    case -1: return 'Not Interested'
    case -2: return 'Wrong Person'
    case -3: return 'Lost'
    default: return `Custom Status (${numStatus})`
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('=== Leads API Request ===')
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId') || searchParams.get('workspace_id')
    const campaignId = searchParams.get('campaignId') || searchParams.get('campaign_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 100 // API maximum
    const startingAfter = searchParams.get('starting_after')
    
    console.log('Request params:', { workspaceId, campaignId, page, startingAfter })
    
    const apiKey = getApiKeyForWorkspace(workspaceId)
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured for selected workspace' },
        { status: 500 }
      )
    }

    const requestBody: any = {
      limit: limit
    }

    // Add campaign filter if specified
    if (campaignId) {
      requestBody.campaign = campaignId
    }

    // Add pagination cursor if provided
    if (startingAfter) {
      requestBody.starting_after = startingAfter
    }
    
    console.log('Fetching leads page:', page, 'with limit:', limit)
    
    const response = await fetch(
      `${INSTANTLY_BASE_URL}/api/v2/leads/list`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || `HTTP ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const leads = data.items || []
    
    console.log(`Fetched ${leads.length} leads quickly`)

    // Transform leads data to include comprehensive lead information
    return NextResponse.json({
      items: leads.map((lead: any) => {
        // Debug log the actual interest status values (only for first few to avoid spam)
        if (leads.indexOf(lead) < 3) {
          console.log(`Lead ${lead.id} - lt_interest_status:`, lead.lt_interest_status, typeof lead.lt_interest_status)
        }
        
        return {
          id: lead.id,
          name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown',
          first_name: lead.first_name,
          last_name: lead.last_name,
          email: lead.email,
          company_name: lead.company_name,
          company_domain: lead.company_domain,
          phone: lead.phone,
          website: lead.website,
          lt_interest_status: lead.lt_interest_status ?? 0, // Default to 0 if null/undefined
          interest_status_text: getInterestStatusText(lead.lt_interest_status),
          status: lead.status,
          campaign: lead.campaign,
          email_open_count: lead.email_open_count || 0,
          email_reply_count: lead.email_reply_count || 0,
          email_click_count: lead.email_click_count || 0,
          verification_status: lead.verification_status,
          timestamp_created: lead.timestamp_created,
          timestamp_updated: lead.timestamp_updated,
          timestamp_last_contact: lead.timestamp_last_contact,
          timestamp_last_open: lead.timestamp_last_open,
          timestamp_last_reply: lead.timestamp_last_reply
        }
      }),
      total_leads: leads.length,
      next_starting_after: data.next_starting_after,
      has_more: !!data.next_starting_after,
      current_page: page,
      message: `Fetched ${leads.length} leads for page ${page}`
    })
    
  } catch (error) {
    console.error('Leads API Error:', error)
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