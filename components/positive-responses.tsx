"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ThumbsUp, Clock, User, Building, Mail, Calendar, MessageSquare, ChevronRight } from "lucide-react"

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
  campaignName: string
  campaignId: string
  workspaceName: string
  email_reply_count: number
  email_open_count: number
  verification_status: number
}

interface PositiveResponsesProps {
  category: 'roger' | 'reachify' | 'prusa' | 'all'
  campaignId?: string
  workspaceId?: string
  limit?: number
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
    default: return 'Unknown'
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

export function PositiveResponses({ category, campaignId, workspaceId, limit = 20 }: PositiveResponsesProps) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    async function fetchPositiveResponses() {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        params.append('category', category)
        if (campaignId) params.append('campaign_id', campaignId)
        if (workspaceId) params.append('workspace_id', workspaceId)
        params.append('limit', limit.toString())

        const response = await fetch(`/api/instantly/positive-responses?${params.toString()}`, {
          method: 'POST'
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch positive responses')
        }

        const result = await response.json()
        setLeads(result.leads || [])
      } catch (err) {
        console.error('Error fetching positive responses:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch positive responses')
      } finally {
        setLoading(false)
      }
    }

    fetchPositiveResponses()
  }, [category, campaignId, workspaceId, limit])

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-4 text-slate-500" />
        <p className="text-sm text-slate-600">Loading positive responses...</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-red-600 font-medium mb-2">Error Loading Responses</div>
        <div className="text-red-500 text-sm">{error}</div>
      </Card>
    )
  }

  const displayedLeads = showAll ? leads : leads.slice(0, 6)

  if (leads.length === 0) {
    return (
      <Card className="p-8 text-center">
        <ThumbsUp className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <h3 className="text-lg font-medium text-slate-800 mb-2">No Positive Responses Yet</h3>
        <p className="text-sm text-slate-600">
          No leads with interested or out of office status found for the selected campaigns.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <ThumbsUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Positive Responses</h3>
            <p className="text-sm text-slate-600">
              {leads.length} leads showing interest or currently out of office
            </p>
          </div>
        </div>
        
        {leads.length > 6 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="gap-2"
          >
            {showAll ? 'Show Less' : `View All ${leads.length}`}
            <ChevronRight className={`w-4 h-4 transition-transform ${showAll ? 'rotate-90' : ''}`} />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {displayedLeads.map((lead) => (
          <div
            key={lead.id}
            className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50/50 transition-colors"
          >
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
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-600">
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
                  <span>{formatTimeAgo(lead.timestamp_last_interest_change || lead.timestamp_updated)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span>{lead.campaignName}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{lead.email_reply_count} replies</span>
                </div>
                <span>•</span>
                <span>{lead.email_open_count} opens</span>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              {lead.lt_interest_status === 1 ? (
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              ) : (
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-emerald-600">
              {leads.filter(l => l.lt_interest_status === 1).length}
            </div>
            <div className="text-xs text-slate-600">Interested</div>
          </div>
          <div>
            <div className="text-lg font-bold text-amber-600">
              {leads.filter(l => l.lt_interest_status === 0).length}
            </div>
            <div className="text-xs text-slate-600">Out of Office</div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-800">
              {leads.reduce((sum, lead) => sum + lead.email_reply_count, 0)}
            </div>
            <div className="text-xs text-slate-600">Total Replies</div>
          </div>
        </div>
      </div>
    </Card>
  )
}