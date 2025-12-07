"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MetricCards } from "@/components/metric-cards"
import { PerformanceChart } from "@/components/performance-chart"
import { CampaignFilter } from "@/components/campaign-filter"
import { WorkspaceFilter } from "@/components/workspace-filter"
import { DateRangeFilter, type DateRange } from "@/components/date-range-filter"
import { MetricControls } from "@/components/metric-controls"
import { BarChart3 } from "lucide-react"

export function OverviewDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null)
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>('30')

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1">
        <DashboardHeader />

        <main className="p-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="mb-3">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Overview</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                {selectedCampaignId || selectedWorkspaceId 
                  ? `${selectedCampaignId ? 'Campaign' : ''}${selectedCampaignId && selectedWorkspaceId ? ' & ' : ''}${selectedWorkspaceId ? 'Workspace' : ''}-specific insights` 
                  : 'Combined campaign overview and performance insights'}
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center gap-4 mb-8 flex-wrap">
            <DateRangeFilter 
              selectedRange={selectedDateRange}
              onRangeChange={setSelectedDateRange}
            />

            <CampaignFilter 
              selectedCampaignId={selectedCampaignId}
              onCampaignChange={setSelectedCampaignId}
              workspaceId={selectedWorkspaceId}
            />

            <WorkspaceFilter 
              selectedWorkspaceId={selectedWorkspaceId}
              onWorkspaceChange={setSelectedWorkspaceId}
            />
          </div>

          {/* Active Filters */}
          {(selectedCampaignId || selectedWorkspaceId) && (
            <div className="mb-8">
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium bg-indigo-50/50 dark:bg-indigo-900/20 px-4 py-3 rounded-xl border border-indigo-100 dark:border-indigo-800">
                Showing data for {selectedCampaignId && 'selected campaign'}{selectedCampaignId && selectedWorkspaceId && ' and '}{selectedWorkspaceId && 'selected workspace'}
              </p>
            </div>
          )}

          {/* Metric Cards - Key Performance Indicators */}
          <MetricCards campaignId={selectedCampaignId} workspaceId={selectedWorkspaceId} dateRange={selectedDateRange} />

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setSelectedTab("overview")}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                selectedTab === "overview"
                  ? "bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50"
              }`}
            >
              Performance Overview
            </button>
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            <PerformanceChart campaignId={selectedCampaignId} workspaceId={selectedWorkspaceId} dateRange={selectedDateRange} />
            <MetricControls className="mt-6" />
          </div>
        </main>
      </div>
    </div>
  )
}