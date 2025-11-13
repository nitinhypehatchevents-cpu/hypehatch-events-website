import sharp from "sharp";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Check if we're on Vercel (production)
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

export interface UploadResult {
  originalUrl: string;
  thumbnailUrl?: string;
  filename: string;
}

export interface UploadOptions {
  maxSize?: number; // in bytes, default 2MB
  allowedTypes?: string[]; // default: ['image/jpeg', 'image/png', 'image/webp']
  generateThumbnail?: boolean;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

const DEFAULT_OPTIONS: Required<UploadOptions> = {
  maxSize: 20 * 1024 * 1024, // 20MB (increased from 2MB)
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  generateThumbnail: true,
  thumbnailWidth: 300,
  thumbnailHeight: 300,
  maxWidth: 3840, // 4K width (increased from 1920)
  maxHeight: 2160, // 4K height (increased from 1080)
};

/**
 * Validates file before upload
 */
export function validateFile(file: File, options: UploadOptions = {}): { valid: boolean; error?: string } {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Check file type
  if (!opts.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${opts.allowedTypes.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > opts.maxSize) {
    const maxSizeMB = opts.maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  return { valid: true };
}

/**
 * Generates a unique filename
 */
function generateFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = originalName.split('.').pop() || 'jpg';
  return `${timestamp}-${random}.${ext}`;
}

/**
 * Processes and uploads an image file with optional thumbnail generation
 * Uses Vercel Blob on Vercel, filesystem locally
 */
export async function uploadImage(
  file: File,
  uploadDir: string,
  subfolder: string = '',
  options: UploadOptions = {}
): Promise<UploadResult> {
  // Use Vercel Blob on Vercel
  if (isVercel) {
    const { uploadImageToBlob } = await import('./file-upload-blob');
    return uploadImageToBlob(file, subfolder, options);
  }

  // Use filesystem locally
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Validate file
  const validation = validateFile(file, options);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Create directories
  const fullUploadDir = join(uploadDir, subfolder);
  const thumbnailDir = opts.generateThumbnail ? join(uploadDir, subfolder, 'thumbnails') : null;

  if (!existsSync(fullUploadDir)) {
    await mkdir(fullUploadDir, { recursive: true });
  }

  if (thumbnailDir && !existsSync(thumbnailDir)) {
    await mkdir(thumbnailDir, { recursive: true });
  }

  // Generate filename
  const filename = generateFilename(file.name);
  const filePath = join(fullUploadDir, filename);

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Process image with Sharp (resize if needed, preserve quality and format)
  let processedBuffer = buffer;
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const originalFormat = metadata.format; // jpeg, png, webp

    // Resize if image is larger than max dimensions
    if (metadata.width && metadata.height) {
      if (metadata.width > opts.maxWidth || metadata.height > opts.maxHeight) {
        // Resize but preserve original format and high quality
        let resized = image.resize(opts.maxWidth, opts.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        });

        // Preserve original format with high quality
        if (originalFormat === 'png') {
          processedBuffer = Buffer.from(await resized.png({ quality: 100, compressionLevel: 6 }).toBuffer());
        } else if (originalFormat === 'webp') {
          processedBuffer = Buffer.from(await resized.webp({ quality: 95 }).toBuffer());
        } else {
          // JPEG - use high quality
          processedBuffer = Buffer.from(await resized.jpeg({ quality: 95, mozjpeg: true }).toBuffer());
        }
      } else {
        // Image is within size limits - optimize without resizing, preserve format
        if (originalFormat === 'png') {
          processedBuffer = Buffer.from(await image.png({ quality: 100, compressionLevel: 6 }).toBuffer());
        } else if (originalFormat === 'webp') {
          processedBuffer = Buffer.from(await image.webp({ quality: 95 }).toBuffer());
        } else {
          // JPEG - optimize with high quality
          processedBuffer = Buffer.from(await image.jpeg({ quality: 95, mozjpeg: true }).toBuffer());
        }
      }
    } else {
      // No dimensions available, use original
      processedBuffer = buffer;
    }
  } catch (error) {
    console.error("Sharp processing error, using original buffer:", error);
    // Use original buffer if Sharp fails
    processedBuffer = buffer;
  }

