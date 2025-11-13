import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/auth-helpers";

// GET - Fetch all active testimonials
export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      // Fallback to empty array if database not configured
      return NextResponse.json({ testimonials: [] }, { status: 200 });
    }

    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ testimonials }, { status: 200 });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

// POST - Add new testimonial (requires auth)
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

    if (!prisma) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { quote, author, role, company, avatar, rating, order, isActive } = body;

    if (!quote || !author) {
      return NextResponse.json(
        { error: "quote and author are required" },
        { status: 400 }
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        quote,
        author,
        role: role || null,
        company: company || null,
        avatar: avatar || null,
        rating: rating || null,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}


