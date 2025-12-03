"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Loader2, Search, Mail, Users, TrendingUp, Calendar, CheckCircle, AlertCircle } from "lucide-react"

interface MailboxInfo {
  email: string
  campaignsCount: number
  emailsSent: number
  repliesReceived: number
  lastActivity: string
  status: 'active' | 'inactive'
  campaigns: string[]
}

interface CampaignMailboxesProps {
  category: 'roger' | 'reachify' | 'prusa' | 'all'
}

export function CampaignMailboxes({ category }: CampaignMailboxesProps) {
  const [mailboxes, setMailboxes] = useState<MailboxInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCampaignMailboxes() {
      setLoading(true)
      setError(null)
      
      try {
        // Fetch emails to extract sending accounts information
        const params = new URLSearchParams()
        params.append('category', category)
        params.append('limit', '1000') // Get more emails to analyze mailboxes
        params.append('email_type', 'sent') // Only sent emails to see sending accounts

        const response = await fetch(`/api/instantly/emails?${params.toString()}`)
        
        if (response.ok) {
          const result = await response.json()
          const emails = result.emails || []
          
          console.log(`Analyzing ${emails.length} sent emails for mailbox information`)
          
          // Group emails by sending account (from_address_email)
          const mailboxMap = new Map<string, MailboxInfo>()
          
          for (const email of emails) {
            if (email.from_address_email || email.eaccount) {
              const mailboxEmail = email.from_address_email || email.eaccount
              
              if (!mailboxMap.has(mailboxEmail)) {
                mailboxMap.set(mailboxEmail, {
                  email: mailboxEmail,
                  campaignsCount: 0,
                  emailsSent: 0,
                  repliesReceived: 0,
                  lastActivity: email.timestamp_email || email.timestamp_created,
                  status: 'active',
                  campaigns: []
                })
              }
              
              const mailboxInfo = mailboxMap.get(mailboxEmail)!
              
              // Count sent emails
              if (email.ue_type === 1 || email.ue_type === 3) { // Campaign email or sent email
                mailboxInfo.emailsSent++
              }
              
              // Add campaign to list if not already added
              if (email.campaignName && !mailboxInfo.campaigns.includes(email.campaignName)) {
                mailboxInfo.campaigns.push(email.campaignName)
                mailboxInfo.campaignsCount++
              }
              
              // Update last activity if this email is more recent
              if (new Date(email.timestamp_email || email.timestamp_created) > new Date(mailboxInfo.lastActivity)) {
                mailboxInfo.lastActivity = email.timestamp_email || email.timestamp_created
              }
            }
          }
          
          // Now fetch received emails to count replies for each mailbox
          const repliesParams = new URLSearchParams()
          repliesParams.append('category', category)
          repliesParams.append('limit', '1000')
          repliesParams.append('email_type', 'received') // Only received emails (replies)

          const repliesResponse = await fetch(`/api/instantly/emails?${repliesParams.toString()}`)
          
          if (repliesResponse.ok) {
            const repliesResult = await repliesResponse.json()
            const replyEmails = repliesResult.emails || []
            
            // Count replies for each mailbox (replies are addressed TO the mailbox)
            for (const replyEmail of replyEmails) {
              const toEmails = replyEmail.to_address_email_list || ''
              
              for (const [mailboxEmail, mailboxInfo] of mailboxMap.entries()) {
                if (toEmails.toLowerCase().includes(mailboxEmail.toLowerCase())) {
                  mailboxInfo.repliesReceived++
                }
              }
            }
          }
          
          // Determine status based on recent activity (active if sent emails in last 30 days)
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          
          for (const mailboxInfo of mailboxMap.values()) {
            const lastActivityDate = new Date(mailboxInfo.lastActivity)
            mailboxInfo.status = lastActivityDate > thirtyDaysAgo ? 'active' : 'inactive'
          }
          
          const mailboxesList = Array.from(mailboxMap.values())
            .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
          
          console.log(`Found ${mailboxesList.length} unique mailboxes`)
          setMailboxes(mailboxesList)
        }
      } catch (err) {
        console.error('Error fetching mailboxes:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch mailboxes')
      } finally {
        setLoading(false)
      }
    }

    fetchCampaignMailboxes()
  }, [category])

  // Filter mailboxes based on search
  const filteredMailboxes = mailboxes.filter(mailbox => 
    !searchTerm || 
    mailbox.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mailbox.campaigns.some(campaign => 
      campaign.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading mailboxes...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-600 font-medium mb-2">Error Loading Mailboxes</div>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Campaign Mailboxes</h2>
          <p className="text-gray-600 text-sm">Email accounts used to send campaigns ({filteredMailboxes.length} mailboxes)</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search mailboxes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-0 bg-gray-50 focus:bg-white transition-colors"
        />
      </div>

      {/* Mailboxes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMailboxes.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Mail className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500">No mailboxes found</p>
            <p className="text-gray-400 text-sm">No sending email accounts detected</p>
          </div>
        ) : (
          filteredMailboxes.map((mailbox) => (
            <Card key={mailbox.email} className="p-6 hover:shadow-lg transition-shadow">
              {/* Mailbox Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
                    {mailbox.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{mailbox.email}</div>
                    <div className="flex items-center gap-1 text-xs">
                      {mailbox.status === 'active' ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-orange-500" />
                          <span className="text-orange-600">Inactive</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>Campaigns</span>
                  </div>
                  <span className="font-medium text-gray-900">{mailbox.campaignsCount}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>Emails Sent</span>
                  </div>
                  <span className="font-medium text-gray-900">{mailbox.emailsSent.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Replies Received</span>
                  </div>
                  <span className="font-medium text-gray-900">{mailbox.repliesReceived.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Last Activity</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {new Date(mailbox.lastActivity).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Reply Rate */}
              {mailbox.emailsSent > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Reply Rate</span>
                    <span className="font-medium text-green-600">
                      {((mailbox.repliesReceived / mailbox.emailsSent) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(((mailbox.repliesReceived / mailbox.emailsSent) * 100), 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Campaign List */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-2">Campaigns:</div>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {mailbox.campaigns.slice(0, 3).map((campaign, index) => (
                    <div key={index} className="text-xs text-gray-700 truncate">
                      • {campaign}
                    </div>
                  ))}
                  {mailbox.campaigns.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{mailbox.campaigns.length - 3} more...
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}