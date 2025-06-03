import { NextResponse } from "next/server"
import { getAnalytics } from "@/lib/analytics"

export async function GET() {
  try {
    const analytics = await getAnalytics()
    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
