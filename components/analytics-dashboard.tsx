"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MetricCards } from "@/components/metric-cards"
import { PerformanceChart } from "@/components/performance-chart"
import { CampaignFilter } from "@/components/campaign-filter"
import { WorkspaceFilter } from "@/components/workspace-filter"
import { CampaignBreakdown } from "@/components/campaign-breakdown"
import { CampaignMessages } from "@/components/campaign-messages"
import { CampaignLeads } from "@/components/campaign-leads"
import { SimpleEmailInbox } from "@/components/simple-email-inbox"
import { DateRangeFilter, type DateRange } from "@/components/date-range-filter"
import { MetricControls } from "@/components/metric-controls"
import { TrendingUp, Mail, User, Inbox } from "lucide-react"

export function AnalyticsDashboard() {
  const [selectedTab, setSelectedTab] = useState("charts")
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
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Analytics</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                {selectedCampaignId || selectedWorkspaceId 
                  ? `${selectedCampaignId ? 'Campaign' : ''}${selectedCampaignId && selectedWorkspaceId ? ' & ' : ''}${selectedWorkspaceId ? 'Workspace' : ''}-specific insights` 
                  : 'Comprehensive performance insights'}
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

          {/* Metric Cards */}
          <MetricCards campaignId={selectedCampaignId} workspaceId={selectedWorkspaceId} dateRange={selectedDateRange} />

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setSelectedTab("charts")}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                selectedTab === "charts"
                  ? "bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50"
              }`}
            >
              Charts & Trends
            </button>
            <button
              onClick={() => setSelectedTab("breakdown")}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                selectedTab === "breakdown"
                  ? "bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50"
              }`}
            >
              Campaign Breakdown
            </button>
            <button
              onClick={() => setSelectedTab("messages")}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                selectedTab === "messages"
                  ? "bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <Mail className="w-4 h-4" />
              Campaign Messages
            </button>
            <button
              onClick={() => setSelectedTab("leads")}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                selectedTab === "leads"
                  ? "bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <User className="w-4 h-4" />
              Leads
            </button>
            <button
              onClick={() => setSelectedTab("inbox")}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                selectedTab === "inbox"
                  ? "bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <Inbox className="w-4 h-4" />
              Inbox
            </button>
          </div>

          {/* Content Sections */}
          {selectedTab === "charts" && (
            <div className="space-y-6">
              <PerformanceChart campaignId={selectedCampaignId} workspaceId={selectedWorkspaceId} dateRange={selectedDateRange} />
              <MetricControls className="mt-6" />
            </div>
          )}
          {selectedTab === "breakdown" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div>
                  <CampaignBreakdown campaignId={selectedCampaignId} workspaceId={selectedWorkspaceId} dateRange={selectedDateRange} />
                </div>
                <div>
                  <div className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Campaign Messages</h3>
                    {selectedCampaignId ? (
                      <CampaignMessages 
                        campaignId={selectedCampaignId}
                        workspaceId={selectedWorkspaceId}
                      />
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-slate-500">
                          <Mail className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                          <h3 className="text-lg font-medium text-slate-800 mb-2">Select a Campaign</h3>
                          <p className="text-sm text-slate-600">
                            Choose a specific campaign to view its email messages and sequences.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <MetricControls className="mt-6" />
            </div>
          )}
          {selectedTab === "messages" && (
            <div className="space-y-6">
              {selectedCampaignId ? (
                <CampaignMessages 
                  campaignId={selectedCampaignId}
                  workspaceId={selectedWorkspaceId}
                />
              ) : (
                <div className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl p-12 shadow-sm text-center">
                  <div className="text-slate-500">
                    <Mail className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-medium text-slate-800 mb-2">Select a Campaign</h3>
                    <p className="text-sm text-slate-600">
                      Choose a specific campaign to view its email messages and sequences.
                    </p>
                  </div>
                </div>
              )}
              <MetricControls className="mt-6" />
            </div>
          )}
          {selectedTab === "leads" && (
            <div className="space-y-6">
              {selectedCampaignId ? (
                <CampaignLeads 
                  campaignId={selectedCampaignId}
                  workspaceId={selectedWorkspaceId}
                />
              ) : (
                <div className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl p-12 shadow-sm text-center">
                  <div className="text-slate-500">
                    <User className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-medium text-slate-800 mb-2">Select a Campaign</h3>
                    <p className="text-sm text-slate-600">
                      Choose a specific campaign to view its leads and their interest status.
                    </p>
                  </div>
                </div>
              )}
              <MetricControls className="mt-6" />
            </div>
          )}
          {selectedTab === "inbox" && (
            <div className="space-y-6">
              <SimpleEmailInbox 
                campaignId={selectedCampaignId}
                workspaceId={selectedWorkspaceId}
              />
              <MetricControls className="mt-6" />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}