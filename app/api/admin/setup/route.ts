import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, validatePasswordStrength } from "@/lib/auth";

// POST - Initial admin setup (create first admin user)
export async function POST(request: NextRequest) {
  try {
    // Check if database is available
    if (!prisma || !prisma.adminUser) {
      return NextResponse.json(
        {
          error:
            "Database not configured. Please set up database and run migrations first.",
        },
        { status: 503 }
      );
    }

    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          error: "Password validation failed",
          details: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // Check if admin user already exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Admin user already exists. Use change password instead." },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create admin user
    const adminUser = await prisma.adminUser.create({
      data: {
        username,
        passwordHash,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Admin user created successfully",
        id: adminUser.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin setup error:", error);
    return NextResponse.json(
      { error: "Failed to create admin user. Please try again." },
      { status: 500 }
    );
  }
}

