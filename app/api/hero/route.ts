import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImage, validateFile } from "@/lib/file-upload";
import { join } from "path";
import { z } from "zod";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "hero");
const MAX_HERO_IMAGES = 5;

// GET - Fetch all hero images
export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({ images: [] }, { status: 200 });
    }

    const images = await prisma.heroImage.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ images }, { status: 200 });
  } catch (error) {
    console.error("Error fetching hero images:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero images" },
      { status: 500 }
    );
  }
}

// POST - Upload new hero image
export async function POST(request: NextRequest) {
  try {
    // Check Basic Auth
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Admin Area"' } }
      );
    }

    // Verify admin authentication (supports both database and env vars)
    const { verifyAdminAuth } = await import("@/lib/auth-helpers");
    const authResult = await verifyAdminAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error || "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    // Check current count
    const currentCount = await prisma.heroImage.count();
    if (currentCount >= MAX_HERO_IMAGES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_HERO_IMAGES} hero images allowed. Please delete one first.` },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate file (4MB limit - Vercel serverless function request body limit is 4.5MB)
    const validation = validateFile(file, {
      maxSize: 4 * 1024 * 1024, // 4MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Upload image (preserve quality, allow up to 4K)
    const uploadResult = await uploadImage(
      file,
      join(process.cwd(), "public", "uploads"),
      "hero",
      {
        generateThumbnail: false, // No thumbnails for hero images
        maxWidth: 3840, // 4K width
        maxHeight: 2160, // 4K height
      }
    );

    // Save to database
    const heroImage = await prisma.heroImage.create({
      data: {
        url: uploadResult.originalUrl,
      },
    });

    return NextResponse.json(heroImage, { status: 201 });
  } catch (error) {
    console.error("Error uploading hero image:", error);
    return NextResponse.json(
      { error: "Failed to upload hero image" },
      { status: 500 }
    );
  }
}


