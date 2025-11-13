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
    maxSize: 4 * 1024 * 1024, // 4MB (Vercel serverless function limit is 4.5MB for request body)
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

  // Process image with Sharp - strip EXIF orientation to prevent auto-rotation, scale to fit, preserve quality
  let processedBuffer = buffer;
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const originalFormat = metadata.format;

    // Apply EXIF orientation to pixel data and remove EXIF tag - prevents browser auto-rotation
    // This physically rotates the image pixels if needed, then removes EXIF so browser won't rotate again
    let processedImage = image.rotate(); // Auto-applies EXIF rotation to pixels, then removes EXIF tag

    // Resize if needed - scale to fit max dimensions without rotation
    if (metadata.width && metadata.height) {
      if (metadata.width > opts.maxWidth || metadata.height > opts.maxHeight) {
        let resized = processedImage.resize(opts.maxWidth, opts.maxHeight, {
          fit: 'inside', // Scale to fit within dimensions, maintain aspect ratio
          withoutEnlargement: true, // Don't enlarge smaller images
        });

        // Preserve original format with high quality
        if (originalFormat === 'png') {
          processedBuffer = Buffer.from(await resized.png({ quality: 100, compressionLevel: 6 }).toBuffer());
        } else if (originalFormat === 'webp') {
          processedBuffer = Buffer.from(await resized.webp({ quality: 95 }).toBuffer());
        } else {
          processedBuffer = Buffer.from(await resized.jpeg({ quality: 95, mozjpeg: true }).toBuffer());
        }
      } else {
        // Image is within size limits - optimize without resizing, preserve format and quality
        if (originalFormat === 'png') {
          processedBuffer = Buffer.from(await processedImage.png({ quality: 100, compressionLevel: 6 }).toBuffer());
        } else if (originalFormat === 'webp') {
          processedBuffer = Buffer.from(await processedImage.webp({ quality: 95 }).toBuffer());
        } else {
          processedBuffer = Buffer.from(await processedImage.jpeg({ quality: 95, mozjpeg: true }).toBuffer());
        }
      }
    } else {
      // No dimensions available - strip EXIF and preserve original with high quality
      if (originalFormat === 'png') {
        processedBuffer = Buffer.from(await processedImage.png({ quality: 100, compressionLevel: 6 }).toBuffer());
      } else if (originalFormat === 'webp') {
        processedBuffer = Buffer.from(await processedImage.webp({ quality: 95 }).toBuffer());
      } else {
        processedBuffer = Buffer.from(await processedImage.jpeg({ quality: 95, mozjpeg: true }).toBuffer());
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
    const error = 'BLOB_READ_WRITE_TOKEN environment variable is not set. Please add it in Vercel project settings.';
    console.error(error);
    throw new Error(error);
  }
  
  console.log('Uploading to Vercel Blob:', {
    path,
    size: processedBuffer.length,
    contentType: file.type,
    hasToken: !!token
  });

  let blob;
  try {
    blob = await put(path, processedBuffer, {
      access: 'public',
      contentType: file.type,
      token, // Explicitly pass token
    });
    console.log('Blob upload successful:', blob.url);
  } catch (blobError: any) {
    console.error('Vercel Blob upload failed:', {
      message: blobError?.message,
      name: blobError?.name,
      code: blobError?.code,
      statusCode: blobError?.statusCode,
      stack: blobError?.stack
    });
    throw new Error(`Vercel Blob upload failed: ${blobError?.message || "Unknown error"}`);
  }

  // Generate thumbnail if needed
  let thumbnailUrl: string | undefined;
  if (opts.generateThumbnail) {
    try {
      console.log('Generating thumbnail...');
      const thumbnailBuffer = await sharp(buffer)
        .rotate() // Apply EXIF rotation to pixels, then remove EXIF tag to prevent browser auto-rotation
        .resize(opts.thumbnailWidth, opts.thumbnailHeight, {
          fit: 'cover', // Scale to cover thumbnail area, maintain aspect ratio
          position: 'center',
        })
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer();

      const thumbPath = subfolder ? `${subfolder}/thumbnails/thumb-${filename}` : `thumbnails/thumb-${filename}`;
      console.log('Uploading thumbnail to Vercel Blob:', thumbPath);
      const thumbBlob = await put(thumbPath, thumbnailBuffer, {
        access: 'public',
        contentType: 'image/jpeg',
        token, // Use same token
      });
      thumbnailUrl = thumbBlob.url;
      console.log('Thumbnail upload successful:', thumbnailUrl);
    } catch (error: any) {
      console.error("Thumbnail generation/upload error:", {
        message: error?.message,
        name: error?.name,
        code: error?.code,
        stack: error?.stack
      });
      // Don't throw - thumbnail is optional
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
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  
  if (!token) {
    const error = 'BLOB_READ_WRITE_TOKEN environment variable is not set';
    console.error(error);
    throw new Error(error);
  }
  
  console.log('deleteImageFromBlob called with:', { imageUrl, thumbnailUrl, hasToken: !!token });
  
  const errors: string[] = [];
  
  // Delete main image if it's a blob URL
  if (imageUrl && imageUrl.startsWith('http')) {
    try {
      console.log('Attempting to delete blob with URL:', imageUrl);
      console.log('Token length:', token.length);
      
      // Try with explicit token
      await del(imageUrl, { token });
      console.log('✅ Successfully deleted blob:', imageUrl);
    } catch (error: any) {
      const errorDetails = {
        message: error?.message || String(error),
        name: error?.name,
        code: error?.code,
        statusCode: error?.statusCode,
        stack: error?.stack,
      };
      
      // If blob doesn't exist (404), treat as success (already deleted)
      if (errorDetails.statusCode === 404 || errorDetails.message?.includes('404') || errorDetails.message?.includes('not found')) {
        console.log('✅ Blob already deleted or not found (404):', imageUrl);
        // Don't add to errors - this is fine
      } else {
        console.error('❌ Error deleting main image from blob:', JSON.stringify(errorDetails, null, 2));
        const errorMsg = `Failed to delete main image: ${errorDetails.message}`;
        errors.push(errorMsg);
      
        // Try without explicit token (let SDK use env var)
        try {
          console.log('Retrying delete without explicit token...');
          await del(imageUrl);
          console.log('✅ Successfully deleted blob (without explicit token):', imageUrl);
          // If retry succeeds, clear the error
          errors.pop();
        } catch (retryError: any) {
          const retryDetails = {
            message: retryError?.message || String(retryError),
            name: retryError?.name,
            code: retryError?.code,
            statusCode: retryError?.statusCode,
          };
          
          // If blob doesn't exist (404), treat as success
          if (retryDetails.statusCode === 404 || retryDetails.message?.includes('404') || retryDetails.message?.includes('not found')) {
            console.log('✅ Blob already deleted or not found (404) on retry:', imageUrl);
            // Clear the error
            errors.pop();
          } else {
            console.error('❌ Retry also failed:', JSON.stringify(retryDetails, null, 2));
            const retryMsg = `Retry also failed: ${retryDetails.message}`;
            errors.push(retryMsg);
          }
        }
      }
    }
  } else if (imageUrl) {
    const warning = `Image URL is not a blob URL (does not start with http): ${imageUrl}`;
    console.warn('⚠️', warning);
    errors.push(warning);
  } else {
    console.warn('⚠️ No image URL provided for deletion');
  }

  // Delete thumbnail if it's a blob URL
  if (thumbnailUrl && thumbnailUrl.startsWith('http')) {
    try {
      console.log('Attempting to delete thumbnail:', thumbnailUrl);
      await del(thumbnailUrl, { token });
      console.log('✅ Successfully deleted thumbnail blob:', thumbnailUrl);
    } catch (error: any) {
      const errorMsg = `Failed to delete thumbnail: ${error?.message || error}`;
      console.error('⚠️ Error deleting thumbnail from blob (non-critical):', errorMsg);
      // Don't add to errors array - thumbnail deletion failure is not critical
    }
  }
  
  // If main image deletion failed, throw error
  if (errors.length > 0 && errors.some(e => e.includes('Failed to delete main image') || e.includes('Retry also failed'))) {
    const finalError = errors.join('; ');
    console.error('❌ Final deletion error:', finalError);
    throw new Error(finalError);
  }
  
  console.log('✅ deleteImageFromBlob completed successfully');
}

