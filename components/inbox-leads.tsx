"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Loader2, 
  Inbox, 
  Search, 
  Filter, 
  User, 
  Building, 
  Mail, 
  Calendar, 
  MessageSquare, 
  Eye,
  ChevronDown,
  ChevronUp
} from "lucide-react"

interface Lead {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  company_name: string | null
  lt_interest_status: number
  timestamp_last_reply: string | null
  timestamp_last_interest_change: string | null
  timestamp_updated: string
  timestamp_created: string
  campaignName: string
  campaignId: string
  workspaceName: string
  category: string
  email_reply_count: number
  email_open_count: number
  verification_status: number
  phone: string | null
  linkedin: string | null
}

interface InboxLeadsProps {
  category: 'roger' | 'reachify' | 'prusa' | 'all'
  campaignId?: string
  workspaceId?: string
}

function getInterestStatusText(status: number): string {
  switch (status) {
    case 0: return 'Out of Office'
    case 1: return 'Interested'
    case 2: return 'Meeting Booked'
    case 3: return 'Meeting Completed'
    case 4: return 'Closed'
    case -1: return 'Not Interested'
    case -2: return 'Wrong Person'
    case -3: return 'Lost'
    default: return 'No Status'
  }
}

function getInterestStatusColor(status: number): string {
  switch (status) {
    case 0: return 'bg-amber-100 text-amber-700 border-amber-200'
    case 1: return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 2: return 'bg-blue-100 text-blue-700 border-blue-200'
    case 3: return 'bg-purple-100 text-purple-700 border-purple-200'
    case 4: return 'bg-green-100 text-green-700 border-green-200'
    case -1: return 'bg-red-100 text-red-700 border-red-200'
    case -2: return 'bg-orange-100 text-orange-700 border-orange-200'
    case -3: return 'bg-gray-100 text-gray-700 border-gray-200'
    default: return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

function getVerificationStatusText(status: number): string {
  switch (status) {
    case 1: return 'Valid'
    case 0: return 'Invalid'
    case -1: return 'Unknown'
    default: return 'Not Verified'
  }
}

function getVerificationStatusColor(status: number): string {
  switch (status) {
    case 1: return 'bg-green-100 text-green-700 border-green-200'
    case 0: return 'bg-red-100 text-red-700 border-red-200'
    case -1: return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 30) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function InboxLeads({ category, campaignId, workspaceId }: InboxLeadsProps) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<number | null>(null)
  const [expandedLead, setExpandedLead] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const leadsPerPage = 25
  const offset = (currentPage - 1) * leadsPerPage

  useEffect(() => {
    async function fetchInboxLeads() {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        params.append('category', category)
        if (campaignId) params.append('campaign_id', campaignId)
        if (workspaceId) params.append('workspace_id', workspaceId)
        params.append('limit', leadsPerPage.toString())
        params.append('offset', offset.toString())

        const response = await fetch(`/api/instantly/leads-inbox?${params.toString()}`, {
          method: 'POST'
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch leads')
        }

        const result = await response.json()
        setLeads(result.leads || [])
        setHasMore(result.hasMore || false)
      } catch (err) {
        console.error('Error fetching inbox leads:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch leads')
      } finally {
        setLoading(false)
      }
    }

    fetchInboxLeads()
  }, [category, campaignId, workspaceId, currentPage])

  // Filter leads based on search and status
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm || 
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.campaignName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === null || lead.lt_interest_status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-4 text-slate-500" />
        <p className="text-sm text-slate-600">Loading inbox leads...</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-red-600 font-medium mb-2">Error Loading Leads</div>
        <div className="text-red-500 text-sm">{error}</div>
      </Card>
    )
  }

  if (leads.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Inbox className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <h3 className="text-lg font-medium text-slate-800 mb-2">No Leads Found</h3>
        <p className="text-sm text-slate-600">
          No leads found for the selected campaigns.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Inbox className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Inbox</h3>
            <p className="text-sm text-slate-600">
              {filteredLeads.length} of {leads.length} leads
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter ?? ''}
          onChange={(e) => setStatusFilter(e.target.value === '' ? null : parseInt(e.target.value))}
          className="px-3 py-2 border border-slate-200 rounded-md text-sm"
        >
          <option value="">All Statuses</option>
          <option value="1">Interested</option>
          <option value="0">Out of Office</option>
          <option value="2">Meeting Booked</option>
          <option value="3">Meeting Completed</option>
          <option value="4">Closed</option>
          <option value="-1">Not Interested</option>
          <option value="-2">Wrong Person</option>
          <option value="-3">Lost</option>
        </select>
      </div>

      {/* Leads List */}
      <div className="space-y-3">
        {filteredLeads.map((lead) => (
          <div
            key={lead.id}
            className="border border-slate-200 rounded-lg hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-center gap-4 p-4">
              {/* Avatar */}
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {(lead.first_name?.[0] || lead.email[0]).toUpperCase()}
              </div>

              {/* Lead Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-slate-800 truncate">
                    {lead.first_name && lead.last_name
                      ? `${lead.first_name} ${lead.last_name}`
                      : lead.email
                    }
                  </h4>
                  <Badge className={`text-xs px-2 py-0.5 border ${getInterestStatusColor(lead.lt_interest_status)}`}>
                    {getInterestStatusText(lead.lt_interest_status)}
                  </Badge>
                  <Badge className={`text-xs px-2 py-0.5 border ${getVerificationStatusColor(lead.verification_status)}`}>
                    {getVerificationStatusText(lead.verification_status)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-1">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span className="truncate max-w-[200px]">{lead.email}</span>
                  </div>
                  
                  {lead.company_name && (
                    <div className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      <span className="truncate max-w-[150px]">{lead.company_name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatTimeAgo(lead.timestamp_last_reply || lead.timestamp_updated)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{lead.campaignName}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>{lead.email_reply_count} replies</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{lead.email_open_count} opens</span>
                  </div>
                </div>
              </div>

              {/* Expand Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
              >
                {expandedLead === lead.id ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Expanded Details */}
            {expandedLead === lead.id && (
              <div className="border-t border-slate-200 p-4 bg-slate-50/30">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-slate-700 mb-2">Contact Details</div>
                    <div className="space-y-1 text-slate-600">
                      {lead.phone && (
                        <div>Phone: {lead.phone}</div>
                      )}
                      {lead.linkedin && (
                        <div>LinkedIn: <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Profile</a></div>
                      )}
                      <div>Workspace: {lead.workspaceName}</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-700 mb-2">Timeline</div>
                    <div className="space-y-1 text-slate-600">
                      <div>Created: {new Date(lead.timestamp_created).toLocaleDateString()}</div>
                      <div>Updated: {new Date(lead.timestamp_updated).toLocaleDateString()}</div>
                      {lead.timestamp_last_reply && (
                        <div>Last Reply: {new Date(lead.timestamp_last_reply).toLocaleDateString()}</div>
                      )}
                      {lead.timestamp_last_interest_change && (
                        <div>Status Changed: {new Date(lead.timestamp_last_interest_change).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {(currentPage > 1 || hasMore) && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-600">
            Page {currentPage}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!hasMore}
          >
            Next
          </Button>
        </div>
      )}
    </Card>
  )
}