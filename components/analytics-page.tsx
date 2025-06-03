"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AnalyticsChart } from "./analytics-chart"
import { BarChart, TrendingUp, Link, Eye, Clock, ExternalLink, AlertCircle } from "lucide-react"

interface AnalyticsData {
  totalLinks: number
  totalClicks: number
  topLinks: Array<{
    id: number
    title: string
    short_code: string
    click_count: number
    original_url: string
  }>
  clicksOverTime: Array<{
    date: string
    clicks: number
  }>
  recentClicks: Array<{
    id: number
    link_title: string
    short_code: string
    clicked_at: string
    user_agent: string
    referrer: string
  }>
}

export function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setError(null)
      const response = await fetch("/api/analytics")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to fetch analytics")
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
      setError(error instanceof Error ? error.message : "Failed to load analytics")
    } finally {
      setIsLoading(false)
    }
  }

  const getShortUrl = (shortCode: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/${shortCode}`
    }
    return `/${shortCode}`
  }

  const formatUserAgent = (userAgent: string) => {
    if (!userAgent || userAgent === "Unknown") return "Unknown"
    if (userAgent.includes("Chrome")) return "Chrome"
    if (userAgent.includes("Firefox")) return "Firefox"
    if (userAgent.includes("Safari")) return "Safari"
    if (userAgent.includes("Edge")) return "Edge"
    return "Other"
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center text-muted-foreground">No analytics data available</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Track your link performance and engagement</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Links</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalLinks}</div>
            <p className="text-xs text-muted-foreground">Active shortened links</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalClicks}</div>
            <p className="text-xs text-muted-foreground">All-time clicks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Clicks/Link</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalLinks > 0 ? Math.round(analytics.totalClicks / analytics.totalLinks) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Average engagement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.recentClicks.length}</div>
            <p className="text-xs text-muted-foreground">Recent clicks</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clicks Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Clicks Over Time
            </CardTitle>
            <CardDescription>Daily clicks for the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.clicksOverTime.length > 0 ? (
              <AnalyticsChart data={analytics.clicksOverTime} />
            ) : (
              <div className="text-center text-muted-foreground py-8">No click data available yet</div>
            )}
          </CardContent>
        </Card>

        {/* Top Performing Links */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Links</CardTitle>
            <CardDescription>Your most clicked links</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topLinks.length > 0 ? (
                analytics.topLinks.slice(0, 5).map((link, index) => (
                  <div key={link.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                        <h4 className="font-medium truncate">{link.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">{getShortUrl(link.short_code)}</code>
                        <a
                          href={link.original_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline truncate max-w-48"
                        >
                          {link.original_url}
                        </a>
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                    <Badge variant="secondary">{link.click_count} clicks</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">No links created yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest clicks on your links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentClicks.length > 0 ? (
              analytics.recentClicks.map((click) => (
                <div key={click.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{click.link_title}</h4>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">/{click.short_code}</code>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{new Date(click.clicked_at).toLocaleString()}</span>
                      <span>{formatUserAgent(click.user_agent)}</span>
                      <span>{click.referrer !== "Direct" ? click.referrer : "Direct visit"}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">No recent activity</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
