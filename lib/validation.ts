import { z } from "zod";

// Hero Image Validation
export const heroImageSchema = z.object({
  url: z.string().url(),
});

// Portfolio Image Validation
export const portfolioUploadSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  category: z.enum(["events", "activations"]),
  alt: z.string().max(200).optional(),
  order: z.number().int().min(0).optional(),
});

export const portfolioUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  category: z.enum(["events", "activations"]).optional(),
  alt: z.string().max(200).optional(),
  order: z.number().int().min(0).optional(),
});

// Brand Validation
export const brandUploadSchema = z.object({
  name: z.string().min(1).max(100),
  website: z.string().url().optional().or(z.literal("")),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const brandUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  logoUrl: z.string().url().optional(),
  website: z.string().url().optional().or(z.literal("")),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// Testimonial Validation
export const testimonialSchema = z.object({
  quote: z.string().min(10).max(1000),
  message: z.string().min(10).max(1000).optional(),
  author: z.string().min(1).max(100),
  clientName: z.string().min(1).max(100).optional(),
  role: z.string().max(100).optional(),
  designation: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  avatar: z.string().url().optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const testimonialUpdateSchema = testimonialSchema.partial();

// File Validation
export const fileValidationSchema = z.object({
  type: z.enum(["image/jpeg", "image/png", "image/webp"]),
  size: z.number().max(2 * 1024 * 1024), // 2MB
});


