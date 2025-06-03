import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface AnalyticsData {
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

export async function getAnalytics(): Promise<AnalyticsData> {
  try {
    // Get total stats
    const totalStats = await sql`
      SELECT 
        COUNT(*)::int as total_links,
        COALESCE(SUM(click_count), 0)::int as total_clicks
      FROM links 
      WHERE is_active = true
    `

    // Get top performing links
    const topLinks = await sql`
      SELECT id, title, short_code, click_count, original_url
      FROM links 
      WHERE is_active = true 
      ORDER BY click_count DESC 
      LIMIT 10
    `

    // Get clicks over time (last 30 days) - simplified query
    const clicksOverTime = await sql`
      SELECT 
        DATE(clicked_at)::text as date,
        COUNT(*)::int as clicks
      FROM clicks 
      WHERE clicked_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(clicked_at)
      ORDER BY date
    `

    // Get recent clicks
    const recentClicks = await sql`
      SELECT 
        c.id,
        COALESCE(l.title, 'Untitled Link') as link_title,
        l.short_code,
        c.clicked_at::text,
        COALESCE(c.user_agent, 'Unknown') as user_agent,
        COALESCE(c.referrer, 'Direct') as referrer
      FROM clicks c
      JOIN links l ON c.link_id = l.id
      ORDER BY c.clicked_at DESC
      LIMIT 20
    `

    return {
      totalLinks: totalStats[0]?.total_links || 0,
      totalClicks: totalStats[0]?.total_clicks || 0,
      topLinks: topLinks.map((link: any) => ({
        id: link.id,
        title: link.title || "Untitled Link",
        short_code: link.short_code,
        click_count: link.click_count || 0,
        original_url: link.original_url,
      })),
      clicksOverTime: clicksOverTime.map((item: any) => ({
        date: item.date,
        clicks: item.clicks,
      })),
      recentClicks: recentClicks.map((click: any) => ({
        id: click.id,
        link_title: click.link_title,
        short_code: click.short_code,
        clicked_at: click.clicked_at,
        user_agent: click.user_agent,
        referrer: click.referrer,
      })),
    }
  } catch (error) {
    console.error("Analytics query error:", error)
    // Return empty data structure on error
    return {
      totalLinks: 0,
      totalClicks: 0,
      topLinks: [],
      clicksOverTime: [],
      recentClicks: [],
    }
  }
}

export async function recordClick(linkId: number, userAgent?: string, referrer?: string, ipAddress?: string) {
  try {
    await sql`
      INSERT INTO clicks (link_id, user_agent, referrer, ip_address)
      VALUES (${linkId}, ${userAgent || null}, ${referrer || null}, ${ipAddress || null})
    `
  } catch (error) {
    console.error("Failed to record click:", error)
  }
}
