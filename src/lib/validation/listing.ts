import { z } from "zod";

const booleanStringSchema = z.preprocess(
  (value) => value === true || value === "true" || value === "on" || value === "1",
  z.boolean()
);

const optionalTextSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : ""),
  z.string().max(1000).default("")
);

const normalizeNumberInput = (value: unknown) => {
  if (typeof value !== "string") return value;
  const normalized = value.trim().replace(/[\s']/g, "").replace(",", ".");
  return normalized === "" ? "" : normalized;
};

const textWithFallback = (fallback: string, max = 1000) =>
  z.preprocess((value) => {
    const text = typeof value === "string" ? value.trim() : "";
    return text || fallback;
  }, z.string().max(max));

const intWithDefault = (defaultValue: number, max: number) =>
  z.preprocess(
    (value) => {
      const normalized = normalizeNumberInput(value);
      return normalized === "" || normalized === null || normalized === undefined ? defaultValue : normalized;
    },
    z.coerce.number().int().min(0).max(max)
  );

const intRangeWithDefault = (defaultValue: number, min: number, max: number) =>
  z.preprocess(
    (value) => {
      const normalized = normalizeNumberInput(value);
      return normalized === "" || normalized === null || normalized === undefined ? defaultValue : normalized;
    },
    z.coerce.number().int().min(min).max(max)
  );

const positiveIntWithDefault = (defaultValue: number, max: number) =>
  z.preprocess(
    (value) => {
      const normalized = normalizeNumberInput(value);
      return normalized === "" || normalized === null || normalized === undefined ? defaultValue : normalized;
    },
    z.coerce.number().int().positive().max(max)
  );

const positiveNumberWithDefault = (defaultValue: number, max: number) =>
  z.preprocess(
    (value) => {
      const normalized = normalizeNumberInput(value);
      return normalized === "" || normalized === null || normalized === undefined ? defaultValue : normalized;
    },
    z.coerce.number().positive().max(max)
  );

const conditionWithDefaultSchema = z.preprocess((value) => {
  const condition = typeof value === "string" ? value : "";
  return ["new", "used", "parts", "classic", "refit"].includes(condition) ? condition : "used";
}, z.enum(["new", "used", "parts", "classic", "refit"]));

const legalAcceptedSchema = z.preprocess(
  (value) => value === true || value === "true" || value === "on" || value === "1",
  z.literal(true)
);

const optionalSmallIntSchema = z.preprocess(
  (value) => {
    const normalized = normalizeNumberInput(value);
    return normalized === "" || normalized === null ? undefined : normalized;
  },
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
  boatType: textWithFallback("Bateau", 120),
  category: textWithFallback("Bateaux à moteur", 120),
  brand: textWithFallback("Marque non renseignée", 120),
  model: textWithFallback("Modèle non renseigné", 120),
  year: intRangeWithDefault(new Date().getFullYear(), 1900, new Date().getFullYear() + 1),
  condition: conditionWithDefaultSchema,
  priceChf: positiveIntWithDefault(1, 100_000_000),
  vatIncluded: booleanStringSchema.default(false),
  negotiable: booleanStringSchema.default(false),
  financingAvailable: booleanStringSchema.default(false),
  fuelType: optionalTextSchema,
  engineType: optionalTextSchema,
  powerHp: intWithDefault(0, 5000),
  engineCount: intWithDefault(0, 8),
  engineHours: intWithDefault(0, 100000),
  lengthM: positiveNumberWithDefault(1, 80),
  beamM: positiveNumberWithDefault(1, 30),
  weightKg: intWithDefault(0, 500000),
  hullMaterial: optionalTextSchema,
  canton: optionalTextSchema,
  lake: optionalTextSchema,
  city: optionalTextSchema,
  marina: z.string().optional().default(""),
  peopleCapacity: optionalSmallIntSchema.default(0),
  cabins: optionalSmallIntSchema.default(0),
  berths: optionalSmallIntSchema.default(0),
  bathrooms: optionalSmallIntSchema.default(0),
  kitchen: booleanStringSchema.default(false),
  color: z.string().optional().default(""),
  overnightAccommodation: booleanStringSchema.default(false),
  description: textWithFallback("Annonce publiée sur Swissnaut.", 8000),
  equipment: z.string().optional().default(""),
  contactName: z.string().optional().default(""),
  contactEmail: z.string().optional().default(""),
  contactPhone: z.string().optional().default(""),
  saveAsDraft: booleanStringSchema.default(false)
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
  password: z.string().min(8).max(160),
  legalAccepted: legalAcceptedSchema
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
  whatsappPhone: z.string().trim().max(60).optional().default(""),
  publicEmail: z.string().email().max(180),
  website: z.string().url().optional().or(z.literal("")).default(""),
  description: z.string().trim().max(3000).optional().default(""),
  preferredLocale: z.enum(["fr", "de", "it", "en"]).default("fr"),
  languages: z.array(z.enum(["fr", "de", "it", "en"])).min(1).default(["fr"]),
  openingHours: z.string().trim().max(1000).optional().default(""),
  services: z.array(z.string()).default([]),
  specialties: z.array(z.string()).default([]),
  representedBrands: z.string().trim().max(1000).optional().default(""),
  galleryUrls: z.string().trim().max(3000).optional().default(""),
  legalAccepted: legalAcceptedSchema
});

export const professionalProfileUpdateSchema = z.object({
  companyName: z.string().trim().min(2).max(180),
  logoUrl: z.string().url().optional().or(z.literal("")).default(""),
  coverUrl: z.string().url().optional().or(z.literal("")).default(""),
  addressLine: z.string().trim().max(220).optional().default(""),
  postalCode: z.string().trim().max(20).optional().default(""),
  city: z.string().trim().max(120).optional().default(""),
  canton: z.string().trim().max(120).optional().default(""),
  country: z.string().trim().max(120).optional().default("Switzerland"),
  publicPhone: z.string().trim().max(60).optional().default(""),
  whatsappPhone: z.string().trim().max(60).optional().default(""),
  publicEmail: z.string().email().max(180).optional().or(z.literal("")).default(""),
  website: z.string().url().optional().or(z.literal("")).default(""),
  description: z.string().trim().max(3000).optional().default(""),
  languages: z.array(z.enum(["fr", "de", "it", "en"])).default([]),
  openingHours: z.string().trim().max(1000).optional().default(""),
  services: z.array(z.string()).default([]),
  specialties: z.array(z.string()).default([]),
  representedBrands: z.string().trim().max(1000).optional().default(""),
  galleryUrls: z.string().trim().max(3000).optional().default("")
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
export type ProfessionalProfileUpdateValues = z.infer<typeof professionalProfileUpdateSchema>;
