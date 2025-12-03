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
  campaign_name?: string
  category?: string
}

interface Campaign {
  id: string
  name: string
  status: number
  category?: string
  analytics?: {
    leads_count: number
    emails_sent_count: number
    reply_count: number
  }
}

interface CategorySimpleInboxProps {
  category: 'roger' | 'reachify' | 'prusa' | 'all'
}

export function CategorySimpleInbox({ category }: CategorySimpleInboxProps) {
  const [emails, setEmails] = useState<SimpleEmail[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [campaignsLoading, setCampaignsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchEmails()
    fetchCampaigns()
  }, [category])

  const fetchEmails = async () => {
    setLoading(true)
    try {
      // Fetch emails from all categories
      const categories = ['roger', 'reachify', 'prusa']
      const allEmails: SimpleEmail[] = []

      for (const cat of categories) {
        try {
          const params = new URLSearchParams()
          params.append('category', cat)
          params.append('limit', '100')
          params.append('preview_only', 'true')

          const response = await fetch(`/api/instantly/emails?${params.toString()}`)
          
          if (response.ok) {
            const result = await response.json()
            const emailData = result.emails || result.items || []
            
            // Extract only the sender email addresses and basic info
            const simpleEmails: SimpleEmail[] = emailData.map((email: any) => ({
              id: `${cat}-${email.id}`, // Add category prefix to avoid ID conflicts
              from_address_email: email.from_address_email,
              timestamp_email: email.timestamp_email,
              campaign_name: email.campaignName || email.campaign_name,
              category: cat
            }))
            
            allEmails.push(...simpleEmails)
          }
        } catch (err) {
          console.error(`Error fetching ${cat} emails:`, err)
        }
      }
      
      setEmails(allEmails)
    } catch (err) {
      console.error('Error fetching emails:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCampaigns = async () => {
    setCampaignsLoading(true)
    try {
      // Fetch campaigns from all categories
      const categories = ['roger', 'reachify', 'prusa']
      const allCampaigns: Campaign[] = []

      for (const cat of categories) {
        try {
          const response = await fetch(`/api/instantly/unified-analytics?category=${cat}`)
          if (response.ok) {
            const result = await response.json()
            const campaignData = result.campaigns || []
            
            // Add category info to campaigns
            const categorizedCampaigns = campaignData.map((campaign: any) => ({
              ...campaign,
              category: cat
            }))
            
            allCampaigns.push(...categorizedCampaigns)
          }
        } catch (err) {
          console.error(`Error fetching ${cat} campaigns:`, err)
        }
      }
      
      setCampaigns(allCampaigns)
    } catch (err) {
      console.error('Error fetching campaigns:', err)
    } finally {
      setCampaignsLoading(false)
    }
  }

  // Filter emails based on search term
  const filteredEmails = emails.filter(email => 
    !searchTerm || 
    email.from_address_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.campaign_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get unique sender emails with their campaign info
  const senderMap = new Map<string, {
    email: string
    count: number
    campaigns: Set<string>
    categories: Set<string>
    lastSeen: string
  }>()

  filteredEmails.forEach(email => {
    if (email.from_address_email) {
      const key = email.from_address_email
      if (senderMap.has(key)) {
        const existing = senderMap.get(key)!
        existing.count += 1
        if (email.campaign_name) {
          existing.campaigns.add(email.campaign_name)
        }
        if (email.category) {
          existing.categories.add(email.category)
        }
        if (new Date(email.timestamp_email) > new Date(existing.lastSeen)) {
          existing.lastSeen = email.timestamp_email
        }
      } else {
        senderMap.set(key, {
          email: key,
          count: 1,
          campaigns: new Set(email.campaign_name ? [email.campaign_name] : []),
          categories: new Set(email.category ? [email.category] : []),
          lastSeen: email.timestamp_email
        })
      }
    }
  })

  const uniqueSenders = Array.from(senderMap.values()).sort((a, b) => 
    new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
  )

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
          <h2 className="text-2xl font-bold text-slate-800">All Email Senders</h2>
          <p className="text-slate-600 mt-1">
            {uniqueSenders.length} unique senders • {filteredEmails.length} total emails across all campaigns
          </p>
        </div>
        
        <Button
          onClick={() => {
            fetchEmails()
            fetchCampaigns()
          }}
          variant="outline"
          size="sm"
          disabled={loading || campaignsLoading}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Campaigns List */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            All Campaigns
          </h3>
          {campaignsLoading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading campaigns...
            </div>
          ) : (
            <p className="text-slate-600 text-sm">
              {campaigns.length} total campaign{campaigns.length !== 1 ? 's' : ''} across all categories
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {campaignsLoading ? (
            <div className="col-span-full flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No campaigns found</p>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="font-medium text-slate-800 truncate">
                      {campaign.name}
                    </h4>
                    {campaign.category && (
                      <div className="mt-1">
                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                          campaign.category === 'roger' ? 'bg-blue-100 text-blue-700' :
                          campaign.category === 'reachify' ? 'bg-green-100 text-green-700' :
                          campaign.category === 'prusa' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {campaign.category.charAt(0).toUpperCase() + campaign.category.slice(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    campaign.status === 1 ? 'bg-green-500' : 
                    campaign.status === 2 ? 'bg-yellow-500' : 
                    campaign.status === 3 ? 'bg-blue-500' : 'bg-gray-400'
                  }`} />
                </div>
                {campaign.analytics && (
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Leads:</span>
                      <span className="font-medium">{campaign.analytics.leads_count?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sent:</span>
                      <span className="font-medium">{campaign.analytics.emails_sent_count?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Replies:</span>
                      <span className="font-medium">{campaign.analytics.reply_count?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by sender email, campaign name, or category..."
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
            uniqueSenders.map((sender, index) => {
              const campaignList = Array.from(sender.campaigns).join(', ')
              const categoriesList = Array.from(sender.categories)
              
              return (
                <div
                  key={`${sender.email}-${index}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-800 truncate">
                        {sender.email}
                      </div>
                      <div className="text-xs text-slate-500">
                        {sender.count} email{sender.count !== 1 ? 's' : ''} • Last seen: {new Date(sender.lastSeen).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {categoriesList.map((cat) => (
                          <span
                            key={cat}
                            className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                              cat === 'roger' ? 'bg-blue-100 text-blue-700' :
                              cat === 'reachify' ? 'bg-green-100 text-green-700' :
                              cat === 'prusa' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </span>
                        ))}
                      </div>
                      {campaignList && (
                        <div className="text-xs text-slate-400 truncate mt-1">
                          Campaigns: {campaignList}
                        </div>
                      )}
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