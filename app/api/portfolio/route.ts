import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImage, validateFile } from "@/lib/file-upload";
import { portfolioUploadSchema } from "@/lib/validation";
import { join } from "path";

// GET - Fetch all portfolio images, optionally filtered by category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category"); // "events" or "activations"

    if (!prisma) {
      // Fallback to static images if database not configured
      return NextResponse.json({ images: [] }, { status: 200 });
    }

    const where = category ? { category } : {};
    
    const images = await prisma.portfolio.findMany({
      where,
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ images }, { status: 200 });
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio images" },
      { status: 500 }
    );
  }
}

// POST - Add new portfolio image (supports both file upload and manual path entry)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication (supports both database and env var auth)
    const { verifyAdminAuth } = await import("@/lib/auth-helpers");
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

    // Check if this is a file upload or JSON data
    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get("image") as File;
      const title = formData.get("title") as string | null;
      const category = formData.get("category") as string | null;
      const alt = formData.get("alt") as string | null;
      const order = formData.get("order") as string | null;

      if (!file) {
        return NextResponse.json(
          { error: "No image file provided" },
          { status: 400 }
        );
      }

      if (!category) {
        return NextResponse.json(
          { error: "Category is required" },
          { status: 400 }
        );
      }

      // Validate file (20MB limit)
      const fileValidation = validateFile(file, {
        maxSize: 20 * 1024 * 1024, // 20MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      });

      if (!fileValidation.valid) {
        return NextResponse.json({ error: fileValidation.error }, { status: 400 });
      }

      // Validate form data
      const validation = portfolioUploadSchema.safeParse({
        title: title || undefined,
        category,
        alt: alt || undefined,
        order: order ? parseInt(order) : undefined,
      });

      if (!validation.success) {
        return NextResponse.json(
          { error: "Invalid form data", details: validation.error.errors },
          { status: 400 }
        );
      }

      // Upload image with thumbnail
      const uploadResult = await uploadImage(
        file,
        join(process.cwd(), "public", "uploads"),
        "portfolio",
        {
          generateThumbnail: true,
          thumbnailWidth: 300,
          thumbnailHeight: 300,
          maxWidth: 1920,
          maxHeight: 1080,
        }
      );

      // Save to database
      const portfolioItem = await prisma.portfolio.create({
        data: {
          title: validation.data.title,
          src: uploadResult.originalUrl,
          alt: validation.data.alt || "Portfolio image",
          category: validation.data.category,
          imageUrl: uploadResult.originalUrl,
          thumbnailUrl: uploadResult.thumbnailUrl,
          order: validation.data.order || 0,
        },
      });

      return NextResponse.json(portfolioItem, { status: 201 });
    } else {
      // Handle JSON data (manual path entry - backward compatibility)
      const body = await request.json();
      const { src, alt, category, width, height, order } = body;

      if (!src || !category) {
        return NextResponse.json(
          { error: "src and category are required" },
          { status: 400 }
        );
      }

      const portfolioItem = await prisma.portfolio.create({
        data: {
          src,
          alt: alt || "Portfolio image",
          category,
          width: width || 800,
          height: height || 600,
          order: order || 0,
        },
      });

      return NextResponse.json(portfolioItem, { status: 201 });
    }
  } catch (error: any) {
    console.error("Error creating portfolio item:", error);
    const errorMessage = error?.message || "Failed to create portfolio item";
    const errorDetails = process.env.NODE_ENV === "development" ? error?.stack : undefined;
    console.error("Full error details:", {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      stack: error?.stack,
      error: error
    });
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        type: error?.name || "UnknownError"
      },
      { status: 500 }
    );
  }
}
