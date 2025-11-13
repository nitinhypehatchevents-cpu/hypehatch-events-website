import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "./auth";

/**
 * Verify admin authentication from request headers
 * Supports both database-based and environment variable auth (backward compatibility)
 */
export async function verifyAdminAuth(request: NextRequest): Promise<{
  authenticated: boolean;
  username?: string;
  error?: string;
}> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return { authenticated: false, error: "Missing or invalid authorization header" };
    }

    const credentials = Buffer.from(authHeader.slice(6), "base64")
      .toString()
      .split(":");
    const [username, password] = credentials;

    if (!username || !password) {
      return { authenticated: false, error: "Invalid credentials format" };
    }

    // Try database-based authentication first
    if (prisma && prisma.adminUser) {
      try {
        const adminUser = await prisma.adminUser.findUnique({
          where: { username },
        });

        if (adminUser) {
          // Check if account is locked
          if (adminUser.lockedUntil && adminUser.lockedUntil > new Date()) {
            const minutesLeft = Math.ceil(
              (adminUser.lockedUntil.getTime() - Date.now()) / 60000
            );
            return {
              authenticated: false,
              error: `Account locked. Try again in ${minutesLeft} minutes.`,
            };
          }

          // Verify password
          const isValid = await verifyPassword(password, adminUser.passwordHash);

          if (isValid) {
            // Clear failed attempts on successful auth
            await prisma.adminUser.update({
              where: { id: adminUser.id },
              data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
              },
            });

            return { authenticated: true, username };
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

            return { authenticated: false, error: "Invalid credentials" };
          }
        }
      } catch (error) {
        console.error("Database auth error:", error);
        // Fall through to environment variable check
      }
    }

    // Fallback to environment variables (backward compatibility)
    const adminUser = process.env.ADMIN_USER;
    const adminPass = process.env.ADMIN_PASS;

    if (!adminUser || !adminPass) {
      return { authenticated: false, error: "Server configuration error" };
    }

    if (username === adminUser && password === adminPass) {
      return { authenticated: true, username };
    }

    return { authenticated: false, error: "Invalid credentials" };
  } catch (error) {
    console.error("Auth verification error:", error);
    return { authenticated: false, error: "Authentication failed" };
  }
}

/**
 * Sanitize input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  
  return input
    .replace(/[<>]/g, "") // Remove < and >
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();
}

/**
 * Validate and sanitize username
 */
export function validateUsername(username: string): {
  valid: boolean;
  error?: string;
} {
  if (!username || username.trim().length === 0) {
    return { valid: false, error: "Username is required" };
  }

  if (username.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters" };
  }

  if (username.length > 50) {
    return { valid: false, error: "Username must be less than 50 characters" };
  }

  // Only allow alphanumeric, underscore, and hyphen
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return {
      valid: false,
      error: "Username can only contain letters, numbers, underscore, and hyphen",
    };
  }

  return { valid: true };
}

