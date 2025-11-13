import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  processImageUpload,
  validateImageFile,
  sanitizeInput,
} from "@/lib/image-utils";
import { verifyAdminAuth } from "@/lib/auth-helpers";
import { join } from "path";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

export async function POST(request: NextRequest) {
  try {
    // Verify authentication (supports both database and env var auth)
    const authResult = await verifyAdminAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error || "Unauthorized" },
        { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Admin Area"' } }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("image") as File;
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    if (!title || !category) {
      return NextResponse.json(
        { error: "Title and category are required" },
        { status: 400 }
      );
    }

    // Validate image
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedCategory = sanitizeInput(category);

    if (!prisma) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    // Process and upload image
    const uploadResult = await processImageUpload(file, UPLOAD_DIR);

    // Save to database
    const galleryItem = await prisma.gallery.create({
      data: {
        title: sanitizedTitle,
        category: sanitizedCategory,
        imageUrl: uploadResult.originalUrl,
        thumbnailUrl: uploadResult.thumbnailUrl,
      },
    });

    return NextResponse.json(
      {
        id: galleryItem.id,
        title: galleryItem.title,
        category: galleryItem.category,
        imageUrl: galleryItem.imageUrl,
        thumbnailUrl: galleryItem.thumbnailUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}


