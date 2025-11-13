import sharp from "sharp";
import { put, del, list } from "@vercel/blob";
import { UploadResult, UploadOptions, validateFile } from "./file-upload";

/**
 * Uploads image to Vercel Blob Storage (for production/Vercel)
 */
export async function uploadImageToBlob(
  file: File,
  subfolder: string = '',
  options: UploadOptions = {}
): Promise<UploadResult> {
  // Validate file
  const validation = validateFile(file, options);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const opts = {
    maxSize: 20 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    generateThumbnail: true,
    thumbnailWidth: 300,
    thumbnailHeight: 300,
    maxWidth: 3840,
    maxHeight: 2160,
    ...options,
  };

  // Generate filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${timestamp}-${random}.${ext}`;

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Process image with Sharp
  let processedBuffer = buffer;
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const originalFormat = metadata.format;

    // Resize if needed
    if (metadata.width && metadata.height) {
      if (metadata.width > opts.maxWidth || metadata.height > opts.maxHeight) {
        let resized = image.resize(opts.maxWidth, opts.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        });

        if (originalFormat === 'png') {
          processedBuffer = Buffer.from(await resized.png({ quality: 100, compressionLevel: 6 }).toBuffer());
        } else if (originalFormat === 'webp') {
          processedBuffer = Buffer.from(await resized.webp({ quality: 95 }).toBuffer());
        } else {
          processedBuffer = Buffer.from(await resized.jpeg({ quality: 95, mozjpeg: true }).toBuffer());
        }
      } else {
        // Optimize without resizing
        if (originalFormat === 'png') {
          processedBuffer = Buffer.from(await image.png({ quality: 100, compressionLevel: 6 }).toBuffer());
        } else if (originalFormat === 'webp') {
          processedBuffer = Buffer.from(await image.webp({ quality: 95 }).toBuffer());
        } else {
          processedBuffer = Buffer.from(await image.jpeg({ quality: 95, mozjpeg: true }).toBuffer());
        }
      }
    }
  } catch (error) {
    console.error("Sharp processing error, using original buffer:", error);
    processedBuffer = buffer;
  }

  // Upload to Vercel Blob
  const path = subfolder ? `${subfolder}/${filename}` : filename;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN environment variable is not set. Please add it in Vercel project settings.');
  }
  
  const blob = await put(path, processedBuffer, {
    access: 'public',
    contentType: file.type,
    token, // Explicitly pass token
  });

  // Generate thumbnail if needed
  let thumbnailUrl: string | undefined;
  if (opts.generateThumbnail) {
    try {
      const thumbnailBuffer = await sharp(buffer)
        .resize(opts.thumbnailWidth, opts.thumbnailHeight, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer();

      const thumbPath = subfolder ? `${subfolder}/thumbnails/thumb-${filename}` : `thumbnails/thumb-${filename}`;
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      const thumbBlob = await put(thumbPath, thumbnailBuffer, {
        access: 'public',
        contentType: 'image/jpeg',
        token, // Explicitly pass token
      });
      thumbnailUrl = thumbBlob.url;
    } catch (error) {
      console.error("Thumbnail generation error:", error);
    }
  }

  return {
    originalUrl: blob.url,
    thumbnailUrl,
    filename,
  };
}

/**
 * Deletes image from Vercel Blob Storage
 */
export async function deleteImageFromBlob(imageUrl: string, thumbnailUrl?: string): Promise<void> {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    
    // Extract blob URL and delete
    if (imageUrl.startsWith('http')) {
      await del(imageUrl, { token });
    }

    if (thumbnailUrl && thumbnailUrl.startsWith('http')) {
      await del(thumbnailUrl, { token });
    }
  } catch (error) {
    console.error('Error deleting image from blob:', error);
    // Don't throw - deletion failures shouldn't break the flow
  }
}

