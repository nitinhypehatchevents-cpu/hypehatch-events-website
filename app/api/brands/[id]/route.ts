import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/file-upload";
import { join } from "path";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

// DELETE - Delete brand
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check Basic Auth
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Admin Area"' } }
      );
    }

    const credentials = Buffer.from(authHeader.slice(6), "base64")
      .toString()
      .split(":");
    const [username, password] = credentials;

    if (
      username !== process.env.ADMIN_USER ||
      password !== process.env.ADMIN_PASS
    ) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const { id } = await params;

    // Find the brand
    const brand = await prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Delete logo file if it exists in uploads folder
    if (brand.logoUrl && brand.logoUrl.startsWith('/uploads/')) {
      try {
        await deleteImage(brand.logoUrl, undefined, UPLOAD_DIR);
      } catch (deleteError) {
        console.error("Error deleting logo file:", deleteError);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    await prisma.brand.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      { error: "Failed to delete brand" },
      { status: 500 }
    );
  }
}

// PUT - Update brand
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check Basic Auth
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Admin Area"' } }
      );
    }

    const credentials = Buffer.from(authHeader.slice(6), "base64")
      .toString()
      .split(":");
    const [username, password] = credentials;

    if (
      username !== process.env.ADMIN_USER ||
      password !== process.env.ADMIN_PASS
    ) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.brand.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { error: "Failed to update brand" },
      { status: 500 }
    );
  }
}

