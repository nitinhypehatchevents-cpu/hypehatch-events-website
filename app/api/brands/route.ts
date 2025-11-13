import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImage, validateFile } from "@/lib/file-upload";
import { brandUploadSchema } from "@/lib/validation";
import { join } from "path";

// GET - Fetch all active brands
export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      // Fallback to empty array if database not configured
      return NextResponse.json({ brands: [] }, { status: 200 });
    }

    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ brands }, { status: 200 });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

// POST - Add new brand (supports both file upload and manual path entry)
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

    // Check if this is a file upload or JSON data
    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get("logo") as File;
      const name = formData.get("name") as string | null;
      const website = formData.get("website") as string | null;
      const order = formData.get("order") as string | null;
      const isActive = formData.get("isActive") as string | null;

      if (!file) {
        return NextResponse.json(
          { error: "No logo file provided" },
          { status: 400 }
        );
      }

      if (!name) {
        return NextResponse.json(
          { error: "Brand name is required" },
          { status: 400 }
        );
      }

      // Validate file (PNG/WebP only for logos, 10MB for logos)
      const fileValidation = validateFile(file, {
        maxSize: 10 * 1024 * 1024, // 10MB (logos can be high quality)
        allowedTypes: ['image/png', 'image/webp'],
      });

      if (!fileValidation.valid) {
        return NextResponse.json({ error: fileValidation.error }, { status: 400 });
      }

      // Validate form data
      const validation = brandUploadSchema.safeParse({
        name,
        website: website || undefined,
        order: order ? parseInt(order) : undefined,
        isActive: isActive === "true" || isActive === "1",
      });

      if (!validation.success) {
        return NextResponse.json(
          { error: "Invalid form data", details: validation.error.errors },
          { status: 400 }
        );
      }

      // Upload logo
      const uploadResult = await uploadImage(
        file,
        join(process.cwd(), "public", "uploads"),
        "brands",
        {
          generateThumbnail: false, // No thumbnails for logos
          maxWidth: 500,
          maxHeight: 500,
        }
      );

      // Save to database
      const brand = await prisma.brand.create({
        data: {
          name: validation.data.name,
          logo: uploadResult.originalUrl,
          logoUrl: uploadResult.originalUrl,
          website: validation.data.website || null,
          order: validation.data.order || 0,
          isActive: validation.data.isActive !== undefined ? validation.data.isActive : true,
        },
      });

      return NextResponse.json(brand, { status: 201 });
    } else {
      // Handle JSON data (manual path entry - backward compatibility)
      const body = await request.json();
      const { name, logo, website, order, isActive } = body;

      if (!name || !logo) {
        return NextResponse.json(
          { error: "name and logo are required" },
          { status: 400 }
        );
      }

      const brand = await prisma.brand.create({
        data: {
          name,
          logo,
          website: website || null,
          order: order || 0,
          isActive: isActive !== undefined ? isActive : true,
        },
      });

      return NextResponse.json(brand, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 }
    );
  }
}

