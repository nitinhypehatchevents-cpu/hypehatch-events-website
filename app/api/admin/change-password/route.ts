import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  hashPassword,
  validatePasswordStrength,
  getClientIP,
  checkRateLimit,
  recordFailedAttempt,
} from "@/lib/auth";

// POST - Change password
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);

    // Check rate limiting
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many attempts. Please try again later.`,
        },
        { status: 429 }
      );
    }

    const { currentPassword, newPassword, username } = await request.json();

    // Validate input
    if (!currentPassword || !newPassword || !username) {
      return NextResponse.json(
        { error: "Current password, new password, and username are required" },
        { status: 400 }
      );
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: "Password validation failed", details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Check if new password is different from current
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 }
      );
    }

    // Verify current password and update
    if (prisma && prisma.adminUser) {
      try {
        const adminUser = await prisma.adminUser.findUnique({
          where: { username },
        });

        if (!adminUser) {
          recordFailedAttempt(ip);
          return NextResponse.json(
            { error: "Invalid credentials" },
            { status: 401 }
          );
        }

        // Verify current password
        const isValid = await verifyPassword(
          currentPassword,
          adminUser.passwordHash
        );

        if (!isValid) {
          recordFailedAttempt(ip);
          return NextResponse.json(
            { error: "Current password is incorrect" },
            { status: 401 }
          );
        }

        // Hash new password
        const newPasswordHash = await hashPassword(newPassword);

        // Update password
        await prisma.adminUser.update({
          where: { id: adminUser.id },
          data: {
            passwordHash: newPasswordHash,
            lastPasswordChange: new Date(),
            failedLoginAttempts: 0,
            lockedUntil: null,
          },
        });

        return NextResponse.json(
          { success: true, message: "Password changed successfully" },
          { status: 200 }
        );
      } catch (error) {
        console.error("Password change error:", error);
        return NextResponse.json(
          { error: "Failed to change password. Please try again." },
          { status: 500 }
        );
      }
    }

    // Fallback: If using environment variables, provide instructions
    return NextResponse.json(
      {
        error:
          "Password change requires database setup. Please set up AdminUser in database or change ADMIN_PASS environment variable manually.",
        requiresDatabase: true,
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { error: "Failed to change password. Please try again." },
      { status: 500 }
    );
  }
}

