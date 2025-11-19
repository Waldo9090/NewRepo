'use client'

import { useState } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"

interface MetricControlsProps {
  className?: string
}

export function MetricControls({ className = "" }: MetricControlsProps) {
  const [showControls, setShowControls] = useState(false)
  const [settings, setSettings] = useState({
    showTrends: true,
    showDataPoints: true,
    smoothLines: false,
    showGrid: true
  })

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
      >
        {showControls ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        <span>Metrics Controls</span>
      </button>
      
      {/* Controls Panel */}
      {showControls && (
        <div className="mt-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-sm max-w-md w-full">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showTrends}
                onChange={() => toggleSetting('showTrends')}
                className="rounded border-slate-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-600">Show Trends</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showDataPoints}
                onChange={() => toggleSetting('showDataPoints')}
                className="rounded border-slate-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-600">Data Points</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smoothLines}
                onChange={() => toggleSetting('smoothLines')}
                className="rounded border-slate-300 text-green-600 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              <span className="text-sm text-slate-600">Smooth Lines</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showGrid}
                onChange={() => toggleSetting('showGrid')}
                className="rounded border-slate-300 text-purple-600 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
              <span className="text-sm text-slate-600">Show Grid</span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}