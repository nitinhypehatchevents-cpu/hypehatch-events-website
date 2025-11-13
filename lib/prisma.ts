// Prisma client - lazy initialization to prevent crashes if database is not configured
let prismaInstance: any = null;

function getPrisma() {
  // If DATABASE_URL is not set, return null
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    // Dynamic import to prevent module loading issues
    const { PrismaClient } = require("@prisma/client");
    
    const globalForPrisma = globalThis as unknown as {
      prisma: any | undefined;
    };

    // Check if we have a cached instance
    let instance = prismaInstance || globalForPrisma.prisma;
    
    // If instance exists but missing contactMessage model, recreate it
    if (instance && !instance.contactMessage) {
      console.warn("Prisma client missing ContactMessage model. Recreating client...");
      if (globalForPrisma.prisma) {
        try {
          globalForPrisma.prisma.$disconnect();
        } catch (e) {
          // Ignore disconnect errors
        }
        globalForPrisma.prisma = undefined;
      }
      prismaInstance = null;
      instance = null;
    }

    // Create new instance if needed
    if (!instance) {
      instance = new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });
      
      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = instance;
      }
      prismaInstance = instance;
    }

    return instance;
  } catch (error: any) {
    // Silently fail if Prisma is not available
    if (error.code !== 'MODULE_NOT_FOUND') {
      console.warn("Prisma initialization error:", error.message);
    }
    return null;
  }
}

// Export getter that returns null if database is not configured
export const prisma = getPrisma();
