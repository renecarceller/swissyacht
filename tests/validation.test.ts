import { describe, expect, it } from "vitest";
import { inquirySchema, listingFormSchema } from "@/lib/validation/listing";

const validListing = {
  boatType: "Day cruiser",
  category: "Motor boats",
  brand: "Jeanneau",
  model: "Cap Camarat",
  year: 2022,
  condition: "used",
  priceChf: 85000,
  vatIncluded: true,
  negotiable: false,
  financingAvailable: true,
  fuelType: "Petrol",
  engineType: "Outboard",
  powerHp: 250,
  engineCount: 1,
  engineHours: 120,
  lengthM: 7.55,
  beamM: 2.59,
  weightKg: 2100,
  hullMaterial: "Fiberglass",
  canton: "Vaud",
  lake: "Lake Geneva",
  city: "Lausanne",
  marina: "Ouchy",
  description: "A very clean demo boat with complete maintenance records, safety equipment, and Swiss lake usage history.",
  equipment: "GPS, cover",
  contactName: "Demo Seller",
  contactEmail: "seller@example.com",
  contactPhone: "+41 79 555 12 12",
  saveAsDraft: false
};

describe("listing validation", () => {
  it("accepts a complete listing", () => {
    expect(listingFormSchema.safeParse(validListing).success).toBe(true);
  });

  it("rejects impossible prices", () => {
    expect(listingFormSchema.safeParse({ ...validListing, priceChf: -10 }).success).toBe(false);
  });

  it("accepts a complete Jet-ski listing", () => {
    const parsed = listingFormSchema.safeParse({
      ...validListing,
      listingKind: "Jet-ski",
      category: "Jet skis",
      boatType: "Jet-ski",
      brand: "Sea-Doo",
      model: "GTI 130",
      engineType: "4-stroke",
      displacementCc: 1630,
      seats: 3,
      lengthM: "",
      beamM: "",
      weightKg: "",
      hullMaterial: "",
      lake: "",
      marina: "",
      postalCode: "1588",
      equipment: "Trailer included, Cover, Safety kit"
    });

    expect(parsed.success).toBe(true);
  });
});

describe("inquiry validation", () => {
  it("requires privacy consent", () => {
    const parsed = inquirySchema.safeParse({
      listingId: "listing-1",
      listingSlug: "demo-listing",
      sellerId: "seller-1",
      name: "Buyer",
      email: "buyer@example.com",
      message: "I would like to arrange a viewing for this boat next week.",
      privacyConsent: false
    });

    expect(parsed.success).toBe(false);
  });
});
