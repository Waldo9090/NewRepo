'use client'

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Check } from "lucide-react"

interface LeadStatus {
  id: string
  label: string
  color: string
  icon: string
  iStatus: number | null // Maps to API i_status values
  description: string
}

const DEFAULT_LEAD_STATUSES: LeadStatus[] = [
  { id: 'all', label: 'All Messages', color: 'bg-gray-100 text-gray-800', icon: '📬', iStatus: null, description: 'All email messages' },
  { id: 'unread', label: 'Unread', color: 'bg-blue-100 text-blue-800', icon: '🔵', iStatus: null, description: 'Unread messages' },
  { id: 'interested', label: 'Interested', color: 'bg-green-100 text-green-800', icon: '✨', iStatus: 1, description: 'Positive responses' },
  { id: 'neutral', label: 'Neutral', color: 'bg-yellow-100 text-yellow-800', icon: '➖', iStatus: 0, description: 'Neutral responses' },
  { id: 'not-interested', label: 'Not interested', color: 'bg-red-100 text-red-800', icon: '❌', iStatus: -1, description: 'Negative responses' },
  { id: 'out-of-office', label: 'Out of office', color: 'bg-purple-100 text-purple-800', icon: '🏢', iStatus: -2, description: 'Auto-reply: Out of office' },
  { id: 'bounced', label: 'Bounced', color: 'bg-orange-100 text-orange-800', icon: '⚠️', iStatus: -3, description: 'Email bounced' },
  { id: 'auto-reply', label: 'Auto Reply', color: 'bg-indigo-100 text-indigo-800', icon: '🤖', iStatus: null, description: 'Automated responses' }
]

interface InboxFiltersProps {
  selectedFilters: string[]
  onFiltersChange: (filters: string[]) => void
  className?: string
}

const I_STATUS_FILTERS = ['interested', 'neutral', 'not-interested', 'out-of-office', 'bounced']

export function InboxFilters({ selectedFilters, onFiltersChange, className = '' }: InboxFiltersProps) {
  const [leadStatuses] = useState<LeadStatus[]>(DEFAULT_LEAD_STATUSES)

  const toggleFilter = (statusId: string) => {
    if (selectedFilters.includes(statusId)) {
      // Remove the filter
      onFiltersChange(selectedFilters.filter(id => id !== statusId))
    } else {
      // If this is an i_status filter, remove other i_status filters first (API limitation)
      if (I_STATUS_FILTERS.includes(statusId)) {
        const otherFilters = selectedFilters.filter(id => !I_STATUS_FILTERS.includes(id))
        onFiltersChange([...otherFilters, statusId])
      } else {
        // For non-i_status filters, just add it
        onFiltersChange([...selectedFilters, statusId])
      }
    }
  }

  const isSelected = (statusId: string) => selectedFilters.includes(statusId)

  return (
    <Card className={`p-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-sm ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter by Lead Status</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange([])}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Clear All
          </Button>
        </div>

        <div className="space-y-2">
          {leadStatuses.map((status) => {
            const selected = isSelected(status.id)
            return (
              <button
                key={status.id}
                onClick={() => toggleFilter(status.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                  selected
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-100'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-lg">{status.icon}</span>
                <div className="flex-1 text-left">
                  <span className="text-sm font-medium">{status.label}</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{status.description}</p>
                </div>
                {selected && (
                  <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            )
          })}
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <button className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Create Label</span>
          </button>
        </div>
      </div>
    </Card>
  )
}