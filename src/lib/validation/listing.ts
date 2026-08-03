import { z } from "zod";

const booleanStringSchema = z.preprocess((value) => value === true || value === "true", z.boolean());

const optionalSmallIntSchema = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().int().min(0).max(50).optional()
);

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
  listingKind: z.enum(["Bateau", "Jet-ski"]).default("Bateau"),
  boatType: z.string().min(2),
  category: z.string().min(2),
  brand: z.string().trim().min(1),
  model: z.string().trim().min(1),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  condition: z.enum(["new", "used", "parts", "classic", "refit"]),
  priceChf: z.coerce.number().int().positive().max(100_000_000),
  vatIncluded: booleanStringSchema.default(false),
  negotiable: booleanStringSchema.default(false),
  financingAvailable: booleanStringSchema.default(false),
  fuelType: z.string().min(2),
  engineType: z.string().min(2),
  powerHp: z.coerce.number().int().min(0).max(5000),
  engineCount: z.coerce.number().int().min(0).max(8).default(1),
  engineHours: z.coerce.number().int().min(0).max(100000),
  displacementCc: z.preprocess((value) => (value === "" || value === null ? 0 : value), z.coerce.number().int().min(0).max(10000)).default(0),
  seats: z.preprocess((value) => (value === "" || value === null ? 0 : value), z.coerce.number().int().min(0).max(8)).default(0),
  lengthM: z.preprocess((value) => (value === "" || value === null ? 0 : value), z.coerce.number().min(0).max(80)).default(0),
  beamM: z.preprocess((value) => (value === "" || value === null ? 0 : value), z.coerce.number().min(0).max(30)).default(0),
  weightKg: z.preprocess((value) => (value === "" || value === null ? 0 : value), z.coerce.number().min(0).max(500000)).default(0),
  hullMaterial: z.string().optional().default(""),
  canton: z.string().min(2),
  lake: z.string().optional().default(""),
  city: z.string().min(1),
  postalCode: z.string().trim().max(20).optional().default(""),
  marina: z.string().optional().default(""),
  peopleCapacity: optionalSmallIntSchema.default(0),
  cabins: optionalSmallIntSchema.default(0),
  berths: optionalSmallIntSchema.default(0),
  bathrooms: optionalSmallIntSchema.default(0),
  kitchen: booleanStringSchema.default(false),
  color: z.string().optional().default(""),
  overnightAccommodation: booleanStringSchema.default(false),
  description: z.string().min(80).max(8000),
  equipment: z.string().optional().default(""),
  videoUrl: z.string().url().optional().or(z.literal("")).default(""),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional().default(""),
  saveAsDraft: booleanStringSchema.default(false)
}).superRefine((values, ctx) => {
  if (values.listingKind === "Bateau") {
    if (values.lengthM <= 0) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["lengthM"], message: "Required for boats" });
    if (values.beamM <= 0) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["beamM"], message: "Required for boats" });
    if (values.weightKg <= 0) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["weightKg"], message: "Required for boats" });
    if (!values.hullMaterial) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["hullMaterial"], message: "Required for boats" });
    if (!values.lake) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["lake"], message: "Required for boats" });
  }

  if (values.listingKind === "Jet-ski") {
    if (values.seats <= 0) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["seats"], message: "Required for jet-skis" });
    if (values.displacementCc <= 0 && values.engineType !== "Electric") ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["displacementCc"], message: "Required for combustion jet-skis" });
  }
});

export const inquirySchema = z.object({
  listingId: z.string().min(1),
  listingSlug: z.string().min(1),
  sellerId: z.string().min(1),
  professionalProfileId: z.string().optional().default(""),
  requestType: z.enum(["information", "visit", "sea_trial", "financing", "trade_in"]).default("information"),
  name: z.string().min(2).max(120),
  email: z.string().email().max(180),
  phone: z.string().max(60).optional().default(""),
  contactPreference: z.enum(["email", "phone", "whatsapp"]).default("email"),
  message: z.string().min(20).max(3000),
  privacyConsent: z.literal(true)
});

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const privateRegisterSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(120),
  email: z.string().email().max(180),
  phone: z.string().trim().min(4).max(60),
  password: z.string().min(8).max(160)
});

export const professionalRegisterSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(120),
  email: z.string().email().max(180),
  phone: z.string().trim().min(4).max(60),
  password: z.string().min(8).max(160),
  companyName: z.string().trim().min(2).max(180),
  logoUrl: z.string().url().optional().or(z.literal("")).default(""),
  coverUrl: z.string().url().optional().or(z.literal("")).default(""),
  addressLine: z.string().trim().min(2).max(220),
  postalCode: z.string().trim().min(3).max(20),
  city: z.string().trim().min(2).max(120),
  canton: z.string().trim().min(2).max(120),
  country: z.string().trim().min(2).max(120).default("Switzerland"),
  publicPhone: z.string().trim().max(60).optional().default(""),
  publicEmail: z.string().email().max(180),
  website: z.string().url().optional().or(z.literal("")).default(""),
  description: z.string().trim().max(3000).optional().default(""),
  preferredLocale: z.enum(["fr", "de", "it", "en"]).default("fr"),
  languages: z.array(z.enum(["fr", "de", "it", "en"])).min(1).default(["fr"]),
  openingHours: z.string().trim().max(1000).optional().default(""),
  services: z.array(z.string()).default([])
});

export const savedSearchSchema = z.object({
  name: z.string().trim().min(2).max(160),
  filters: z.record(z.string(), z.unknown()).default({}),
  frequency: z.enum(["immediate", "daily", "weekly", "none"]).default("none"),
  active: z.boolean().default(true)
});

export const listingComparisonSchema = z.object({
  listingIds: z.array(z.string().min(1)).min(2).max(4)
});

export type ListingFormValues = z.infer<typeof listingFormSchema>;
export type InquiryValues = z.infer<typeof inquirySchema>;
export type PrivateRegisterValues = z.infer<typeof privateRegisterSchema>;
export type ProfessionalRegisterValues = z.infer<typeof professionalRegisterSchema>;
