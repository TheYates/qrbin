"use client"

import { useMemo } from "react"

interface ChartData {
  date: string
  clicks: number
}

interface AnalyticsChartProps {
  data: ChartData[]
  className?: string
}

export function AnalyticsChart({ data, className }: AnalyticsChartProps) {
  const { maxClicks, chartData } = useMemo(() => {
    const maxClicks = Math.max(...data.map((d) => d.clicks), 1)
    const chartData = data.map((d) => ({
      ...d,
      height: (d.clicks / maxClicks) * 100,
    }))
    return { maxClicks, chartData }
  }, [data])

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-end justify-between h-64 gap-1">
        {chartData.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1 group">
            <div className="relative w-full">
              <div
                className="bg-blue-500 hover:bg-blue-600 transition-colors rounded-t w-full min-h-[2px] group-hover:bg-blue-700"
                style={{ height: `${item.height}%` }}
                title={`${item.date}: ${item.clicks} clicks`}
              />
            </div>
            <span className="text-xs text-muted-foreground mt-2 transform -rotate-45 origin-left">
              {new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>0</span>
        <span>{maxClicks} clicks</span>
      </div>
    </div>
  )
}
