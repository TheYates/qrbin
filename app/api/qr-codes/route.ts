import { type NextRequest, NextResponse } from "next/server";
import { createQRCode, getQRCodes } from "@/lib/database";

export async function GET() {
  try {
    const qrCodes = await getQRCodes();
    return NextResponse.json(qrCodes);
  } catch (error) {
    console.error("Failed to fetch QR codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch QR codes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, content, title, description } = await request.json();

    if (!type || !content) {
      return NextResponse.json(
        { error: "Type and content are required" },
        { status: 400 }
      );
    }

    // Validate content based on type
    if (type === "url") {
      try {
        new URL(content);
      } catch {
        return NextResponse.json(
          { error: "Invalid URL format" },
          { status: 400 }
        );
      }
    }

    if (type === "email" && content.includes("mailto:")) {
      const email = content.replace("mailto:", "").split("?")[0];
      if (!email.includes("@")) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
    }

    const qrCode = await createQRCode(type, content, title, description);
    return NextResponse.json(qrCode);
  } catch (error) {
    console.error("Failed to create QR code:", error);
    return NextResponse.json(
      { error: "Failed to create QR code" },
      { status: 500 }
    );
  }
}
