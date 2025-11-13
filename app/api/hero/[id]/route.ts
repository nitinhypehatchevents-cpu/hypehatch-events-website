import { NextRequest } from "next/server";
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
  deleteImage(heroImage.url, undefined, UPLOAD_DIR).catch((err) =>
    console.error("Error deleting image file:", err)
  );

  // Delete from database
  await prisma!.heroImage.delete({ where: { id: imageId } });

  return API_RESPONSES.SUCCESS({ success: true });
});
