import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Helper function to normalize URLs - adds https:// if missing
function normalizeUrl(url: string): string {
  if (!url || url.trim() === "") return "";
  
  const trimmed = url.trim();
  
  // If it already has a protocol, return as is
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  
  // If it starts with www. or has a domain-like pattern, add https://
  if (/^(www\.|[\w-]+\.)/i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  
  // Otherwise, return as is (might be invalid, but let user handle it)
  return trimmed;
}

// Custom URL validator that accepts simple addresses like "www.example.com"
const urlOrEmpty = z.union([
  z.string().url(),
  z.string().refine((val) => {
    if (!val || val.trim() === "") return true;
    // Accept simple addresses like "www.example.com" or "example.com"
    return /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/.*)?$/i.test(val.trim());
  }, { message: "Invalid URL format" }),
  z.literal("")
]).optional();

// Address schema with city and address fields
const addressSchema = z.object({
  city: z.string().optional(),
  address: z.string().optional(),
});

const contactInfoSchema = z.object({
  phone: z.string().optional(),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  address: z.string().optional(), // Deprecated - kept for backward compatibility
  addresses: z.array(addressSchema).optional(), // Array of address objects with city and address
  website: urlOrEmpty,
  facebook: urlOrEmpty,
  instagram: urlOrEmpty,
  linkedin: urlOrEmpty,
  twitter: urlOrEmpty,
  youtube: urlOrEmpty,
  whatsapp: z.string().optional(),
});

// GET - Fetch contact information
export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { 
          phone: "",
          email: "",
          address: "",
          website: "",
          facebook: "",
          instagram: "",
          linkedin: "",
          twitter: "",
          youtube: "",
          whatsapp: "",
        },
        { status: 200 }
      );
    }

    // Check if companyInfo model exists with better diagnostics
    if (!prisma.companyInfo) {
      console.error("Prisma client missing CompanyInfo model.");
      console.error("Available models:", Object.keys(prisma).filter(key => !key.startsWith('$') && !key.startsWith('_')));
      // Return empty data instead of error for GET requests
      return NextResponse.json(
        { 
          phone: "",
          email: "",
          address: "",
          website: "",
          facebook: "",
          instagram: "",
          linkedin: "",
          twitter: "",
          youtube: "",
          whatsapp: "",
        },
        { status: 200 }
      );
    }

    let companyInfo = await prisma.companyInfo.findFirst();

    // If no record exists, create a default one
    if (!companyInfo) {
      companyInfo = await prisma.companyInfo.create({
        data: {
          phone: "",
          email: "",
          address: "",
          website: "",
        },
      });
    }

    // Parse addresses from JSON string, handle both old (string[]) and new (object[]) formats
    let addresses: Array<{ city?: string; address?: string }> = [];
    if (companyInfo.addresses) {
      try {
        const parsed = JSON.parse(companyInfo.addresses);
        // Check if it's an array of strings (old format) or objects (new format)
        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && typeof parsed[0] === 'string') {
            // Old format: convert strings to objects
            addresses = parsed.map((addr: string) => ({ address: addr }));
          } else {
            // New format: array of objects
            addresses = parsed;
          }
        }
      } catch (e) {
        addresses = [];
      }
    } else if (companyInfo.address) {
      // Backward compatibility: convert single address to array
      addresses = [{ address: companyInfo.address }];
    }

    return NextResponse.json({
      phone: companyInfo.phone || "",
      email: companyInfo.email || "",
      address: companyInfo.address || "", // Keep for backward compatibility
      addresses: addresses, // New array field with city and address
      website: companyInfo.website || "",
      facebook: companyInfo.facebook || "",
      instagram: companyInfo.instagram || "",
      linkedin: companyInfo.linkedin || "",
      twitter: companyInfo.twitter || "",
      youtube: companyInfo.youtube || "",
      whatsapp: companyInfo.whatsapp || "",
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching contact info:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact information" },
      { status: 500 }
    );
  }
}

