"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, 
  Search, 
  Mail, 
  MailOpen, 
  Reply, 
  ArrowRight,
  Clock,
  User,
  Building,
  Filter,
  RefreshCw
} from "lucide-react"

interface Email {
  id: string
  timestamp_created: string
  timestamp_email: string
  subject: string
  from_address_email: string | null
  to_address_email_list: string
  body: {
    text: string
    html: string
  }
  campaign_id: string | null
  lead: string | null
  ue_type: number | null
  is_unread: number | null
  is_auto_reply: number | null
  ai_interest_value: number | null
  i_status: number | null
  content_preview: string | null
  campaignName: string
  workspaceName: string
  category: string
}

interface EmailInboxProps {
  category: 'roger' | 'reachify' | 'prusa' | 'all'
  campaignId?: string
  workspaceId?: string
}

function getEmailTypeText(ueType: number | null): string {
  switch (ueType) {
    case 1: return 'Campaign'
    case 2: return 'Received'
    case 3: return 'Sent'
    case 4: return 'Scheduled'
    default: return 'Unknown'
  }
}

function getEmailTypeColor(ueType: number | null): string {
  switch (ueType) {
    case 1: return 'bg-blue-100 text-blue-800'
    case 2: return 'bg-green-100 text-green-800'
    case 3: return 'bg-purple-100 text-purple-800'
    case 4: return 'bg-orange-100 text-orange-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getInterestStatusText(status: number | null): string {
  switch (status) {
    case 1: return 'Interested'
    case 0: return 'Out of Office'
    case 2: return 'Meeting Booked'
    case 3: return 'Meeting Completed'
    case 4: return 'Closed'
    case -1: return 'Not Interested'
    case -2: return 'Wrong Person'
    case -3: return 'Lost'
    default: return null
  }
}

function getInterestStatusColor(status: number | null): string {
  switch (status) {
    case 1: return 'bg-green-100 text-green-800'
    case 0: return 'bg-orange-100 text-orange-800'
    case 2: return 'bg-blue-100 text-blue-800'
    case 3: return 'bg-purple-100 text-purple-800'
    case 4: return 'bg-green-100 text-green-800'
    case -1: return 'bg-red-100 text-red-800'
    case -2: return 'bg-orange-100 text-orange-800'
    case -3: return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function EmailInbox({ category, campaignId, workspaceId }: EmailInboxProps) {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [emailTypeFilter, setEmailTypeFilter] = useState('all')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)

  useEffect(() => {
    fetchEmails()
  }, [category, campaignId, workspaceId, emailTypeFilter, unreadOnly])

  const fetchEmails = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('category', category)
      if (campaignId) params.append('campaign_id', campaignId)
      if (workspaceId) params.append('workspace_id', workspaceId)
      if (emailTypeFilter !== 'all') params.append('email_type', emailTypeFilter)
      if (unreadOnly) params.append('is_unread', 'true')
      if (searchTerm) params.append('search', searchTerm)
      params.append('limit', '100')

      const response = await fetch(`/api/instantly/emails?${params.toString()}`)
      
      if (response.ok) {
        const result = await response.json()
        setEmails(result.emails || [])
      }
    } catch (err) {
      console.error('Error fetching emails:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchEmails()
  }

  // Filter emails based on search (client-side for instant feedback)
  const filteredEmails = emails.filter(email => 
    !searchTerm || 
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.from_address_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.to_address_email_list.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.content_preview?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Email Inbox</h2>
          <p className="text-slate-600 mt-1">
            {filteredEmails.length} emails • {category === 'all' ? 'All campaigns' : `${category} campaigns`}
          </p>
        </div>
        
        <Button
          onClick={fetchEmails}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search emails by subject, sender, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          
          <select
            value={emailTypeFilter}
            onChange={(e) => setEmailTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="received">Received</option>
            <option value="sent">Sent</option>
          </select>
          
          <Button
            variant={unreadOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setUnreadOnly(!unreadOnly)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {unreadOnly ? 'Show All' : 'Unread Only'}
          </Button>
          
          <Button onClick={handleSearch} size="sm">
            Search
          </Button>
        </div>
      </Card>

      {/* Email List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email List Panel */}
        <Card className="p-6">
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {filteredEmails.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No emails found</p>
              </div>
            ) : (
              filteredEmails.map((email) => {
                const isSelected = selectedEmail?.id === email.id
                const isUnread = email.is_unread === 1
                
                return (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'hover:bg-gray-50 border-gray-200'
                    } ${isUnread ? 'font-semibold' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        email.ue_type === 2 ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                      }`}>
                        {email.ue_type === 2 ? <Reply className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className={getEmailTypeColor(email.ue_type)}>
                            {getEmailTypeText(email.ue_type)}
                          </Badge>
                          {isUnread && (
                            <Badge variant="default" className="bg-blue-500">New</Badge>
                          )}
                          {getInterestStatusText(email.i_status) && (
                            <Badge variant="secondary" className={getInterestStatusColor(email.i_status)}>
                              {getInterestStatusText(email.i_status)}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="font-medium text-sm text-slate-800 mb-1 truncate">
                          {email.subject || '(No subject)'}
                        </div>
                        
                        <div className="text-xs text-slate-600 mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3" />
                            {email.from_address_email || email.to_address_email_list}
                          </div>
                        </div>
                        
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <Building className="w-3 h-3" />
                          {email.campaignName}
                          <Clock className="w-3 h-3 ml-2" />
                          {new Date(email.timestamp_email).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>

        {/* Email Detail Panel */}
        <Card className="p-6">
          {selectedEmail ? (
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  {selectedEmail.subject || '(No subject)'}
                </h3>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className={getEmailTypeColor(selectedEmail.ue_type)}>
                    {getEmailTypeText(selectedEmail.ue_type)}
                  </Badge>
                  {selectedEmail.is_unread === 1 && (
                    <Badge variant="default" className="bg-blue-500">Unread</Badge>
                  )}
                  {getInterestStatusText(selectedEmail.i_status) && (
                    <Badge variant="secondary" className={getInterestStatusColor(selectedEmail.i_status)}>
                      {getInterestStatusText(selectedEmail.i_status)}
                    </Badge>
                  )}
                </div>
                
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">From:</span>
                    {selectedEmail.from_address_email || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="font-medium">To:</span>
                    {selectedEmail.to_address_email_list}
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <span className="font-medium">Campaign:</span>
                    {selectedEmail.campaignName}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Date:</span>
                    {new Date(selectedEmail.timestamp_email).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                <h4 className="font-medium text-slate-800 mb-2">Email Content</h4>
                {selectedEmail.content_preview ? (
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {selectedEmail.content_preview}
                  </p>
                ) : selectedEmail.body?.text ? (
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedEmail.body.text}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500 italic">No content preview available</p>
                )}
              </div>
              
              {selectedEmail.ai_interest_value !== null && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">AI Interest Score:</span>
                    <Badge variant="secondary" className={
                      selectedEmail.ai_interest_value > 0.7 ? 'bg-green-100 text-green-800' :
                      selectedEmail.ai_interest_value > 0.4 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {(selectedEmail.ai_interest_value * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <MailOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Select an email to view details</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}