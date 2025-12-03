"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Mail, MessageSquare, MousePointerClick } from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface DailyAnalytics {
  date: string
  sent: number
  contacted: number
  opened: number
  unique_opened: number
  replies: number
  unique_replies: number
  replies_automatic: number
  unique_replies_automatic: number
  clicks: number
  unique_clicks: number
  opportunities: number
  unique_opportunities: number
}

interface CampaignPerformanceChartProps {
  category: 'roger' | 'reachify' | 'prusa' | 'all'
  startDate?: string
  endDate?: string
  campaignId?: string
  workspaceId?: string
}

type MetricType = 'sent' | 'opened' | 'replies' | 'clicks'

const metricConfig = {
  sent: {
    label: 'Emails Sent',
    icon: Mail,
    color: '#3b82f6',
    dataKey: 'sent'
  },
  opened: {
    label: 'Opens',
    icon: Mail,
    color: '#10b981',
    dataKey: 'unique_opened'
  },
  replies: {
    label: 'Replies',
    icon: MessageSquare,
    color: '#f59e0b',
    dataKey: 'unique_replies'
  },
  clicks: {
    label: 'Clicks',
    icon: MousePointerClick,
    color: '#ef4444',
    dataKey: 'unique_clicks'
  }
}

export function CampaignPerformanceChart({ 
  category, 
  startDate, 
  endDate, 
  campaignId, 
  workspaceId 
}: CampaignPerformanceChartProps) {
  const [data, setData] = useState<DailyAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('sent')

  const currentMetric = metricConfig[selectedMetric]

  useEffect(() => {
    async function fetchDailyAnalytics() {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (campaignId) {
          params.append('campaign_id', campaignId)
          if (workspaceId) params.append('workspace_id', workspaceId)
        } else {
          params.append('category', category)
        }
        if (startDate) params.append('start_date', startDate)
        if (endDate) params.append('end_date', endDate)

        const response = await fetch(`/api/instantly/daily-analytics?${params.toString()}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch daily analytics')
        }

        const result = await response.json()
        setData(result.data || [])
      } catch (err) {
        console.error('Error fetching daily analytics:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch daily analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchDailyAnalytics()
  }, [category, startDate, endDate, campaignId, workspaceId])

  // Format data for the chart
  const chartData = data.map(day => {
    const formattedDate = new Date(day.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
    return {
      date: formattedDate,
      value: day[currentMetric.dataKey as keyof DailyAnalytics] || 0,
      fullDate: day.date,
      // Include all data for tooltip
      sent: day.sent,
      opened: day.unique_opened,
      replies: day.unique_replies,
      clicks: day.unique_clicks
    }
  })

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-500" />
            <p className="text-sm text-slate-600">Loading performance data...</p>
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-2">Unable to load performance data</p>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        </div>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <p className="text-sm text-slate-600">No performance data available</p>
            <p className="text-xs text-slate-500 mt-1">
              No campaign data found for the selected period
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">Campaign Performance Overview</h2>
          <p className="text-sm text-slate-600">
            Track your email campaign metrics over time
          </p>
        </div>

        {/* Metric Selection Buttons */}
        <div className="flex gap-2 flex-wrap">
          {Object.entries(metricConfig).map(([key, config]) => {
            const IconComponent = config.icon
            const isSelected = selectedMetric === key
            return (
              <Button
                key={key}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className={`gap-2 ${!isSelected ? 'bg-transparent' : ''}`}
                onClick={() => setSelectedMetric(key as MetricType)}
              >
                <IconComponent className="w-4 h-4" />
                {config.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`color${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-white p-4 border rounded-lg shadow-lg border-slate-200">
                      <p className="text-sm font-medium mb-3 text-slate-800">{label}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-slate-600">Emails Sent:</span>
                          </div>
                          <span className="font-semibold text-sm">{data.sent?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="text-sm text-slate-600">Opens:</span>
                          </div>
                          <span className="font-semibold text-sm">{data.opened?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <span className="text-sm text-slate-600">Replies:</span>
                          </div>
                          <span className="font-semibold text-sm">{data.replies?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-sm text-slate-600">Clicks:</span>
                          </div>
                          <span className="font-semibold text-sm">{data.clicks?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={currentMetric.color}
              strokeWidth={2}
              fill={`url(#color${selectedMetric})`}
              fillOpacity={1}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-4 gap-4 pt-4 border-t border-slate-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-800">
            {data.reduce((sum, d) => sum + d.sent, 0).toLocaleString()}
          </div>
          <div className="text-sm text-slate-600">Total Sent</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-800">
            {data.reduce((sum, d) => sum + d.unique_opened, 0).toLocaleString()}
          </div>
          <div className="text-sm text-slate-600">Total Opens</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-800">
            {data.reduce((sum, d) => sum + d.unique_replies, 0).toLocaleString()}
          </div>
          <div className="text-sm text-slate-600">Total Replies</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-800">
            {data.reduce((sum, d) => sum + d.unique_clicks, 0).toLocaleString()}
          </div>
          <div className="text-sm text-slate-600">Total Clicks</div>
        </div>
      </div>
    </Card>
  )
}