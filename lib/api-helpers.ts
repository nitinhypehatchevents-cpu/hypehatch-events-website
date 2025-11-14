import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/auth-helpers";

/**
 * Shared API response helpers
 */
export const API_RESPONSES = {
  UNAUTHORIZED: (message = "Unauthorized") =>
    NextResponse.json(
      { error: message },
      { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Admin Area"' } }
    ),
  NOT_FOUND: (message = "Resource not found") =>
    NextResponse.json({ error: message }, { status: 404 }),
  BAD_REQUEST: (message = "Bad request") =>
    NextResponse.json({ error: message }, { status: 400 }),
  SERVER_ERROR: (message = "Internal server error") =>
    NextResponse.json({ error: message }, { status: 500 }),
  DB_NOT_CONFIGURED: () =>
    NextResponse.json({ error: "Database not configured" }, { status: 503 }),
  SUCCESS: (data: any, status = 200) =>
    NextResponse.json(data, { status }),
};

/**
 * Middleware to verify admin authentication
 * Returns null if authenticated, or error response if not
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return API_RESPONSES.UNAUTHORIZED();
  }

  const authResult = await verifyAdminAuth(request);
  if (!authResult.authenticated) {
    return API_RESPONSES.UNAUTHORIZED(authResult.error || "Invalid credentials");
  }

  return null;
}

/**
 * Middleware to check if database is configured
 * Returns null if configured, or error response if not
 */
export function requireDatabase(): NextResponse | null {
  if (!prisma) {
    return API_RESPONSES.DB_NOT_CONFIGURED();
  }
  return null;
}

/**
 * Wrapper for API route handlers with automatic auth and DB checks
 */
export function withAuth<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    // Check authentication
    const authError = await requireAuth(request);
    if (authError) return authError;

    // Check database
    const dbError = requireDatabase();
    if (dbError) return dbError;

    // Execute handler
    try {
      return await handler(request, ...args);
    } catch (error) {
      console.error("API error:", error);
      return API_RESPONSES.SERVER_ERROR(
        error instanceof Error ? error.message : "Internal server error"
      );
    }
  };
}

/**
 * Extract and parse route params safely
 */
export async function getRouteParams<T extends Record<string, string>>(
  params: Promise<T>
): Promise<T> {
  try {
    return await params;
  } catch (error) {
    throw new Error("Invalid route parameters");
  }
}


