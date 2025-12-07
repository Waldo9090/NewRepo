"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search, X, Mail, Clock, User, MessageSquare, ArrowRight } from "lucide-react"

interface InterestedLead {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  company_name: string | null
  campaignName: string
  interestStatus: number
  threadId: string
  responseCount: number
  lastResponseDate: string
}

interface EmailThread {
  id: string
  subject: string
  from_address_email: string
  to_address_email_list: string
  body: {
    text?: string
    html?: string
  }
  ue_type: number
  timestamp_email: string
  thread_id: string
  i_status?: number
}

interface InterestedLeadsThreadsProps {
  category: 'roger' | 'reachify' | 'prusa' | 'all'
}

function formatEmailContent(content: string | undefined | null): string {
  if (!content) return 'No content available'
  
  let formatted = content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>\s*<div[^>]*>/gi, '\n')
    .replace(/<\/?div[^>]*>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
  
  return formatted
}

export function InterestedLeadsThreads({ category }: InterestedLeadsThreadsProps) {
  const [leads, setLeads] = useState<InterestedLead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLead, setSelectedLead] = useState<InterestedLead | null>(null)
  const [emailThread, setEmailThread] = useState<EmailThread[]>([])
  const [threadLoading, setThreadLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination for better performance
  const [displayCount, setDisplayCount] = useState(25)
  const [hasMore, setHasMore] = useState(true)
  
  // Prevent duplicate requests
  const loadingRef = useRef(false)
  const threadLoadingRef = useRef(false)

  const fetchInterestedLeads = useCallback(async () => {
    // Prevent duplicate calls
    if (loadingRef.current) {
      console.log('Already loading interested leads, skipping...')
      return
    }
    
    loadingRef.current = true
    setLoading(true)
    setError(null)
    
    try {
      // If category is "all", fetch from each category separately with smaller limits
      if (category === 'all') {
        const categories = ['roger', 'reachify', 'prusa']
        let allLeads: InterestedLead[] = []
        
        // Fetch from each category in parallel with reduced limits
        const promises = categories.map(async (cat) => {
          const params = new URLSearchParams()
          params.append('category', cat)
          params.append('email_type', 'received') // Show all received emails (responses)
          params.append('limit', '100') // Reduced limit per category
          
          const response = await fetch(`/api/instantly/emails?${params.toString()}`)
          if (response.ok) {
            const result = await response.json()
            return { category: cat, emails: result.emails || [] }
          }
          return { category: cat, emails: [] }
        })
        
        const results = await Promise.all(promises)
        const leadThreadMap = new Map<string, InterestedLead>()
        
        results.forEach(({ category: cat, emails }) => {
          emails.forEach((email: any) => {
            if (email.lead && email.thread_id) {
              const leadKey = `${email.lead}_${cat}`
              const existing = leadThreadMap.get(leadKey)
              
              if (!existing) {
                leadThreadMap.set(leadKey, {
                  id: leadKey,
                  email: email.lead,
                  first_name: email.first_name || null,
                  last_name: email.last_name || null,
                  company_name: email.company_name || null,
                  campaignName: email.campaign_name || `${cat} Campaign`,
                  interestStatus: email.i_status || 0, // Keep original status or default to 0
                  threadId: email.thread_id,
                  responseCount: 1,
                  lastResponseDate: email.timestamp_email
                })
              } else {
                existing.responseCount++
                if (new Date(email.timestamp_email) > new Date(existing.lastResponseDate)) {
                  existing.lastResponseDate = email.timestamp_email
                }
              }
            }
          })
        })
        
        allLeads = Array.from(leadThreadMap.values())
        setLeads(allLeads)
        console.log(`Found ${allLeads.length} responding leads across all categories`)
      } else {
        // Single category fetch with reduced limit
        const params = new URLSearchParams()
        params.append('category', category)
        params.append('email_type', 'received') // Show all received emails (responses)
        params.append('limit', '200') // Reduced from 500

        const response = await fetch(`/api/instantly/emails?${params.toString()}`)
        
        if (response.ok) {
          const result = await response.json()
          const interestedEmails = result.emails || []
          
          console.log(`Found ${interestedEmails.length} response emails`)
          
          // Step 2: Group by lead and extract lead information
          const leadThreadMap = new Map<string, InterestedLead>()
          
          for (const email of interestedEmails) {
            // More precise lead email extraction - prioritize the actual lead field
            let leadEmail: string | null = null
            
            if (email.lead) {
              leadEmail = email.lead
            } else if (email.ue_type === 2 && email.from_address_email) {
              // If it's a received email (reply), the sender is the lead
              leadEmail = email.from_address_email
            } else if (email.to_address_email_list) {
              // If it's a sent email, the recipient is the lead
              leadEmail = email.to_address_email_list.split(',')[0].trim()
            }
            
            console.log(`Processing email for lead: ${leadEmail}, thread: ${email.thread_id}, type: ${email.ue_type}`)
            
            if (leadEmail && email.thread_id) {
              const leadKey = leadEmail.toLowerCase()
              
              if (!leadThreadMap.has(leadKey)) {
                // Create lead entry
                leadThreadMap.set(leadKey, {
                  id: email.lead_id || leadEmail,
                  email: leadEmail,
                  first_name: email.lead_first_name || null,
                  last_name: email.lead_last_name || null, 
                  company_name: email.lead_company || null,
                  campaignName: email.campaignName || 'Unknown Campaign',
                  interestStatus: email.i_status || 0, // Keep original status or default to 0
                  threadId: email.thread_id,
                  responseCount: 1,
                  lastResponseDate: email.timestamp_email || email.timestamp_created
                })
              } else {
                // Update existing lead with latest response info
                const existingLead = leadThreadMap.get(leadKey)!
                existingLead.responseCount += 1
                if (new Date(email.timestamp_email || email.timestamp_created) > new Date(existingLead.lastResponseDate)) {
                  existingLead.lastResponseDate = email.timestamp_email || email.timestamp_created
                  // Keep the thread ID that has the most recent interested response
                  existingLead.threadId = email.thread_id
                }
              }
            }
          }
          
          const respondingLeadsList = Array.from(leadThreadMap.values())
          console.log(`Found ${respondingLeadsList.length} unique responding leads`)
          setLeads(respondingLeadsList)
        }
      }
    } catch (err) {
      console.error('Error fetching interested leads:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch responding leads')
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [category])

  useEffect(() => {
    fetchInterestedLeads()
  }, [fetchInterestedLeads])

  const fetchEmailThread = useCallback(async (lead: InterestedLead) => {
    // Prevent duplicate calls
    if (threadLoadingRef.current) {
      console.log('Already loading email thread, skipping...')
      return
    }
    
    threadLoadingRef.current = true
    setThreadLoading(true)
    setError(null)
    
    try {
      // Determine the actual category to use for fetching
      const fetchCategory = category === 'all' ? lead.campaignName.toLowerCase().includes('roger') ? 'roger' : 
                            lead.campaignName.toLowerCase().includes('reachify') ? 'reachify' : 'prusa' : category
      
      const params = new URLSearchParams()
      params.append('category', fetchCategory)
      params.append('thread_id', lead.threadId)
      params.append('lead_email', lead.email) // Add lead email filter on server side if available
      params.append('limit', '30') // Reduced from 50

      const response = await fetch(`/api/instantly/emails?${params.toString()}`)
      
      if (response.ok) {
        const result = await response.json()
        const threadEmails = result.emails || []
        
        // More efficient filtering - check lead field first as it's most accurate
        const leadEmail = lead.email.toLowerCase()
        const leadSpecificEmails = threadEmails.filter((email: EmailThread) => {
          // Priority order: direct lead match > to/from email match
          if (email.lead?.toLowerCase() === leadEmail) return true
          if (email.from_address_email?.toLowerCase() === leadEmail) return true
          if (email.to_address_email_list?.toLowerCase().includes(leadEmail)) return true
          return false
        })
        
        // Sort by timestamp to show conversation flow
        const sortedEmails = leadSpecificEmails.sort((a: EmailThread, b: EmailThread) => {
          const aTime = new Date(a.timestamp_email).getTime()
          const bTime = new Date(b.timestamp_email).getTime()
          return aTime - bTime // Oldest first for conversation flow
        })
        
        console.log(`Thread ${lead.threadId} for ${lead.email}:`, {
          category: fetchCategory,
          totalThreadEmails: threadEmails.length,
          filteredEmails: sortedEmails.length
        })
        setEmailThread(sortedEmails)
      }
    } catch (err) {
      console.error('Error fetching email thread:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch email thread')
      setEmailThread([])
    } finally {
      setThreadLoading(false)
      threadLoadingRef.current = false
    }
  }, [category])

  const handleLeadClick = (lead: InterestedLead) => {
    setSelectedLead(lead)
    setEmailThread([]) // Clear previous thread immediately
    fetchEmailThread(lead)
  }

  const closeSidebar = () => {
    setSelectedLead(null)
    setEmailThread([])
  }

  // Filter leads based on search
  const filteredLeads = leads.filter(lead => 
    !searchTerm || 
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Paginate filtered leads for better performance
  const paginatedLeads = filteredLeads.slice(0, displayCount)
  const canLoadMore = filteredLeads.length > displayCount

  const loadMoreLeads = () => {
    setDisplayCount(prev => prev + 25)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500 dark:text-slate-400" />
        <span className="ml-2 text-slate-600 dark:text-slate-300">Loading responding leads...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-600 dark:text-red-400 font-medium mb-2">Error Loading Responding Leads</div>
        <div className="text-red-500 dark:text-red-300 text-sm mb-4">{error}</div>
        <Button 
          onClick={() => fetchInterestedLeads()} 
          size="sm"
          className="bg-red-600 hover:bg-red-700"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Main Leads List */}
      <div className={`bg-white dark:bg-slate-900 ${selectedLead ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Leads with Responses ({filteredLeads.length})
            </h2>
          </div>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search responding leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-0 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 text-slate-800 dark:text-slate-100 transition-colors"
            />
          </div>
        </div>

        {/* Leads List */}
        <div className="divide-y divide-slate-200 dark:divide-slate-700 overflow-y-auto">
          {filteredLeads.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">No responding leads found</p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Only leads with responses are shown</p>
            </div>
          ) : (
            <>
              {paginatedLeads.map((lead) => {
              const name = lead.first_name && lead.last_name 
                ? `${lead.first_name} ${lead.last_name}`
                : lead.email.split('@')[0]
              
              const initial = (lead.first_name?.[0] || lead.email[0]).toUpperCase()

              return (
                <div
                  key={lead.id}
                  className={`px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                    selectedLead?.id === lead.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleLeadClick(lead)}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-medium text-sm">
                      {initial}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Name */}
                      <div className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">
                        {name}
                      </div>
                      
                      {/* Email */}
                      <div className="text-slate-500 dark:text-slate-400 text-sm truncate">
                        {lead.email}
                      </div>
                      
                      {/* Campaign */}
                      <div className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                        {lead.campaignName}
                      </div>
                    </div>

                    {/* Response Stats */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-blue-600 text-xs font-medium mb-1">
                        <MessageSquare className="w-3 h-3" />
                        Responded
                      </div>
                      <div className="text-slate-400 dark:text-slate-500 text-xs">
                        {lead.responseCount} responses
                      </div>
                      <div className="text-slate-400 dark:text-slate-500 text-xs">
                        {new Date(lead.lastResponseDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )
              })}

              {/* Load More Button */}
              {canLoadMore && (
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                  <Button 
                    onClick={loadMoreLeads}
                    variant="outline"
                    size="sm"
                    className="w-full border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Load More ({filteredLeads.length - displayCount} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Sidebar - Email Thread */}
      {selectedLead && (
        <div className="w-1/2 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex flex-col">
          {/* Sidebar Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-medium text-xs">
                {(selectedLead.first_name?.[0] || selectedLead.email[0]).toUpperCase()}
              </div>
              <div>
                <h3 className="font-medium text-slate-900 dark:text-slate-100">
                  {selectedLead.first_name && selectedLead.last_name 
                    ? `${selectedLead.first_name} ${selectedLead.last_name}`
                    : selectedLead.email.split('@')[0]
                  }
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedLead.email}</p>
                <p className="text-xs text-green-600 dark:text-green-400">Conversation Thread</p>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
            >
              <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          {/* Email Thread */}
          <div className="flex-1 overflow-y-auto">
            {threadLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
              </div>
            ) : emailThread.length === 0 ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <Mail className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                  <p className="text-slate-500 dark:text-slate-400">No conversation found</p>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {emailThread.map((email, index) => (
                  <div key={email.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-800">
                    {/* Email Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          email.ue_type === 1 ? 'bg-blue-500' : // Sent from campaign
                          email.ue_type === 2 ? 'bg-green-500' : // Received  
                          email.ue_type === 3 ? 'bg-orange-500' : // Sent manually
                          'bg-gray-400' // Other
                        }`} />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          {email.ue_type === 1 ? 'Campaign Email' :
                           email.ue_type === 2 ? 'Reply Received' :
                           email.ue_type === 3 ? 'Sent Email' :
                           'Email'} #{index + 1}
                        </span>
                        {email.i_status === 1 && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            Interested
                          </span>
                        )}
                        {email.i_status === 2 && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                            Maybe
                          </span>
                        )}
                        {email.i_status === 0 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            Response
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(email.timestamp_email).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Email Subject */}
                    <div className="mb-2">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm">{email.subject}</h4>
                    </div>

                    {/* Email Addresses */}
                    <div className="space-y-1 mb-3 text-xs">
                      <div className="flex gap-2">
                        <span className="text-slate-500 dark:text-slate-400">From:</span>
                        <span className="text-slate-900 dark:text-slate-100">{email.from_address_email}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-slate-500 dark:text-slate-400">To:</span>
                        <span className="text-slate-900 dark:text-slate-100">{email.to_address_email_list}</span>
                      </div>
                    </div>

                    {/* Email Content */}
                    <div className="text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 p-3 rounded border border-slate-200 dark:border-slate-600 max-h-48 overflow-y-auto whitespace-pre-wrap">
                      {formatEmailContent(email.body?.text || email.body?.html)}
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