import { type NextRequest, NextResponse } from "next/server";
import { createLink, getLinks, updateQRCode } from "@/lib/database";

export async function GET() {
  try {
    const links = await getLinks();
    return NextResponse.json(links);
  } catch (error) {
    console.error("Failed to fetch links:", error);
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { originalUrl, title, description } = await request.json();

    if (!originalUrl) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(originalUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    const link = await createLink(originalUrl, title, description);
    return NextResponse.json(link);
  } catch (error) {
    console.error("Failed to create link:", error);
    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const {
      id,
      foregroundColor,
      backgroundColor,
      size,
      errorCorrectionLevel,
      logoUrl,
      logoSize,
    } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Link ID is required" },
        { status: 400 }
      );
    }

    const qrConfig = {
      foreground_color: foregroundColor,
      background_color: backgroundColor,
      size,
      error_correction_level: errorCorrectionLevel,
      logo_url: logoUrl,
      logo_size: logoSize,
    };

    const updatedQRCode = await updateQRCode(id, qrConfig);
    return NextResponse.json(updatedQRCode);
  } catch (error) {
    console.error("Failed to update QR code:", error);
    return NextResponse.json(
      { error: "Failed to update QR code" },
      { status: 500 }
    );
  }
}
