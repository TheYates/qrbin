import { type NextRequest, NextResponse } from "next/server";
import { getLinkByShortCode, incrementClickCount } from "@/lib/database";
import { recordClick } from "@/lib/analytics";

export async function GET(
  request: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    const { shortCode } = params;
    const link = await getLinkByShortCode(shortCode);

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Record click analytics
    const userAgent = request.headers.get("user-agent") || undefined;
    const referrer = request.headers.get("referer") || undefined;
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : realIp || "unknown";

    await Promise.all([
      incrementClickCount(link.id),
      recordClick(link.id, userAgent, referrer, ipAddress),
    ]);

    // Redirect to original URL
    return NextResponse.redirect(link.original_url);
  } catch (error) {
    console.error("Failed to redirect:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
