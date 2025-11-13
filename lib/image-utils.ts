import sharp from "sharp";
import { unlink } from "fs/promises";
import { join } from "path";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_QUALITY = 85;

export interface ImageUploadResult {
  originalUrl: string;
  thumbnailUrl: string;
  filename: string;
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 2MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
    };
  }

  return { valid: true };
}

export async function processImageUpload(
  file: File,
  uploadDir: string
): Promise<ImageUploadResult> {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const originalFilename = `${timestamp}-${randomString}.webp`;
  const thumbnailFilename = `${timestamp}-${randomString}-thumb.webp`;

  const originalPath = join(uploadDir, "originals", originalFilename);
  const thumbnailPath = join(uploadDir, "thumbnails", thumbnailFilename);

  // Read file buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Process original image (resize if needed, convert to WebP)
  const originalImage = sharp(buffer);
  const originalMetadata = await originalImage.metadata();
  
  // Resize if width > 1920px, maintain aspect ratio
  if (originalMetadata.width && originalMetadata.width > 1920) {
    await originalImage
      .resize(1920, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(originalPath);
  } else {
    await originalImage.webp({ quality: 85 }).toFile(originalPath);
  }

  // Generate thumbnail (400px width, WebP)
  await sharp(buffer)
    .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true })
    .webp({ quality: THUMBNAIL_QUALITY })
    .toFile(thumbnailPath);

  return {
    originalUrl: `/uploads/originals/${originalFilename}`,
    thumbnailUrl: `/uploads/thumbnails/${thumbnailFilename}`,
    filename: originalFilename,
  };
}

export async function deleteImageFiles(
  imageUrl: string,
  thumbnailUrl: string,
  uploadDir: string
): Promise<void> {
  try {
    const imagePath = join(uploadDir, imageUrl.replace("/uploads/", ""));
    const thumbnailPath = join(uploadDir, thumbnailUrl.replace("/uploads/", ""));

    await Promise.all([
      unlink(imagePath).catch(() => {}), // Ignore errors if file doesn't exist
      unlink(thumbnailPath).catch(() => {}),
    ]);
  } catch (error) {
    console.error("Error deleting image files:", error);
    // Don't throw - file deletion failure shouldn't break the API
  }
}

export function sanitizeInput(input: string): string {
  return input.trim().slice(0, 200); // Limit length and trim
}

