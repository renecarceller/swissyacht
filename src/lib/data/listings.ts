import type { BrokerBadge, Listing, ListingFilters } from "@/types/domain";
import { brands } from "./reference";
import { demoBoatImages, demoListings } from "./demo";
import { getUserListings } from "./user-listing-storage";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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

type SupabaseListingRow = Record<string, unknown> & {
  id: string;
  slug: string;
  status: Listing["status"];
  owner_id: string;
  title?: string | null;
  boat_type?: string | null;
  brand_name?: string | null;
  model_name?: string | null;
  year: number;
  price_chf: number;
  vat_included?: boolean | null;
  negotiable?: boolean | null;
  financing_available?: boolean | null;
  condition: Listing["condition"];
  fuel_type?: string | null;
  engine_type?: string | null;
  engine_count?: number | null;
  power_hp?: number | null;
  engine_hours?: number | null;
  length_m?: number | string | null;
  beam_m?: number | string | null;
  weight_kg?: number | null;
  hull_material?: string | null;
  color?: string | null;
  people_capacity?: number | null;
  cabins?: number | null;
  berths?: number | null;
  bathrooms?: number | null;
  kitchen?: boolean | null;
  overnight_accommodation?: boolean | null;
  trailer_included?: boolean | null;
  berth_included?: boolean | null;
  license_required?: boolean | null;
  electric?: boolean | null;
  description?: string | null;
  equipment?: string[] | null;
  seller_type?: string | null;
  contact_name?: string | null;
  contact_email: string;
  contact_phone?: string | null;
  featured?: boolean | null;
  demo?: boolean | null;
  published_at?: string | null;
  created_at: string;
  categories?: { name_en?: string | null } | null;
  brands?: { name?: string | null } | null;
  models?: { name?: string | null } | null;
  cantons?: { name?: string | null } | null;
  lakes?: { name?: string | null } | null;
  cities?: { name?: string | null } | null;
  marinas?: { name?: string | null } | null;
  professional_profiles?: {
    id: string;
    slug: string;
    company_name: string;
    logo_path?: string | null;
    city?: string | null;
    canton?: string | null;
    broker_badges?: { badge_code?: string | null }[] | null;
  } | null;
  listing_images?: {
    id: string;
    public_url?: string | null;
    storage_path?: string | null;
    alt_text?: string | null;
    is_primary?: boolean | null;
    sort_order?: number | null;
  }[] | null;
};

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

export async function getListingsAsync(filters: ListingFilters = {}) {
  const filtered = sortListings(filterListings(await getPublicListingsAsync(), filters), filters.sort);
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

export async function getFeaturedListingsAsync() {
  return (await getPublicListingsAsync()).filter((listing) => listing.featured).slice(0, 6);
}

export function getBrandCounts() {
  return getAllListings().reduce<Record<string, number>>((counts, listing) => {
    if (listing.status !== "published") return counts;
    counts[listing.brand] = (counts[listing.brand] || 0) + 1;
    return counts;
  }, {});
}

export async function getBrandCountsAsync() {
  return (await getAllListingsAsync()).reduce<Record<string, number>>((counts, listing) => {
    if (listing.status !== "published") return counts;
    counts[listing.brand] = (counts[listing.brand] || 0) + 1;
    return counts;
  }, {});
}

export function getAvailableBrands() {
  return Array.from(new Set([...Object.keys(getBrandCounts()), ...brands])).sort((a, b) => a.localeCompare(b));
}

export async function getAvailableBrandsAsync() {
  return Array.from(new Set([...Object.keys(await getBrandCountsAsync()), ...brands])).sort((a, b) => a.localeCompare(b));
}

export function getCategoryCounts() {
  return getAllListings().reduce<Record<string, number>>((counts, listing) => {
    if (listing.status !== "published") return counts;
    counts[listing.category] = (counts[listing.category] || 0) + 1;
    return counts;
  }, {});
}

export async function getCategoryCountsAsync() {
  return (await getAllListingsAsync()).reduce<Record<string, number>>((counts, listing) => {
    if (listing.status !== "published") return counts;
    counts[listing.category] = (counts[listing.category] || 0) + 1;
    return counts;
  }, {});
}

export async function getSearchRangeHistogramsAsync() {
  const listings = await getPublicListingsAsync();

  return {
    year: buildHistogram(listings.map((listing) => listing.year), 1900, 2026, 41),
    length: buildHistogram(listings.map((listing) => listing.lengthM), 0, 40, 36),
    price: buildHistogram(listings.map((listing) => listing.priceChf), 0, 1000000, 40)
  };
}

function buildHistogram(values: number[], min: number, max: number, bins: number) {
  const counts = Array.from({ length: bins }, () => 0);
  const span = max - min;
  const finiteValues = values.filter(Number.isFinite);

  finiteValues.forEach((value) => {
    const clamped = Math.min(max, Math.max(min, value));
    const index = Math.min(bins - 1, Math.max(0, Math.floor(((clamped - min) / span) * bins)));
    counts[index] += 1;
  });

  const largestCount = Math.max(...counts);
  if (largestCount === 0) {
    return {
      bars: counts.map(() => 2),
      counts,
      values: finiteValues
    };
  }

  return {
    bars: counts.map((count) => {
      if (count === 0) return 3;
      return Math.max(8, Math.round((count / largestCount) * 100));
    }),
    counts,
    values: finiteValues
  };
}

export function getListingBySlug(slug: string) {
  return getAllListings().find((listing) => listing.slug === slug);
}

export async function getListingBySlugAsync(slug: string) {
  return (await getAllListingsAsync()).find((listing) => listing.slug === slug);
}

export function getSimilarListings(listing: Listing) {
  return getPublicListings()
    .filter((candidate) => candidate.id !== listing.id && (candidate.category === listing.category || candidate.lake === listing.lake))
    .slice(0, 3);
}

export async function getSimilarListingsAsync(listing: Listing) {
  return (await getPublicListingsAsync())
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

export async function getAllListingsAsync() {
  return [...(await getSupabaseListings()), ...getUserListings(), ...demoListings];
}

export async function getPublicListingsAsync() {
  return (await getAllListingsAsync()).filter((listing) => listing.status === "published");
}

async function getSupabaseListings() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("listings")
      .select(`
        *,
        categories(name_en),
        brands(name),
        models(name),
        cantons(name),
        lakes(name),
        cities(name),
        marinas(name),
        professional_profiles(id, slug, company_name, logo_path, city, canton, broker_badges(badge_code)),
        listing_images(id, public_url, storage_path, alt_text, is_primary, sort_order)
      `)
      .is("deleted_at", null)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return (data as SupabaseListingRow[]).map(toListing).filter(Boolean) as Listing[];
  } catch {
    return [];
  }
}

