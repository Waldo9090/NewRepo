"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search, X, Mail, Clock, User, Filter } from "lucide-react"

interface Lead {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  company_name: string | null
  lt_interest_status: number | null
  timestamp_last_reply: string | null
  timestamp_updated: string
  campaignName: string
  email_reply_count: number | null
  email_open_count: number | null
  verification_status: number | null
}

type FilterType = 'all' | 'positive_replies' | 'any_replies' | 'out_of_office'

interface SimpleInboxLeadsProps {
  category: 'roger' | 'reachify' | 'prusa' | 'all'
  campaignId?: string
  workspaceId?: string
}

function getStatusText(status: number | null | undefined): string {
  // Handle null, undefined, or missing status
  if (status === null || status === undefined) {
    return 'New Lead' // More positive default than "Not Set"
  }
  
  switch (status) {
    case 1: return 'Interested'
    case 0: return 'Referral'
    case 2: return 'Meeting Booked'
    case 3: return 'Interested'  // Changed from "Meeting Completed"
    case 4: return 'Closed'
    case -1: return 'Not Interested'
    case -2: return 'Wrong Person'
    case -3: return 'Lost'
    default: return `Status ${status}`
  }
}

function getStatusColor(status: number | null | undefined): string {
  // Handle null, undefined, or missing status
  if (status === null || status === undefined) {
    return 'text-blue-500' // More positive color for new leads
  }
  
  switch (status) {
    case 1: return 'text-green-600'
    case 0: return 'text-orange-500'
    case 2: return 'text-blue-600'
    case 3: return 'text-purple-600'
    case 4: return 'text-green-700'
    case -1: return 'text-red-500'
    case -2: return 'text-orange-600'
    case -3: return 'text-gray-500'
    default: return 'text-yellow-600' // Different color for unknown statuses
  }
}

function getVerificationText(status: number | null | undefined): string {
  if (status === null || status === undefined) {
    return 'Pending Verification'
  }
  switch (status) {
    case 1: return 'Verified'
    case 0: return 'Not Verified'
    default: return 'Pending Verification'
  }
}

function formatEmailContent(content: string | undefined | null): string {
  if (!content) return 'No content available'
  
  // Convert HTML to readable text
  let formatted = content
    // Replace <br> and <br/> and <br /> with line breaks
    .replace(/<br\s*\/?>/gi, '\n')
    // Replace </div><div> with line breaks
    .replace(/<\/div>\s*<div[^>]*>/gi, '\n')
    // Remove opening and closing div tags
    .replace(/<\/?div[^>]*>/gi, '')
    // Remove other HTML tags but keep the content
    .replace(/<[^>]*>/g, '')
    // Decode common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Clean up extra whitespace and line breaks
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Multiple line breaks to double
    .replace(/^\s+|\s+$/g, '') // Trim start and end
  
  return formatted
}

