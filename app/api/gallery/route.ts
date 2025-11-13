import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Return empty array if database is not configured
    // Gallery images are now loaded from static folders
    return NextResponse.json({ images: [] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery images" },
      { status: 500 }
    );
  }
}


