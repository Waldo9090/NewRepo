'use client'

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Mail, Reply, Forward, Archive, Clock, User, Building, Eye, ExternalLink } from "lucide-react"

interface Email {
  id: string
  from_address_email: string
  to_address_email_list: string
  subject: string
  body: { text: string; html: string | null }
  timestamp_email: string
  ue_type: number
  campaignName: string
  campaignId: string
  workspaceName: string
  category: string
  is_unread: number
  content_preview: string
  lead: string
  thread_id: string
  i_status: number | null
  lead_first_name?: string
  lead_last_name?: string
  lead_company?: string
}

interface InboxEmailListProps {
  selectedFilters: string[]
  campaignId?: string | null
  workspaceId?: string | null
  className?: string
}

const EMAIL_TYPE_LABELS = {
  1: 'Campaign Email',
  2: 'Received',
  3: 'Sent',
  4: 'Scheduled'
}

const INTEREST_STATUS_LABELS = {
  1: { label: 'Interested', color: 'bg-green-100 text-green-800', icon: '✨' },
  0: { label: 'Neutral', color: 'bg-yellow-100 text-yellow-800', icon: '➖' },
  [-1]: { label: 'Not Interested', color: 'bg-red-100 text-red-800', icon: '❌' },
  [-2]: { label: 'Out of Office', color: 'bg-purple-100 text-purple-800', icon: '🏢' },
  [-3]: { label: 'Bounced', color: 'bg-orange-100 text-orange-800', icon: '⚠️' }
}

function formatTimeAgo(timestamp: string) {
  const now = new Date()
  const time = new Date(timestamp)
  const diffMs = now.getTime() - time.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return time.toLocaleDateString()
}

export function InboxEmailList({ selectedFilters, campaignId, workspaceId, className = '' }: InboxEmailListProps) {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmails = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        
        // Add filters based on selected filters
        const iStatusFilters: string[] = []
        let hasUnreadFilter = false
        
        selectedFilters.forEach(filter => {
          switch (filter) {
            case 'unread':
              hasUnreadFilter = true
              break
            case 'interested':
              iStatusFilters.push('1')
              break
            case 'neutral':
              iStatusFilters.push('0')
              break
            case 'not-interested':
              iStatusFilters.push('-1')
              break
            case 'out-of-office':
              iStatusFilters.push('-2')
              break
            case 'bounced':
              iStatusFilters.push('-3')
              break
          }
        })

        // Add only one i_status filter (API limitation) - prioritize the first one
        if (iStatusFilters.length > 0) {
          params.append('i_status', iStatusFilters[0])
        }
        
        if (hasUnreadFilter) {
          params.append('is_unread', 'true')
        }

        if (campaignId) {
          params.append('campaign_id', campaignId)
        }

        if (workspaceId) {
          params.append('workspace_id', workspaceId)
        }

        // Default to received emails (ue_type=2) for inbox view
        params.append('email_type', 'received')
        params.append('limit', '50')

        const response = await fetch(`/api/instantly/emails?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch emails: ${response.statusText}`)
        }

        const data = await response.json()
        setEmails(data.emails || [])
      } catch (err) {
        console.error('Error fetching emails:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch emails')
      } finally {
        setLoading(false)
      }
    }

    fetchEmails()
  }, [selectedFilters, campaignId, workspaceId])

  const toggleEmailExpansion = (emailId: string) => {
    setExpandedEmail(expandedEmail === emailId ? null : emailId)
  }

  if (loading) {
    return (
      <Card className={`border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-500 dark:text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-300">Loading inbox...</p>
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 ${className}`}>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <Mail className="w-16 h-16 mx-auto mb-4 text-red-300" />
            <h3 className="text-lg font-medium mb-2">Error Loading Inbox</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </Card>
    )
  }

  if (emails.length === 0) {
    return (
      <Card className={`border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 ${className}`}>
        <div className="text-center py-12">
          <Mail className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2">No Emails Found</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {selectedFilters.length > 0 
              ? `No emails match the selected filters: ${selectedFilters.join(', ')}`
              : 'No emails available in this campaign.'
            }
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Inbox ({emails.length})
        </h3>
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Clock className="w-4 h-4" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {emails.map((email) => {
        const isExpanded = expandedEmail === email.id
        const interestStatus = INTEREST_STATUS_LABELS[email.i_status as keyof typeof INTEREST_STATUS_LABELS]
        
        return (
          <Card key={email.id} className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {email.is_unread === 1 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    <div className="flex items-center gap-1 text-sm">
                      <User className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        {email.lead_first_name && email.lead_last_name 
                          ? `${email.lead_first_name} ${email.lead_last_name}`
                          : email.from_address_email
                        }
                      </span>
                    </div>
                    {email.lead_company && (
                      <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                        <Building className="w-4 h-4" />
                        <span>{email.lead_company}</span>
                      </div>
                    )}
                  </div>
                  
                  <h4 className="font-medium text-slate-800 dark:text-slate-100 truncate mb-1">
                    {email.subject || '(No subject)'}
                  </h4>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                    {email.content_preview || email.body?.text || 'No content preview'}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 ml-4">
                  <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatTimeAgo(email.timestamp_email)}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {EMAIL_TYPE_LABELS[email.ue_type as keyof typeof EMAIL_TYPE_LABELS] || `Type ${email.ue_type}`}
                    </Badge>
                    
                    {interestStatus && (
                      <Badge className={`text-xs ${interestStatus.color}`}>
                        {interestStatus.icon} {interestStatus.label}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{email.campaignName}</span>
                  <span>•</span>
                  <span>{email.workspaceName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleEmailExpansion(email.id)}
                    className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 text-xs"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {isExpanded ? 'Hide' : 'View'}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 text-xs"
                  >
                    <Reply className="w-4 h-4 mr-1" />
                    Reply
                  </Button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-2">Email Details</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">From:</span>
                          <p className="text-slate-800 dark:text-slate-100">{email.from_address_email}</p>
                        </div>
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">To:</span>
                          <p className="text-slate-800 dark:text-slate-100">{email.to_address_email_list}</p>
                        </div>
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Thread ID:</span>
                          <p className="text-slate-800 dark:text-slate-100 font-mono text-xs">{email.thread_id}</p>
                        </div>
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Email ID:</span>
                          <p className="text-slate-800 dark:text-slate-100 font-mono text-xs">{email.id}</p>
                        </div>
                      </div>
                    </div>

                    {email.body?.text && (
                      <div>
                        <h5 className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-2">Email Content</h5>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap max-h-96 overflow-y-auto">
                          {email.body.text}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}