export function SimpleInboxLeads({ category, campaignId, workspaceId }: SimpleInboxLeadsProps) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [emails, setEmails] = useState<any[]>([])
  const [emailsLoading, setEmailsLoading] = useState(false)
  const [filterType, setFilterType] = useState<FilterType>('all')

  useEffect(() => {
    async function fetchLeads() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.append('category', category)
        if (campaignId) params.append('campaign_id', campaignId)
        if (workspaceId) params.append('workspace_id', workspaceId)
        params.append('limit', '50')
        params.append('offset', '0')

        const response = await fetch(`/api/instantly/leads-inbox?${params.toString()}`, {
          method: 'POST'
        })
        
        if (response.ok) {
          const result = await response.json()
          console.log('Leads data sample:', result.leads?.slice(0, 5)?.map(lead => ({
            email: lead.email,
            lt_interest_status: lead.lt_interest_status,
            status: lead.status,
            interest_status: lead.interest_status,
            lead_status: lead.lead_status
          })))
          
          // Log unique status values to understand the data
          const uniqueStatuses = [...new Set(result.leads?.map(lead => lead.lt_interest_status))]
          console.log('Unique lt_interest_status values:', uniqueStatuses)
          
          setLeads(result.leads || [])
        }
      } catch (err) {
        console.error('Error fetching leads:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [category, campaignId, workspaceId])

  const fetchEmailsForLead = async (lead: Lead) => {
    setEmailsLoading(true)
    try {
      // Step 1: First fetch emails for this lead to identify threads
      const params = new URLSearchParams()
      params.append('category', category)
      params.append('limit', '200')
      params.append('search', lead.email)

      const response = await fetch(`/api/instantly/emails?${params.toString()}`)
      
      if (response.ok) {
        const result = await response.json()
        const allEmails = result.emails || result.items || []
        
        // Filter to only show emails that involve the selected lead
        const leadEmails = allEmails.filter((email: any) => {
          const leadEmail = lead.email.toLowerCase()
          return (
            email.lead?.toLowerCase() === leadEmail || 
            email.to_address_email_list?.toLowerCase().includes(leadEmail) ||
            email.from_address_email?.toLowerCase() === leadEmail ||
            email.lead_email?.toLowerCase() === leadEmail
          )
        })
        
        // Step 2: For emails with interest status, fetch full conversation threads
        const emailsWithThreads = []
        const processedThreads = new Set()
        
        for (const email of leadEmails) {
          // If this email has an interest status and we haven't processed its thread
          if (email.i_status !== null && email.i_status !== undefined && 
              email.thread_id && !processedThreads.has(email.thread_id)) {
            
            processedThreads.add(email.thread_id)
            
            // Fetch full conversation thread
            try {
              const threadParams = new URLSearchParams()
              threadParams.append('category', category)
              threadParams.append('thread_id', email.thread_id)
              threadParams.append('limit', '50')
              
              const threadResponse = await fetch(`/api/instantly/emails?${threadParams.toString()}`)
              
              if (threadResponse.ok) {
                const threadResult = await threadResponse.json()
                const threadEmails = threadResult.emails || threadResult.items || []
                
                // Add thread context to emails
                const threadEmailsWithContext = threadEmails.map((threadEmail: any) => ({
                  ...threadEmail,
                  isPartOfInterestThread: true,
                  originalInterestEmail: email.i_status
                }))
                
                emailsWithThreads.push(...threadEmailsWithContext)
              }
            } catch (threadError) {
              console.warn('Failed to fetch thread:', threadError)
              // Fall back to the original email
              emailsWithThreads.push(email)
            }
          } else {
            // Regular email without thread context
            emailsWithThreads.push(email)
          }
        }
        
        // Remove duplicates and sort by timestamp
        const uniqueEmails = emailsWithThreads.filter((email, index, self) => 
          index === self.findIndex(e => e.id === email.id)
        ).sort((a, b) => {
          const aTime = new Date(a.timestamp_email || a.timestamp_created).getTime()
          const bTime = new Date(b.timestamp_email || b.timestamp_created).getTime()
          return bTime - aTime // Most recent first
        })
        
        console.log(`Found ${uniqueEmails.length} emails for lead ${lead.email}:`, uniqueEmails.slice(0, 3))
        setEmails(uniqueEmails)
      } else {
        console.error('Failed to fetch emails:', response.status, response.statusText)
        setEmails([])
      }
    } catch (err) {
      console.error('Error fetching emails for lead:', err)
      setEmails([])
    } finally {
      setEmailsLoading(false)
    }
  }

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead)
    fetchEmailsForLead(lead)
  }

  const closeSidebar = () => {
    setSelectedLead(null)
    setEmails([])
  }

  // Filter leads based on search and filter type
  const filteredLeads = leads.filter(lead => {
    // Search filter
    const matchesSearch = !searchTerm || 
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false
    
    // Status filter
    switch (filterType) {
      case 'positive_replies':
        // Leads with positive interest status (1: Interested, 2: Meeting Booked, 3: Interested, 4: Closed)
        return [1, 2, 3, 4].includes(lead.lt_interest_status || 0)
      
      case 'any_replies':
        // Leads with any reply count > 0
        return (lead.email_reply_count || 0) > 0
      
      case 'out_of_office':
        // Leads with referral status (0: Referral, which was formerly "Out of Office")
        return lead.lt_interest_status === 0
      
      default:
        return true
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Main Leads List */}
      <div className={`bg-white ${selectedLead ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
        {/* Search and Filters */}
        <div className="border-b border-gray-100 px-6 py-4 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-0 bg-gray-50 focus:bg-white transition-colors"
            />
          </div>
          
          {/* Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>Filter:</span>
            </div>
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
              className="text-xs"
            >
              All Leads ({leads.length})
            </Button>
            <Button
              variant={filterType === 'positive_replies' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('positive_replies')}
              className="text-xs"
            >
              Positive Replies ({leads.filter(lead => [1, 2, 3, 4].includes(lead.lt_interest_status || 0)).length})
            </Button>
            <Button
              variant={filterType === 'any_replies' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('any_replies')}
              className="text-xs"
            >
              Any Replies ({leads.filter(lead => (lead.email_reply_count || 0) > 0).length})
            </Button>
            <Button
              variant={filterType === 'out_of_office' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('out_of_office')}
              className="text-xs"
            >
              Referrals ({leads.filter(lead => lead.lt_interest_status === 0).length})
            </Button>
          </div>
        </div>

        {/* Leads List */}
        <div className="divide-y divide-gray-100 overflow-y-auto">
          {filteredLeads.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 text-sm">No leads found</p>
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const name = lead.first_name && lead.last_name 
                ? `${lead.first_name} ${lead.last_name}`
                : lead.email.split('@')[0]
              
              const initial = (lead.first_name?.[0] || lead.email[0]).toUpperCase()

              return (
                <div
                  key={lead.id}
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    selectedLead?.id === lead.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleLeadClick(lead)}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
                      {initial}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Name */}
                      <div className="font-medium text-gray-900 text-sm truncate">
                        {name}
                      </div>
                      
                      {/* Email */}
                      <div className="text-gray-500 text-sm truncate">
                        {lead.email}
                      </div>
                      
                      {/* Campaign */}
                      <div className="text-gray-400 text-xs mt-1">
                        {lead.campaignName}
                      </div>
                    </div>

                    {/* Status & Stats */}
                    <div className="text-right">
                      <div className={`text-xs font-medium ${getStatusColor(lead.lt_interest_status)}`}>
                        {getStatusText(lead.lt_interest_status)}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        {getVerificationText(lead.verification_status)}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {lead.email_reply_count ?? 0} replies • {lead.email_open_count ?? 0} opens
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Right Sidebar - Email Details */}
      {selectedLead && (
        <div className="w-1/2 bg-white border-l border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-xs">
                {(selectedLead.first_name?.[0] || selectedLead.email[0]).toUpperCase()}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {selectedLead.first_name && selectedLead.last_name 
                    ? `${selectedLead.first_name} ${selectedLead.last_name}`
                    : selectedLead.email.split('@')[0]
                  }
                </h3>
                <p className="text-sm text-gray-500">{selectedLead.email}</p>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Email Thread */}
          <div className="flex-1 overflow-y-auto">
            {emailsLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
              </div>
            ) : emails.length === 0 ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No emails found</p>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {emails.map((email, index) => (
                  <div key={email.id || index} className={`border rounded-lg p-4 ${
                    email.isPartOfInterestThread ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}>
                    {/* Email Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          email.ue_type === 1 ? 'bg-blue-500' : // Sent from campaign
                          email.ue_type === 2 ? 'bg-green-500' : // Received  
                          email.ue_type === 3 ? 'bg-orange-500' : // Sent manually
                          'bg-gray-400' // Scheduled or other
                        }`} />
                        <span className="text-xs font-medium text-gray-600">
                          {email.ue_type === 1 ? 'Campaign Email' :
                           email.ue_type === 2 ? 'Reply Received' :
                           email.ue_type === 3 ? 'Sent Email' :
                           email.ue_type === 4 ? 'Scheduled' : 'Email'}
                        </span>
                        {email.isPartOfInterestThread && (
                          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                            Interest Thread
                          </span>
                        )}
                        {email.i_status !== null && email.i_status !== undefined && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                            Interest: {email.i_status}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(email.timestamp_email || email.timestamp_created).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Email Subject */}
                    <div className="mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{email.subject}</h4>
                    </div>

                    {/* Email Addresses */}
                    <div className="space-y-1 mb-3 text-xs">
                      <div className="flex gap-2">
                        <span className="text-gray-500">From:</span>
                        <span className="text-gray-900">{email.from_address_email || email.eaccount}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-gray-500">To:</span>
                        <span className="text-gray-900">{email.to_address_email_list}</span>
                      </div>
                    </div>

                    {/* Email Content Preview */}
                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto whitespace-pre-wrap">
                      {formatEmailContent(email.content_preview || email.body?.text || email.body?.html)}
                    </div>

                    {/* Email Metadata */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        {email.is_unread === 1 && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Unread</span>
                        )}
                        {email.ai_interest_value && (
                          <span>AI Interest: {Math.round(email.ai_interest_value * 100)}%</span>
                        )}
                      </div>
                      <div>
                        {email.eaccount && <span>Account: {email.eaccount}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}