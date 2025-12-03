"use client"

import { useState } from "react"
import { UnifiedCampaignDashboard } from "@/components/unified-campaign-dashboard"
import { Card } from "@/components/ui/card"

export default function UnifiedCampaignsPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'roger' | 'reachify' | 'prusa'>('all')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Unified Campaign Dashboard</h1>
            <p className="text-slate-600 mt-2">Combined analytics across Roger, Reachify, and PRUSA campaigns</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Category Filter */}
            <Card className="p-4 bg-white/60 backdrop-blur-sm border-slate-200 shadow-sm">
              <label className="block text-sm font-medium text-slate-700 mb-2">Campaign Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Campaigns</option>
                <option value="roger">Roger Campaigns</option>
                <option value="reachify">Reachify Campaigns</option>
                <option value="prusa">PRUSA Campaigns</option>
              </select>
            </Card>

            {/* Date Range Filter */}
            <Card className="p-4 bg-white/60 backdrop-blur-sm border-slate-200 shadow-sm">
              <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="End Date"
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Dashboard */}
        <UnifiedCampaignDashboard 
          category={selectedCategory}
          startDate={dateRange.startDate || undefined}
          endDate={dateRange.endDate || undefined}
        />
      </div>
    </div>
  )
}