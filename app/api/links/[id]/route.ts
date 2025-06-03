import { type NextRequest, NextResponse } from "next/server";
import {
  deleteLink,
  getLinkById,
  updateLinkUrl,
  updateQRCode,
} from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const id = Number.parseInt(resolvedParams.id);
    const link = await getLinkById(id);

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.json(link);
  } catch (error) {
    console.error("Failed to fetch link:", error);
    return NextResponse.json(
      { error: "Failed to fetch link" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const id = Number.parseInt(resolvedParams.id);
    await deleteLink(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete link:", error);
    return NextResponse.json(
      { error: "Failed to delete link" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const id = Number.parseInt(resolvedParams.id);
    const { originalUrl, qrConfig } = await request.json();

    if (originalUrl) {
      await updateLinkUrl(id, originalUrl);
    }

    if (qrConfig) {
      await updateQRCode(id, qrConfig);
    }

    const updatedLink = await getLinkById(id);
    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error("Failed to update link:", error);
    return NextResponse.json(
      { error: "Failed to update link" },
      { status: 500 }
    );
  }
}