  // Save original/processed image
  await writeFile(filePath, processedBuffer);

  // Generate thumbnail in parallel with main image save (faster)
  let thumbnailUrl: string | undefined;
  const thumbnailPromise = opts.generateThumbnail && thumbnailDir
    ? (async () => {
        try {
          const thumbnailFilename = `thumb-${filename}`;
          const thumbnailPath = join(thumbnailDir, thumbnailFilename);

          const thumbnailBuffer = await sharp(buffer)
            .resize(opts.thumbnailWidth, opts.thumbnailHeight, {
              fit: 'cover',
              position: 'center',
            })
            .jpeg({ quality: 80, mozjpeg: true })
            .toBuffer();

          await writeFile(thumbnailPath, thumbnailBuffer);
          return `/uploads/${subfolder}/thumbnails/${thumbnailFilename}`;
        } catch (error) {
          console.error("Thumbnail generation error:", error);
          return undefined;
        }
      })()
    : Promise.resolve(undefined);

  // Wait for both to complete
  thumbnailUrl = await thumbnailPromise;

  // Return URLs (relative to public folder)
  const originalUrl = `/uploads/${subfolder}/${filename}`;

  return {
    originalUrl,
    thumbnailUrl,
    filename,
  };
}

/**
 * Deletes an image file and its thumbnail
 * Uses Vercel Blob on Vercel, filesystem locally
 */
export async function deleteImage(
  imageUrl: string,
  thumbnailUrl: string | undefined,
  uploadDir: string
): Promise<void> {
  // Use Vercel Blob on Vercel
  if (isVercel) {
    const { deleteImageFromBlob } = await import('./file-upload-blob');
    return deleteImageFromBlob(imageUrl, thumbnailUrl);
  }

  // Use filesystem locally
  try {
    // Extract filename from URL (handles both /uploads/hero/filename.jpg and just filename.jpg)
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    if (filename) {
      // Try direct path first
      let filePath = join(uploadDir, filename);
      if (existsSync(filePath)) {
        await unlink(filePath);
      } else {
        // Try with subfolder extraction (e.g., /uploads/hero/filename.jpg)
        const subfolderIndex = urlParts.indexOf('uploads');
        if (subfolderIndex !== -1 && urlParts.length > subfolderIndex + 2) {
          const subfolder = urlParts[subfolderIndex + 1];
          filePath = join(uploadDir, subfolder, filename);
          if (existsSync(filePath)) {
            await unlink(filePath);
          }
        }
      }
    }

    // Delete thumbnail if exists
    if (thumbnailUrl) {
      const thumbUrlParts = thumbnailUrl.split('/');
      const thumbFilename = thumbUrlParts[thumbUrlParts.length - 1];
      
      if (thumbFilename) {
        // Try direct path first
        let thumbPath = join(uploadDir, 'thumbnails', thumbFilename);
        if (existsSync(thumbPath)) {
          await unlink(thumbPath);
        } else {
          // Try with subfolder extraction
          const thumbSubfolderIndex = thumbUrlParts.indexOf('uploads');
          if (thumbSubfolderIndex !== -1 && thumbUrlParts.length > thumbSubfolderIndex + 3) {
            const thumbSubfolder = thumbUrlParts[thumbSubfolderIndex + 1];
            thumbPath = join(uploadDir, thumbSubfolder, 'thumbnails', thumbFilename);
            if (existsSync(thumbPath)) {
              await unlink(thumbPath);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error deleting image file:', error);
    throw error; // Re-throw so caller knows deletion failed
  }
}

/**
 * Deletes multiple image files
 */
export async function deleteImages(
  imageUrls: string[],
  uploadDir: string
): Promise<void> {
  await Promise.all(
    imageUrls.map((url) => deleteImage(url, undefined, uploadDir))
  );
}


