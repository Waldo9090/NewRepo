"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { 
  Loader2, 
  Mail, 
  Inbox
} from "lucide-react"

interface InboxAccount {
  email: string
  emailCount: number
}

interface InboxListProps {
  category: 'roger' | 'reachify' | 'prusa' | 'all'
  campaignId?: string
  workspaceId?: string
}

export function InboxList({ category, campaignId, workspaceId }: InboxListProps) {
  const [inboxes, setInboxes] = useState<InboxAccount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInboxes()
  }, [category, campaignId, workspaceId])

  const fetchInboxes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('category', category)
      if (campaignId) params.append('campaign_id', campaignId)
      if (workspaceId) params.append('workspace_id', workspaceId)
      params.append('limit', '1000') // Get all emails to extract unique accounts

      const response = await fetch(`/api/instantly/emails?${params.toString()}`)
      
      if (response.ok) {
        const result = await response.json()
        const emails = result.emails || []
        
        // Extract unique email accounts and count emails
        const accountMap = new Map<string, number>()
        
        emails.forEach((email: any) => {
          // Count emails from sender accounts
          if (email.from_address_email) {
            const count = accountMap.get(email.from_address_email) || 0
            accountMap.set(email.from_address_email, count + 1)
          }
          
          // Also count emails sent to accounts (for sent emails)
          if (email.to_address_email_list) {
            const recipients = email.to_address_email_list.split(',')
            recipients.forEach((recipient: string) => {
              const cleanEmail = recipient.trim()
              if (cleanEmail && cleanEmail.includes('@')) {
                const count = accountMap.get(cleanEmail) || 0
                accountMap.set(cleanEmail, count + 1)
              }
            })
          }
        })
        
        // Convert to array and sort by email count (descending)
        const inboxAccounts = Array.from(accountMap.entries())
          .map(([email, emailCount]) => ({ email, emailCount }))
          .sort((a, b) => b.emailCount - a.emailCount)
        
        setInboxes(inboxAccounts)
      }
    } catch (err) {
      console.error('Error fetching inboxes:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Email Inboxes</h2>
        <p className="text-slate-600 mt-1">
          {inboxes.length} active email accounts • {category === 'all' ? 'All campaigns' : `${category} campaigns`}
        </p>
      </div>

      {/* Inbox List */}
      <Card className="p-6">
        <div className="space-y-1">
          {inboxes.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No email accounts found</p>
            </div>
          ) : (
            inboxes.map((inbox, index) => (
              <div
                key={inbox.email}
                className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    <Mail className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800 truncate">
                      {inbox.email}
                    </div>
                    <div className="text-xs text-slate-500">
                      {inbox.emailCount} emails
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-400">
                    #{index + 1}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}