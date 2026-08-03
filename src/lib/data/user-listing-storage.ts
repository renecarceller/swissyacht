import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Listing } from "@/types/domain";
import type { ListingFormValues } from "@/lib/validation/listing";
import { demoBoatImages } from "./demo";

const storagePath = join(process.cwd(), ".data", "user-listings.json");

function readStoredListings() {
  if (process.env.NODE_ENV === "test") return [];
  if (!existsSync(storagePath)) return [];

  try {
    const content = readFileSync(storagePath, "utf8");
    const parsed = JSON.parse(content) as Listing[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredListings(listings: Listing[]) {
  mkdirSync(dirname(storagePath), { recursive: true });
  writeFileSync(storagePath, JSON.stringify(listings, null, 2));
}

export function getUserListings() {
  return readStoredListings();
}

export function saveUserListing(values: ListingFormValues, slug: string, status: Listing["status"]) {
  const now = new Date().toISOString();
  const title = `${values.brand.trim()} ${values.model.trim()}`.trim();
  const images = demoBoatImages(values.category).map((url, index) => ({
    id: `${slug}-image-${index + 1}`,
    url,
    alt: `${title} ${values.listingKind === "Jet-ski" ? "Jet-ski" : "boat"} photo ${index + 1}`,
    isPrimary: index === 0,
    sortOrder: index
  }));
  const equipment = values.equipment ? values.equipment.split(",").map((item) => item.trim()).filter(Boolean) : [];

  const listing: Listing = {
    id: `user-${slug}`,
    slug,
    status,
    title,
    listingKind: values.listingKind,
    category: values.category,
    boatType: values.listingKind === "Jet-ski" ? "Jet-ski" : values.boatType,
    brand: values.brand.trim(),
    model: values.model.trim(),
    year: values.year,
    priceChf: values.priceChf,
    vatIncluded: values.vatIncluded,
    negotiable: values.negotiable,
    financingAvailable: values.financingAvailable,
    condition: values.condition,
    fuelType: values.fuelType,
    engineType: values.engineType,
    engineCount: values.engineCount,
    powerHp: values.powerHp,
    engineHours: values.engineHours,
    displacementCc: values.displacementCc,
    seats: values.seats,
    lengthM: values.lengthM,
    beamM: values.beamM,
    weightKg: values.weightKg,
    hullMaterial: values.hullMaterial,
    color: values.color,
    peopleCapacity: values.peopleCapacity,
    cabins: values.cabins,
    berths: values.berths,
    bathrooms: values.bathrooms,
    kitchen: values.kitchen,
    overnightAccommodation: values.overnightAccommodation,
    canton: values.canton,
    lake: values.lake,
    city: values.city,
    postalCode: values.postalCode,
    marina: values.marina,
    trailerIncluded: equipment.includes("Trailer included"),
    berthIncluded: false,
    licenseRequired: values.powerHp > 8,
    electric: values.fuelType === "Electric",
    description: values.description,
    equipment,
    videoUrl: values.videoUrl || undefined,
    images,
    seller: {
      id: "local-seller",
      type: "private",
      name: values.contactName,
      phone: values.contactPhone,
      email: values.contactEmail,
      languages: ["fr"],
      verified: false
    },
    createdAt: now,
    publishedAt: status === "published" ? now : "",
    views: 0,
    featured: false,
    demo: false
  };

  const listings = readStoredListings().filter((item) => item.slug !== slug);
  writeStoredListings([listing, ...listings]);

  return listing;
}
