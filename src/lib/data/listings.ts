import type { Listing, ListingFilters } from "@/types/domain";
import { brands } from "./reference";
import { demoListings } from "./demo";
import { getUserListings } from "./user-listing-storage";

export const PAGE_SIZE = 9;

const sortValues = [
  "date_desc",
  "price_asc",
  "price_desc",
  "year_asc",
  "year_desc",
  "length_asc",
  "length_desc",
  "power_asc",
  "power_desc",
  "brand_asc",
  "brand_desc"
] as const;

export function parseFilters(searchParams: URLSearchParams): ListingFilters {
  const numberValue = (key: string) => {
    const value = searchParams.get(key);
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const booleanValue = (key: string) => {
    const value = searchParams.get(key);
    if (!value) return undefined;
    return value === "true" || value === "1";
  };

  return {
    q: searchParams.get("q") || undefined,
    boatType: searchParams.get("boatType") || undefined,
    category: searchParams.get("category") || undefined,
    brand: searchParams.get("brand") || undefined,
    model: searchParams.get("model") || undefined,
    priceMin: numberValue("priceMin"),
    priceMax: numberValue("priceMax"),
    yearMin: numberValue("yearMin"),
    yearMax: numberValue("yearMax"),
    lengthMin: numberValue("lengthMin"),
    lengthMax: numberValue("lengthMax"),
    beamMin: numberValue("beamMin"),
    beamMax: numberValue("beamMax"),
    engines: numberValue("engines"),
    powerMin: numberValue("powerMin"),
    fuelType: searchParams.get("fuelType") || undefined,
    engineType: searchParams.get("engineType") || undefined,
    maxEngineHours: numberValue("maxEngineHours"),
    condition: searchParams.get("condition") || undefined,
    color: searchParams.get("color") || undefined,
    peopleCapacityMin: numberValue("peopleCapacityMin"),
    cabinsMin: numberValue("cabinsMin"),
    berthsMin: numberValue("berthsMin"),
    bathroomsMin: numberValue("bathroomsMin"),
    kitchen: booleanValue("kitchen"),
    overnightAccommodation: booleanValue("overnightAccommodation"),
    hullMaterial: searchParams.get("hullMaterial") || undefined,
    canton: searchParams.get("canton") || undefined,
    lake: searchParams.get("lake") || undefined,
    city: searchParams.get("city") || undefined,
    marina: searchParams.get("marina") || undefined,
    sellerType: searchParams.get("sellerType") === "professional" ? "professional" : searchParams.get("sellerType") === "private" ? "private" : undefined,
    newOrUsed: searchParams.get("newOrUsed") === "new" ? "new" : searchParams.get("newOrUsed") === "used" ? "used" : undefined,
    trailerIncluded: booleanValue("trailerIncluded"),
    berthIncluded: booleanValue("berthIncluded"),
    licenseRequired: booleanValue("licenseRequired"),
    financingAvailable: booleanValue("financingAvailable"),
    electric: booleanValue("electric"),
    vatIncluded: booleanValue("vatIncluded"),
    withPhotos: booleanValue("withPhotos"),
    sort: sortValues.includes(searchParams.get("sort") as (typeof sortValues)[number]) ? (searchParams.get("sort") as ListingFilters["sort"]) : "date_desc",
    page: numberValue("page") || 1,
    view: searchParams.get("view") === "list" ? "list" : "cards"
  };
}

export function filterListings(listings: Listing[], filters: ListingFilters) {
  const text = filters.q?.trim().toLowerCase();

  return listings.filter((listing) => {
    if (text && !`${listing.title} ${listing.brand} ${listing.model} ${listing.lake} ${listing.canton}`.toLowerCase().includes(text)) return false;
    if (filters.boatType && listing.boatType !== filters.boatType) return false;
    if (filters.category && listing.category !== filters.category) return false;
    if (filters.brand && listing.brand !== filters.brand) return false;
    if (filters.model && listing.model !== filters.model) return false;
    if (filters.priceMin && listing.priceChf < filters.priceMin) return false;
    if (filters.priceMax && listing.priceChf > filters.priceMax) return false;
    if (filters.yearMin && listing.year < filters.yearMin) return false;
    if (filters.yearMax && listing.year > filters.yearMax) return false;
    if (filters.lengthMin && listing.lengthM < filters.lengthMin) return false;
    if (filters.lengthMax && listing.lengthM > filters.lengthMax) return false;
    if (filters.beamMin && listing.beamM < filters.beamMin) return false;
    if (filters.beamMax && listing.beamM > filters.beamMax) return false;
    if (filters.engines && listing.engineCount !== filters.engines) return false;
    if (filters.powerMin && listing.powerHp < filters.powerMin) return false;
    if (filters.fuelType && listing.fuelType !== filters.fuelType) return false;
    if (filters.engineType && listing.engineType !== filters.engineType) return false;
    if (filters.maxEngineHours && listing.engineHours > filters.maxEngineHours) return false;
    if (filters.condition && listing.condition !== filters.condition) return false;
    if (filters.color && listing.color !== filters.color) return false;
    if (filters.peopleCapacityMin && listing.peopleCapacity < filters.peopleCapacityMin) return false;
    if (filters.cabinsMin && listing.cabins < filters.cabinsMin) return false;
    if (filters.berthsMin && listing.berths < filters.berthsMin) return false;
    if (filters.bathroomsMin && listing.bathrooms < filters.bathroomsMin) return false;
    if (filters.kitchen && !listing.kitchen) return false;
    if (filters.overnightAccommodation && !listing.overnightAccommodation) return false;
    if (filters.hullMaterial && listing.hullMaterial !== filters.hullMaterial) return false;
    if (filters.canton && listing.canton !== filters.canton) return false;
    if (filters.lake && listing.lake !== filters.lake) return false;
    if (filters.city && listing.city !== filters.city) return false;
    if (filters.marina && listing.marina !== filters.marina) return false;
    if (filters.sellerType && listing.seller.type !== filters.sellerType) return false;
    if (filters.newOrUsed && listing.condition !== filters.newOrUsed) return false;
    if (filters.trailerIncluded && !listing.trailerIncluded) return false;
    if (filters.berthIncluded && !listing.berthIncluded) return false;
    if (filters.licenseRequired && !listing.licenseRequired) return false;
    if (filters.financingAvailable && !listing.financingAvailable) return false;
    if (filters.electric && !listing.electric) return false;
    if (filters.vatIncluded && !listing.vatIncluded) return false;
    if (filters.withPhotos && listing.images.length === 0) return false;
    return true;
  });
}

export function sortListings(listings: Listing[], sort: ListingFilters["sort"] = "date_desc") {
  return [...listings].sort((a, b) => {
    switch (sort) {
      case "price_asc":
        return a.priceChf - b.priceChf;
      case "price_desc":
        return b.priceChf - a.priceChf;
      case "year_asc":
        return a.year - b.year;
      case "year_desc":
        return b.year - a.year;
      case "length_asc":
        return a.lengthM - b.lengthM;
      case "length_desc":
        return b.lengthM - a.lengthM;
      case "power_asc":
        return a.powerHp - b.powerHp;
      case "power_desc":
        return b.powerHp - a.powerHp;
      case "brand_asc":
        return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
      case "brand_desc":
        return `${b.brand} ${b.model}`.localeCompare(`${a.brand} ${a.model}`);
      case "date_desc":
      default:
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    }
  });
}

export function getListings(filters: ListingFilters = {}) {
  const filtered = sortListings(filterListings(getPublicListings(), filters), filters.sort);
  const page = Math.max(1, filters.page || 1);
  const offset = (page - 1) * PAGE_SIZE;

  return {
    listings: filtered.slice(offset, offset + PAGE_SIZE),
    total: filtered.length,
    page,
    pageSize: PAGE_SIZE,
    pages: Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  };
}

export function getFeaturedListings() {
  return getPublicListings().filter((listing) => listing.featured).slice(0, 6);
}

export function getBrandCounts() {
  return getAllListings().reduce<Record<string, number>>((counts, listing) => {
    if (listing.status !== "published") return counts;
    counts[listing.brand] = (counts[listing.brand] || 0) + 1;
    return counts;
  }, {});
}

export function getAvailableBrands() {
  return Array.from(new Set([...Object.keys(getBrandCounts()), ...brands])).sort((a, b) => a.localeCompare(b));
}

export function getCategoryCounts() {
  return getAllListings().reduce<Record<string, number>>((counts, listing) => {
    if (listing.status !== "published") return counts;
    counts[listing.category] = (counts[listing.category] || 0) + 1;
    return counts;
  }, {});
}

export function getListingBySlug(slug: string) {
  return getAllListings().find((listing) => listing.slug === slug);
}

export function getSimilarListings(listing: Listing) {
  return getPublicListings()
    .filter((candidate) => candidate.id !== listing.id && (candidate.category === listing.category || candidate.lake === listing.lake))
    .slice(0, 3);
}

export function canManageListing(userId: string | undefined, listingOwnerId: string, role?: string) {
  return Boolean(userId && (userId === listingOwnerId || role === "admin"));
}
export function getAllListings() {
  return [...getUserListings(), ...demoListings];
}

export function getPublicListings() {
  return getAllListings().filter((listing) => listing.status === "published");
}
