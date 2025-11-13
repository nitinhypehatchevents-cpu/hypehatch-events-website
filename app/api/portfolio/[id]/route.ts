import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/file-upload";
import { join } from "path";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

// DELETE - Delete portfolio image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check Basic Auth
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Admin Area"' } }
      );
    }

    const credentials = Buffer.from(authHeader.slice(6), "base64")
      .toString()
      .split(":");
    const [username, password] = credentials;

    if (
      username !== process.env.ADMIN_USER ||
      password !== process.env.ADMIN_PASS
    ) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const { id } = await params;

    // Find the portfolio item
    const portfolioItem = await prisma.portfolio.findUnique({
      where: { id },
    });

    if (!portfolioItem) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Delete image files if they exist in uploads folder
    if (portfolioItem.imageUrl && portfolioItem.imageUrl.startsWith('/uploads/')) {
      try {
        await deleteImage(
          portfolioItem.imageUrl,
          portfolioItem.thumbnailUrl || undefined,
          UPLOAD_DIR
        );
      } catch (deleteError) {
        console.error("Error deleting image file:", deleteError);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    await prisma.portfolio.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting portfolio item:", error);
    return NextResponse.json(
      { error: "Failed to delete portfolio item" },
      { status: 500 }
    );
  }
}

// PUT - Update portfolio image
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check Basic Auth
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Admin Area"' } }
      );
    }

    const credentials = Buffer.from(authHeader.slice(6), "base64")
      .toString()
      .split(":");
    const [username, password] = credentials;

    if (
      username !== process.env.ADMIN_USER ||
      password !== process.env.ADMIN_PASS
    ) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.portfolio.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating portfolio item:", error);
    return NextResponse.json(
      { error: "Failed to update portfolio item" },
      { status: 500 }
    );
  }
}