function toListing(item: SupabaseListingRow) {
  const category = item.categories?.name_en || item.boat_type || "Motor boats";
  const brand = item.brand_name || item.brands?.name || "";
  const model = item.model_name || item.models?.name || "";
  const title = item.title || `${brand} ${model}`.trim();
  const broker = item.professional_profiles;
  const brokerBadges = Array.isArray(broker?.broker_badges)
    ? broker.broker_badges.map((badge) => badge.badge_code).filter(isBrokerBadge)
    : [];
  const images = Array.isArray(item.listing_images) && item.listing_images.length
    ? item.listing_images
        .map((image) => ({
          id: image.id,
          url: image.public_url || image.storage_path || "",
          alt: image.alt_text || title,
          isPrimary: Boolean(image.is_primary),
          sortOrder: image.sort_order || 0
        }))
        .filter((image: { url: string }) => image.url)
        .sort((a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder)
    : demoBoatImages(category).map((url, index) => ({
        id: `${item.id}-fallback-image-${index + 1}`,
        url,
        alt: `${title} boat photo ${index + 1}`,
        isPrimary: index === 0,
        sortOrder: index
      }));
  const sellerType = item.seller_type === "professional" ? "professional" : "private";

  return {
    id: item.id,
    slug: item.slug,
    status: item.status,
    title,
    category,
    boatType: item.boat_type || category,
    brand,
    model,
    year: Number(item.year),
    priceChf: Number(item.price_chf),
    vatIncluded: Boolean(item.vat_included),
    negotiable: Boolean(item.negotiable),
    financingAvailable: Boolean(item.financing_available),
    condition: item.condition,
    fuelType: item.fuel_type || "",
    engineType: item.engine_type || "",
    engineCount: Number(item.engine_count || 0),
    powerHp: Number(item.power_hp || 0),
    engineHours: Number(item.engine_hours || 0),
    lengthM: Number(item.length_m || 0),
    beamM: Number(item.beam_m || 0),
    weightKg: Number(item.weight_kg || 0),
    hullMaterial: item.hull_material || "",
    color: item.color || "",
    peopleCapacity: Number(item.people_capacity || 0),
    cabins: Number(item.cabins || 0),
    berths: Number(item.berths || 0),
    bathrooms: Number(item.bathrooms || 0),
    kitchen: Boolean(item.kitchen),
    overnightAccommodation: Boolean(item.overnight_accommodation),
    canton: item.cantons?.name || broker?.canton || "",
    lake: item.lakes?.name || "",
    city: item.cities?.name || broker?.city || "",
    marina: item.marinas?.name || "",
    trailerIncluded: Boolean(item.trailer_included),
    berthIncluded: Boolean(item.berth_included),
    licenseRequired: Boolean(item.license_required),
    electric: Boolean(item.electric),
    description: item.description || "",
    equipment: Array.isArray(item.equipment) ? item.equipment : [],
    images,
    seller: {
      id: item.owner_id,
      type: sellerType,
      name: sellerType === "professional" ? broker?.company_name || item.contact_name || title : item.contact_name || title,
      companyName: broker?.company_name || undefined,
      professionalSlug: broker?.slug || undefined,
      professionalId: broker?.id || undefined,
      logoUrl: assetUrl(broker?.logo_path),
      city: broker?.city || undefined,
      canton: broker?.canton || undefined,
      phone: item.contact_phone || undefined,
      email: item.contact_email,
      languages: ["fr"],
      verified: brokerBadges.includes("verified_broker")
    },
    professionalProfile: broker ? {
      id: broker.id,
      slug: broker.slug,
      companyName: broker.company_name,
      logoUrl: assetUrl(broker.logo_path),
      city: broker.city || undefined,
      canton: broker.canton || undefined,
      badges: brokerBadges,
      activeListingsCount: 0
    } : undefined,
    createdAt: item.created_at,
    publishedAt: item.published_at || item.created_at,
    views: 0,
    featured: Boolean(item.featured),
    demo: Boolean(item.demo)
  } satisfies Listing;
}

function assetUrl(value: unknown) {
  if (typeof value !== "string" || !value) return undefined;
  return value.startsWith("http") ? value : undefined;
}

function isBrokerBadge(value: unknown): value is BrokerBadge {
  return value === "verified_broker" ||
    value === "premium_partner" ||
    value === "swiss_company" ||
    value === "sailing_specialist" ||
    value === "yacht_specialist" ||
    value === "official_service";
}
