import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH - Mark message as read/unread or delete
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    if (!prisma || !prisma.contactMessage) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { isRead, action } = body;
    
    if (action === "delete") {
      await prisma.contactMessage.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, message: "Message deleted" });
    }
    
    if (typeof isRead === "boolean") {
      const message = await prisma.contactMessage.update({
        where: { id },
        data: { isRead },
      });
      return NextResponse.json({ success: true, message });
    }
    
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating contact message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update message" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!prisma || !prisma.contactMessage) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 }
      );
    }

    const { id } = await params;
    await prisma.contactMessage.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: "Message deleted" });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete message" },
      { status: 500 }
    );
  }
}

