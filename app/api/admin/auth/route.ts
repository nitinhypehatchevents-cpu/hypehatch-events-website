import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  checkRateLimit,
  recordFailedAttempt,
  clearFailedAttempts,
  getClientIP,
} from "@/lib/auth";

// POST - Login
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);

    // Check rate limiting
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed attempts. Please try again in ${Math.ceil(
            (rateLimit.retryAfter || 0) / 60
          )} minutes.`,
        },
        { status: 429 }
      );
    }

    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Check if using database-based auth or environment variables (backward compatibility)
    let isValid = false;
    let useDatabase = false;

    if (prisma && prisma.adminUser) {
      // Try database-based authentication
      try {
        const adminUser = await prisma.adminUser.findUnique({
          where: { username },
        });

        if (adminUser) {
          useDatabase = true;
          // Check if account is locked
          if (adminUser.lockedUntil && adminUser.lockedUntil > new Date()) {
            const minutesLeft = Math.ceil(
              (adminUser.lockedUntil.getTime() - Date.now()) / 60000
            );
            return NextResponse.json(
              {
                error: `Account locked due to too many failed attempts. Try again in ${minutesLeft} minutes.`,
              },
              { status: 423 }
            );
          }

          // Verify password
          isValid = await verifyPassword(password, adminUser.passwordHash);

          if (isValid) {
            // Clear failed attempts and reset lock
            await prisma.adminUser.update({
              where: { id: adminUser.id },
              data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
              },
            });
            clearFailedAttempts(ip);
          } else {
            // Record failed attempt
            const newAttempts = adminUser.failedLoginAttempts + 1;
            const shouldLock = newAttempts >= 5;

            await prisma.adminUser.update({
              where: { id: adminUser.id },
              data: {
                failedLoginAttempts: newAttempts,
                lockedUntil: shouldLock
                  ? new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
                  : null,
              },
            });
            recordFailedAttempt(ip);
          }
        }
      } catch (error) {
        console.error("Database auth error:", error);
        // Fall through to environment variable check
      }
    }

    // Fallback to environment variables (backward compatibility)
    if (!useDatabase) {
      const adminUser = process.env.ADMIN_USER;
      const adminPass = process.env.ADMIN_PASS;

      if (!adminUser || !adminPass) {
        console.error("Admin credentials not configured");
        return NextResponse.json(
          { error: "Server configuration error. Please contact administrator." },
          { status: 500 }
        );
      }

      isValid = username === adminUser && password === adminPass;

      if (!isValid) {
        recordFailedAttempt(ip);
      } else {
        clearFailedAttempts(ip);
      }
    }

    if (isValid) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
