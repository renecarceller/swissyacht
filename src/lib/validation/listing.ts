import { z } from "zod";

export const listingStatusSchema = z.enum([
  "draft",
  "pending_review",
  "published",
  "paused",
  "sold",
  "rejected",
  "expired",
  "archived"
]);

export const listingFormSchema = z.object({
  boatType: z.string().min(2),
  category: z.string().min(2),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  condition: z.enum(["new", "used", "parts", "classic", "refit"]),
  priceChf: z.coerce.number().int().positive().max(100_000_000),
  vatIncluded: z.coerce.boolean().default(false),
  negotiable: z.coerce.boolean().default(false),
  financingAvailable: z.coerce.boolean().default(false),
  fuelType: z.string().min(2),
  engineType: z.string().min(2),
  powerHp: z.coerce.number().int().min(0).max(5000),
  engineCount: z.coerce.number().int().min(0).max(8),
  engineHours: z.coerce.number().int().min(0).max(100000),
  lengthM: z.coerce.number().positive().max(80),
  beamM: z.coerce.number().positive().max(30),
  weightKg: z.coerce.number().positive().max(500000),
  hullMaterial: z.string().min(2),
  canton: z.string().min(2),
  lake: z.string().min(2),
  city: z.string().min(1),
  marina: z.string().optional().default(""),
  description: z.string().min(80).max(8000),
  equipment: z.string().optional().default(""),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional().default(""),
  saveAsDraft: z.coerce.boolean().default(false)
});

export const inquirySchema = z.object({
  listingId: z.string().min(1),
  listingSlug: z.string().min(1),
  sellerId: z.string().min(1),
  name: z.string().min(2).max(120),
  email: z.string().email().max(180),
  phone: z.string().max(60).optional().default(""),
  message: z.string().min(20).max(3000),
  privacyConsent: z.literal(true)
});

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export type ListingFormValues = z.infer<typeof listingFormSchema>;
export type InquiryValues = z.infer<typeof inquirySchema>;
