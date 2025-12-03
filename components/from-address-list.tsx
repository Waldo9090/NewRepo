"use client"

import { useEffect, useState } from "react"
import { Loader2, Mail } from "lucide-react"

interface FromAddressListProps {
  category: 'roger' | 'reachify' | 'prusa' | 'all'
}

export function FromAddressList({ category }: FromAddressListProps) {
  const [fromAddresses, setFromAddresses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFromAddresses() {
      setLoading(true)
      setError(null)
      
      try {
        const params = new URLSearchParams()
        params.append('category', category)
        params.append('limit', '1000')

        const response = await fetch(`/api/instantly/emails?${params.toString()}`)
        
        if (response.ok) {
          const result = await response.json()
          const emails = result.emails || []
          
          // Extract unique from_address_email values
          const uniqueFromAddresses = new Set<string>()
          
          for (const email of emails) {
            if (email.from_address_email) {
              uniqueFromAddresses.add(email.from_address_email)
            }
          }
          
          const fromAddressList = Array.from(uniqueFromAddresses).sort()
          console.log(`Found ${fromAddressList.length} unique from_address_email addresses`)
          setFromAddresses(fromAddressList)
        }
      } catch (err) {
        console.error('Error fetching from addresses:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch from addresses')
      } finally {
        setLoading(false)
      }
    }

    fetchFromAddresses()
  }, [category])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading from addresses...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-600 font-medium mb-2">Error Loading From Addresses</div>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="w-6 h-6 text-gray-600" />
        <h2 className="text-2xl font-bold text-gray-800">From Address Emails ({fromAddresses.length})</h2>
      </div>

      <div className="space-y-2">
        {fromAddresses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No from addresses found
          </div>
        ) : (
          fromAddresses.map((address, index) => (
            <div 
              key={address}
              className="p-3 bg-gray-50 rounded border text-gray-800 font-mono text-sm"
            >
              {address}
            </div>
          ))
        )}
      </div>
    </div>
  )
}