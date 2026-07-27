import type { BrokerBadge, BrokerService, Listing, ListingFilters, Locale, ProfessionalProfile, ProfessionalType } from "@/types/domain";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { demoProfessionalProfiles } from "@/lib/data/demo";
import { getPublicListingsAsync, sortListings } from "@/lib/data/listings";

type BrokerSort = "date_desc" | "price_asc" | "price_desc" | "year_desc" | "year_asc";

function assetUrl(value: unknown) {
  if (typeof value !== "string" || !value) return undefined;
  return value.startsWith("http") ? value : undefined;
}

function toLocales(value: unknown): Locale[] {
  if (!Array.isArray(value)) return ["fr"];
  return value.filter((item): item is Locale => item === "fr" || item === "de" || item === "it" || item === "en");
}

function toBrokerServices(value: unknown): BrokerService[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is BrokerService => typeof item === "string");
}

function toBrokerBadges(value: unknown): BrokerBadge[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is BrokerBadge => typeof item === "string");
}

function toProfessionalType(value: unknown): ProfessionalType {
  return value === "dealer" || value === "marina" || value === "shipyard" || value === "rental" || value === "services" || value === "other" ? value : "broker";
}

async function getSupabaseProfessionalProfiles() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("professional_profiles")
      .select("*, broker_services(service_code), broker_badges(badge_code), broker_gallery(id, public_url, storage_path, alt_text, sort_order)")
      .is("deleted_at", null)
      .is("suspended_at", null)
      .not("published_at", "is", null)
      .order("is_featured", { ascending: false })
      .order("company_name", { ascending: true });

    if (error || !data) return [];

    return data.map((item) => {
      const services = Array.isArray(item.broker_services) ? item.broker_services.map((service: { service_code?: string }) => service.service_code).filter(Boolean) : [];
      const badges = Array.isArray(item.broker_badges) ? item.broker_badges.map((badge: { badge_code?: string }) => badge.badge_code).filter(Boolean) : [];
      const gallery = Array.isArray(item.broker_gallery) ? item.broker_gallery : [];

      return {
        id: item.id,
        ownerId: item.user_id,
        slug: item.slug,
        companyName: item.company_name,
        legalName: item.legal_name || undefined,
        professionalType: toProfessionalType(item.professional_type),
        uidVat: item.uid_vat || undefined,
        foundedYear: item.founded_year || undefined,
        approximateInventory: item.approximate_inventory || undefined,
        logoUrl: assetUrl(item.logo_path),
        coverUrl: assetUrl(item.cover_path),
        addressLine: item.address_line || undefined,
        postalCode: item.postal_code || undefined,
        city: item.city || undefined,
        canton: item.canton || undefined,
        country: item.country || "Switzerland",
        publicPhone: item.public_phone || item.phones?.[0] || undefined,
        publicEmail: item.public_email || undefined,
        whatsappPhone: item.whatsapp_phone || undefined,
        whatsappEnabled: Boolean(item.whatsapp_enabled),
        website: item.website || undefined,
        latitude: item.latitude === null ? undefined : Number(item.latitude),
        longitude: item.longitude === null ? undefined : Number(item.longitude),
        description: item.description || undefined,
        languages: toLocales(item.languages),
        openingHours: item.opening_hours || {},
        socialLinks: item.social_links || {},
        serviceAreas: Array.isArray(item.service_areas) ? item.service_areas : [],
        services: toBrokerServices(services),
        badges: toBrokerBadges(badges),
        gallery: gallery.map((image: { id: string; public_url?: string; storage_path?: string; alt_text?: string; sort_order?: number }) => ({
          id: image.id,
          url: image.public_url || image.storage_path || "",
          alt: image.alt_text || item.company_name,
          isPrimary: false,
          sortOrder: image.sort_order || 0
        })).filter((image: { url: string }) => image.url),
        activeListingsCount: 0,
        profileCompletedPercent: item.profile_completed_percent || 0,
        publishedAt: item.published_at || undefined,
        verifiedAt: item.verified_at || undefined,
        memberSince: item.created_at,
        isFeatured: Boolean(item.is_featured),
        featuredStartAt: item.featured_start_at || undefined,
        featuredEndAt: item.featured_end_at || undefined,
        featuredLocations: Array.isArray(item.featured_locations) ? item.featured_locations : [],
        subscriptionPlan: item.subscription_plan || undefined,
        subscriptionStatus: item.subscription_status || undefined
      } satisfies ProfessionalProfile;
    });
  } catch {
    return [];
  }
}

export async function getProfessionalProfiles() {
  const supabaseProfiles = await getSupabaseProfessionalProfiles();
  const listings = await getPublicListingsAsync();
  const profiles = [...supabaseProfiles, ...demoProfessionalProfiles];

  return profiles.map((profile) => ({
    ...profile,
    activeListingsCount: listings.filter((listing) => listing.professionalProfile?.id === profile.id || listing.seller.professionalSlug === profile.slug).length
  }));
}

export async function getProfessionalProfileBySlug(slug: string) {
  const profiles = await getProfessionalProfiles();
  return profiles.find((profile) => profile.slug === slug);
}

export async function getBrokerListings(profile: ProfessionalProfile, sort: BrokerSort = "date_desc") {
  const brokerListings = (await getPublicListingsAsync()).filter((listing) => listing.professionalProfile?.id === profile.id || listing.seller.professionalSlug === profile.slug);
  const sortMap: Record<BrokerSort, ListingFilters["sort"]> = {
    date_desc: "date_desc",
    price_asc: "price_asc",
    price_desc: "price_desc",
    year_desc: "year_desc",
    year_asc: "year_asc"
  };

  return sortListings(brokerListings, sortMap[sort]) as Listing[];
}

export function brokerSortValue(value: string | null): BrokerSort {
  return value === "price_asc" || value === "price_desc" || value === "year_desc" || value === "year_asc" ? value : "date_desc";
}
