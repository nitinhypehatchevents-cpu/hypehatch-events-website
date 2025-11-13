import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const contactMessageSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(1, "Message is required").max(2000),
});

// POST - Submit a new contact message
export async function POST(request: NextRequest) {
  try {
    if (!prisma) {
      console.error("Prisma client is null. DATABASE_URL:", process.env.DATABASE_URL ? "set" : "not set");
      return NextResponse.json(
        { success: false, error: "Database not configured. Please set up the database." },
        { status: 503 }
      );
    }

    // Check if contactMessage model exists with better diagnostics
    if (!prisma.contactMessage) {
      console.error("Prisma client missing ContactMessage model.");
      console.error("Available models:", Object.keys(prisma).filter(key => !key.startsWith('$') && !key.startsWith('_')));
      return NextResponse.json(
        { 
          success: false, 
          error: "Database model not available. Please regenerate Prisma client by running 'npx prisma generate' and restart the server." 
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = contactMessageSchema.parse(body);
    
    // Save to database
    const message = await prisma.contactMessage.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        subject: validatedData.subject || null,
        message: validatedData.message,
      },
    });
    
    return NextResponse.json(
      { success: true, message: "Message sent successfully!", id: message.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Error creating contact message:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage.includes("table") || errorMessage.includes("database") 
          ? "Database error. Please check server logs." 
          : "Failed to send message. Please try again.",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

// GET - Fetch all contact messages (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    if (!prisma || !prisma.contactMessage) {
      return NextResponse.json(
        { success: true, messages: [], total: 0, unreadCount: 0 },
        { status: 200 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const isRead = searchParams.get("isRead");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    
    const where: any = {};
    if (isRead !== null) {
      where.isRead = isRead === "true";
    }
    
    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.contactMessage.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      messages,
      total,
      unreadCount: await prisma.contactMessage.count({ where: { isRead: false } }),
    });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

