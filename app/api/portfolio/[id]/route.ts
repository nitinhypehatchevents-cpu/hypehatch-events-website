import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/file-upload";
import { verifyAdminAuth } from "@/lib/auth-helpers";
import { join } from "path";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

// DELETE - Delete portfolio image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication (supports both database and env var auth)
    const authResult = await verifyAdminAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error || "Unauthorized" },
        { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Admin Area"' } }
      );
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

    // Delete image files (handles both blob URLs and local filesystem paths)
    let fileDeleteError: string | null = null;
    if (portfolioItem.imageUrl) {
      try {
        console.log('Attempting to delete image:', portfolioItem.imageUrl);
        console.log('Thumbnail URL:', portfolioItem.thumbnailUrl);
        await deleteImage(
          portfolioItem.imageUrl,
          portfolioItem.thumbnailUrl || undefined,
          UPLOAD_DIR
        );
        console.log('Image file deleted successfully');
      } catch (deleteError: any) {
        const errorMsg = deleteError?.message || String(deleteError);
        console.error("Error deleting image file:", errorMsg);
        fileDeleteError = errorMsg;
        // On Vercel, blob deletion failure should prevent database deletion
        // On local, we can continue (filesystem might not exist)
        if (process.env.VERCEL === '1' || process.env.VERCEL_ENV) {
          return NextResponse.json(
            { 
              error: "Failed to delete image from storage",
              details: errorMsg
            },
            { status: 500 }
          );
        }
        // On local, continue but log the error
      }
    }

    // Delete from database
    await prisma.portfolio.delete({
      where: { id },
    });

    // If there was a file deletion error on local, warn but don't fail
    if (fileDeleteError && !process.env.VERCEL) {
      console.warn("Database record deleted but file deletion failed:", fileDeleteError);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting portfolio item:", error);
    const errorMessage = error?.message || "Failed to delete portfolio item";
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error?.stack : undefined
      },
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

