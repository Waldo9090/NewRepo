"use client"

import { useEffect, useState } from "react"
import { User, Mail, Building2, Filter } from "lucide-react"

interface Lead {
  id: string
  name: string
  first_name: string | null
  last_name: string | null
  email: string | null
  company_name: string | null
  company_domain: string
  phone: string | null
  website: string | null
  lt_interest_status: number
  interest_status_text: string
  status: number
  campaign: string | null
  email_open_count: number
  email_reply_count: number
  email_click_count: number
  verification_status: number
  timestamp_created: string
  timestamp_updated: string
  timestamp_last_contact: string | null
  timestamp_last_open: string | null
  timestamp_last_reply: string | null
}

interface CampaignLeadsProps {
  campaignId: string | null
  workspaceId: string | null
}

export function CampaignLeads({ campaignId, workspaceId }: CampaignLeadsProps) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loadingProgress, setLoadingProgress] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    if (!campaignId) return

    async function fetchLeads(reset = true) {
      if (reset) {
        setLoading(true)
        setLeads([])
        setCurrentPage(1)
        setNextCursor(null)
        setHasMore(false)
      } else {
        setLoadingMore(true)
      }
      
      setError(null)
      setLoadingProgress('Fetching leads data...')

      try {
        const params = new URLSearchParams()
        params.append('campaignId', campaignId)
        if (workspaceId) {
          params.append('workspaceId', workspaceId)
        }
        params.append('page', currentPage.toString())
        if (nextCursor) {
          params.append('starting_after', nextCursor)
        }

        const response = await fetch(`/api/instantly/leads?${params.toString()}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch leads')
        }

        setLoadingProgress('Processing lead data...')
        const data = await response.json()
        
        if (reset) {
          setLeads(data.items || [])
        } else {
          setLeads(prev => [...prev, ...(data.items || [])])
        }
        
        setNextCursor(data.next_starting_after || null)
        setHasMore(data.has_more || false)
        setCurrentPage(data.current_page || 1)
        setLoadingProgress('')
      } catch (err) {
        console.error('Error fetching leads:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch leads')
        setLoadingProgress('')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    }

    fetchLeads(true)
  }, [campaignId, workspaceId])

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-800">Campaign Leads</h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading leads...</p>
          {loadingProgress && (
            <p className="text-slate-500 text-sm mt-2">{loadingProgress}</p>
          )}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-800">Campaign Leads</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-2">Error loading leads</p>
          <p className="text-slate-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  const getInterestStatusBadgeColor = (status: number) => {
    switch (status) {
      case 0: return 'bg-yellow-100 text-yellow-800 border-yellow-200' // Out of Office
      case 1: return 'bg-emerald-100 text-emerald-800 border-emerald-200' // Interested
      case 2: return 'bg-blue-100 text-blue-800 border-blue-200' // Meeting Booked
      case 3: return 'bg-purple-100 text-purple-800 border-purple-200' // Meeting Completed
      case 4: return 'bg-green-100 text-green-800 border-green-200' // Closed
      case -1: return 'bg-red-100 text-red-800 border-red-200' // Not Interested
      case -2: return 'bg-orange-100 text-orange-800 border-orange-200' // Wrong Person
      case -3: return 'bg-gray-100 text-gray-800 border-gray-200' // Lost
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  // Debug function to see what we're getting
  const debugLeadStatus = (lead: Lead) => {
    console.log(`Frontend - Lead ${lead.id}:`, {
      lt_interest_status: lead.lt_interest_status,
      interest_status_text: lead.interest_status_text,
      type: typeof lead.lt_interest_status
    })
  }

  const getLeadStatusBadgeColor = (status: number) => {
    switch (status) {
      case 1: return 'bg-green-100 text-green-800 border-green-200' // Active
      case 2: return 'bg-yellow-100 text-yellow-800 border-yellow-200' // Paused
      case 3: return 'bg-blue-100 text-blue-800 border-blue-200' // Completed
      case -1: return 'bg-red-100 text-red-800 border-red-200' // Bounced
      case -2: return 'bg-orange-100 text-orange-800 border-orange-200' // Unsubscribed
      case -3: return 'bg-gray-100 text-gray-800 border-gray-200' // Skipped
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getLeadStatusText = (status: number) => {
    switch (status) {
      case 1: return 'Active'
      case 2: return 'Paused'
      case 3: return 'Completed'
      case -1: return 'Bounced'
      case -2: return 'Unsubscribed'
      case -3: return 'Skipped'
      default: return 'Unknown'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Filter leads based on selected status
  const filteredLeads = leads.filter(lead => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'interested') return lead.lt_interest_status === 1
    if (statusFilter === 'meeting-booked') return lead.lt_interest_status === 2
    if (statusFilter === 'not-interested') return lead.lt_interest_status === -1
    if (statusFilter === 'out-of-office') return lead.lt_interest_status === 0
    if (statusFilter === 'closed') return lead.lt_interest_status === 4
    return true
  })

  const loadNextPage = async () => {
    if (hasMore && nextCursor) {
      setLoadingMore(true)
      try {
        const params = new URLSearchParams()
        params.append('campaignId', campaignId || '')
        if (workspaceId) {
          params.append('workspaceId', workspaceId)
        }
        params.append('page', (currentPage + 1).toString())
        params.append('starting_after', nextCursor)

        const response = await fetch(`/api/instantly/leads?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch more leads')
        }

        const data = await response.json()
        setLeads(prev => [...prev, ...(data.items || [])])
        setNextCursor(data.next_starting_after || null)
        setHasMore(data.has_more || false)
        setCurrentPage(prev => prev + 1)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load more leads')
      } finally {
        setLoadingMore(false)
      }
    }
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-800">Campaign Leads</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
            {filteredLeads.length} of {leads.length} leads
          </span>
        </div>
        
        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Leads</option>
            <option value="interested">Interested Only</option>
            <option value="meeting-booked">Meeting Booked</option>
            <option value="out-of-office">Out of Office</option>
            <option value="not-interested">Not Interested</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-8">
          <User className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h4 className="text-lg font-medium text-slate-800 mb-2">No Leads Found</h4>
          <p className="text-sm text-slate-600">
            This campaign doesn't have any leads yet.
          </p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-8">
          <Filter className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h4 className="text-lg font-medium text-slate-800 mb-2">No Leads Match Filter</h4>
          <p className="text-sm text-slate-600">
            No leads found with the selected status. Try changing the filter.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-2 font-medium text-slate-600 text-sm">Lead</th>
                <th className="text-left py-3 px-2 font-medium text-slate-600 text-sm">Contact Info</th>
                <th className="text-left py-3 px-2 font-medium text-slate-600 text-sm">Engagement</th>
                <th className="text-left py-3 px-2 font-medium text-slate-600 text-sm">Interest Status</th>
                <th className="text-left py-3 px-2 font-medium text-slate-600 text-sm">Lead Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => {
                // Debug each lead as we render it
                debugLeadStatus(lead);
                
                return (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-2">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">
                            {lead.name || 'Unknown'}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Added {formatDate(lead.timestamp_created)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-600 text-sm">
                            {lead.email || 'No email'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-600 text-sm">
                            {lead.company_name || 'Unknown'}
                          </span>
                        </div>
                        {lead.phone && (
                          <div className="text-slate-500 text-xs">
                            {lead.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Opens:</span>
                          <span className="font-medium text-slate-700">{lead.email_open_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Replies:</span>
                          <span className="font-medium text-slate-700">{lead.email_reply_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Clicks:</span>
                          <span className="font-medium text-slate-700">{lead.email_click_count}</span>
                        </div>
                        {lead.timestamp_last_contact && (
                          <div className="text-slate-400 mt-2">
                            Last contact: {formatDate(lead.timestamp_last_contact)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getInterestStatusBadgeColor(lead.lt_interest_status)}`}>
                        {lead.interest_status_text}
                      </span>
                      <div className="text-xs text-slate-400 mt-1">
                        Status: {lead.lt_interest_status}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getLeadStatusBadgeColor(lead.status)}`}>
                        {getLeadStatusText(lead.status)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={loadNextPage}
                disabled={loadingMore}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2 mx-auto"
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Loading...
                  </>
                ) : (
                  'Load Next 100 Leads'
                )}
              </button>
              <p className="text-slate-500 text-xs mt-2">Page {currentPage} loaded</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}