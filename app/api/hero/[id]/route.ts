import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/file-upload";
import { join } from "path";
import { withAuth, getRouteParams, API_RESPONSES } from "@/lib/api-helpers";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

// DELETE - Delete hero image
export const DELETE = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await getRouteParams(params);
  const imageId = parseInt(id);
  
  if (isNaN(imageId)) {
    return API_RESPONSES.BAD_REQUEST("Invalid image ID");
  }

  // Find the hero image
  const heroImage = await prisma!.heroImage.findUnique({
    where: { id: imageId },
  });

  if (!heroImage) {
    return API_RESPONSES.NOT_FOUND("Image not found");
  }

  // Delete image file (handles both blob URLs and local filesystem paths)
  let fileDeleteError: string | null = null;
  try {
    await deleteImage(heroImage.url, undefined, UPLOAD_DIR);
  } catch (deleteError: any) {
    const errorMsg = deleteError?.message || String(deleteError);
    console.error("Error deleting image file:", errorMsg);
    fileDeleteError = errorMsg;
    // On Vercel, blob deletion failure should prevent database deletion
    if (process.env.VERCEL === '1' || process.env.VERCEL_ENV) {
      return NextResponse.json(
        { 
          error: "Failed to delete image from storage",
          details: errorMsg
        },
        { status: 500 }
      );
    }
  }

  // Delete from database
  await prisma!.heroImage.delete({ where: { id: imageId } });

  if (fileDeleteError && !process.env.VERCEL) {
    console.warn("Database record deleted but file deletion failed:", fileDeleteError);
  }

  return API_RESPONSES.SUCCESS({ success: true });
});
