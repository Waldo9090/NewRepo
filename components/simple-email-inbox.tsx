"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search, Mail, RefreshCw } from "lucide-react"

interface SimpleEmail {
  id: string
  from_address_email: string | null
  timestamp_email: string
}

interface SimpleEmailInboxProps {
  campaignId?: string | null
  workspaceId?: string | null
}

export function SimpleEmailInbox({ campaignId, workspaceId }: SimpleEmailInboxProps) {
  const [emails, setEmails] = useState<SimpleEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (campaignId) {
      fetchEmails()
    }
  }, [campaignId, workspaceId])

  const fetchEmails = async () => {
    if (!campaignId) return
    
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('campaign_id', campaignId)
      if (workspaceId) params.append('workspace_id', workspaceId)
      params.append('limit', '100')
      params.append('preview_only', 'true')

      const response = await fetch(`/api/instantly/emails?${params.toString()}`)
      
      if (response.ok) {
        const result = await response.json()
        const emailData = result.items || []
        
        // Extract only the sender email addresses and basic info
        const simpleEmails: SimpleEmail[] = emailData.map((email: any) => ({
          id: email.id,
          from_address_email: email.from_address_email,
          timestamp_email: email.timestamp_email
        }))
        
        setEmails(simpleEmails)
      }
    } catch (err) {
      console.error('Error fetching emails:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter emails based on search term
  const filteredEmails = emails.filter(email => 
    !searchTerm || 
    email.from_address_email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get unique sender emails
  const uniqueSenders = Array.from(
    new Set(
      filteredEmails
        .filter(email => email.from_address_email)
        .map(email => email.from_address_email)
    )
  )

  if (!campaignId) {
    return (
      <Card className="p-12 text-center">
        <Mail className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <h3 className="text-lg font-medium text-slate-800 mb-2">Select a Campaign</h3>
        <p className="text-sm text-slate-600">
          Choose a specific campaign to view its email senders.
        </p>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500 mx-auto mb-4" />
        <p className="text-slate-600">Loading email senders...</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Email Senders</h2>
          <p className="text-slate-600 mt-1">
            {uniqueSenders.length} unique senders • {filteredEmails.length} total emails
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

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by sender email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Email Senders List */}
      <Card className="p-6">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {uniqueSenders.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No sender emails found</p>
            </div>
          ) : (
            uniqueSenders.map((senderEmail, index) => {
              const emailCount = filteredEmails.filter(
                email => email.from_address_email === senderEmail
              ).length

              return (
                <div
                  key={`${senderEmail}-${index}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">
                        {senderEmail}
                      </div>
                      <div className="text-xs text-slate-500">
                        {emailCount} email{emailCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>
    </div>
  )
}