import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteImageFiles } from "@/lib/image-utils";
import { verifyAdminAuth } from "@/lib/auth-helpers";
import { join } from "path";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

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

    // Find the gallery item
    const galleryItem = await prisma.gallery.findUnique({
      where: { id },
    });

    if (!galleryItem) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Delete image files
    await deleteImageFiles(
      galleryItem.imageUrl,
      galleryItem.thumbnailUrl,
      UPLOAD_DIR
    );

    // Delete from database
    await prisma.gallery.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}