// PUT - Update contact information
export async function PUT(request: NextRequest) {
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

    // Check if companyInfo model exists with better diagnostics
    if (!prisma.companyInfo) {
      console.error("Prisma client missing CompanyInfo model.");
      console.error("Available models:", Object.keys(prisma).filter(key => !key.startsWith('$') && !key.startsWith('_')));
      console.error("Prisma client type:", typeof prisma);
      console.error("Please run: npx prisma generate");
      console.error("Then restart the development server!");
      return NextResponse.json(
        { 
          error: "Database model not available. Please regenerate Prisma client and restart the server.",
          details: "The CompanyInfo model is missing from the Prisma client. Run 'npx prisma generate' and restart your development server."
        },
        { status: 503 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = contactInfoSchema.safeParse(body);
    if (!validation.success) {
      console.error("Validation error:", validation.error.errors);
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.errors },
        { status: 400 }
      );
    }

    // Process addresses array - filter out empty objects and convert to JSON
    let addressesJson: string | null = null;
    if (validation.data.addresses && Array.isArray(validation.data.addresses)) {
      const filteredAddresses = validation.data.addresses
        .map(addr => ({
          city: addr.city?.trim() || "",
          address: addr.address?.trim() || "",
        }))
        .filter(addr => addr.city || addr.address); // Keep if either city or address has value
      if (filteredAddresses.length > 0) {
        addressesJson = JSON.stringify(filteredAddresses);
      }
    }

    // Normalize empty strings to null and normalize URLs
    const data = {
      phone: validation.data.phone?.trim() || null,
      email: validation.data.email?.trim() || null,
      address: validation.data.address?.trim() || null, // Keep for backward compatibility
      addresses: addressesJson, // Store as JSON string
      website: validation.data.website ? normalizeUrl(validation.data.website) : null,
      facebook: validation.data.facebook ? normalizeUrl(validation.data.facebook) : null,
      instagram: validation.data.instagram ? normalizeUrl(validation.data.instagram) : null,
      linkedin: validation.data.linkedin ? normalizeUrl(validation.data.linkedin) : null,
      twitter: validation.data.twitter ? normalizeUrl(validation.data.twitter) : null,
      youtube: validation.data.youtube ? normalizeUrl(validation.data.youtube) : null,
      whatsapp: validation.data.whatsapp?.trim() || null,
    };

    // Get or create company info record
    let companyInfo = await prisma.companyInfo.findFirst();

    if (companyInfo) {
      // Update existing record
      companyInfo = await prisma.companyInfo.update({
        where: { id: companyInfo.id },
        data,
      });
    } else {
      // Create new record
      companyInfo = await prisma.companyInfo.create({
        data,
      });
    }

    // Parse addresses from JSON string, handle both old (string[]) and new (object[]) formats
    let addresses: Array<{ city?: string; address?: string }> = [];
    if (companyInfo.addresses) {
      try {
        const parsed = JSON.parse(companyInfo.addresses);
        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && typeof parsed[0] === 'string') {
            // Old format: convert strings to objects
            addresses = parsed.map((addr: string) => ({ address: addr }));
          } else {
            // New format: array of objects
            addresses = parsed;
          }
        }
      } catch (e) {
        addresses = [];
      }
    } else if (companyInfo.address) {
      addresses = [{ address: companyInfo.address }];
    }

    return NextResponse.json({
      phone: companyInfo.phone || "",
      email: companyInfo.email || "",
      address: companyInfo.address || "", // Keep for backward compatibility
      addresses: addresses, // New array field with city and address
      website: companyInfo.website || "",
      facebook: companyInfo.facebook || "",
      instagram: companyInfo.instagram || "",
      linkedin: companyInfo.linkedin || "",
      twitter: companyInfo.twitter || "",
      youtube: companyInfo.youtube || "",
      whatsapp: companyInfo.whatsapp || "",
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating contact info:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update contact information", details: errorMessage },
      { status: 500 }
    );
  }
}

