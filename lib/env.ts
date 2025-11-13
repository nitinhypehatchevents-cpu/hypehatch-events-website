import { z } from "zod";

// Environment variable schema
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  ADMIN_SECRET: z.string().optional(),
  UPLOAD_MAX_SIZE: z.string().default("2097152"), // 2MB in bytes
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      ADMIN_SECRET: process.env.ADMIN_SECRET,
      UPLOAD_MAX_SIZE: process.env.UPLOAD_MAX_SIZE,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Invalid environment variables:", error.flatten().fieldErrors);
    }
    // Return defaults for development
    return {
      NODE_ENV: "development" as const,
      DATABASE_URL: undefined,
      NEXT_PUBLIC_SITE_URL: undefined,
      ADMIN_SECRET: undefined,
      UPLOAD_MAX_SIZE: "2097152",
    };
  }
};

export const env = parseEnv();


