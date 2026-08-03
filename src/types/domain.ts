export type Locale = "fr" | "de" | "it" | "en";

export type AccountRole = "private" | "professional" | "admin";
export type AccountType = "private" | "professional";
export type ProfessionalType = "broker" | "dealer" | "marina" | "shipyard" | "rental" | "services" | "other";
export type ProfessionalMemberRole = "owner" | "admin" | "editor" | "viewer";
export type InquiryRequestType = "information" | "visit" | "sea_trial" | "financing" | "trade_in";
export type SavedSearchFrequency = "immediate" | "daily" | "weekly" | "none";

export type ListingStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "paused"
  | "sold"
  | "rejected"
  | "expired"
  | "archived";

export type BoatCondition = "new" | "used" | "parts" | "classic" | "refit";
export type ListingKind = "Bateau" | "Jet-ski";

export type SellerType = "private" | "professional";

export type ListingImage = {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
};

export type Seller = {
  id: string;
  type: SellerType;
  name: string;
  companyName?: string;
  professionalSlug?: string;
  professionalId?: string;
  logoUrl?: string;
  city?: string;
  canton?: string;
  phone?: string;
  whatsapp?: string;
  email: string;
  website?: string;
  languages: readonly Locale[];
  verified: boolean;
  activeListingsCount?: number;
};

export type BrokerService =
  | "buy_boats"
  | "sell_boats"
  | "brokerage"
  | "rental"
  | "financing"
  | "leasing"
  | "insurance"
  | "transport"
  | "maintenance"
  | "repair"
  | "winter_storage"
  | "moorings"
  | "valuation"
  | "administration"
  | "sea_trials"
  | "other";

export type BrokerBadge =
  | "verified_broker"
  | "premium_partner"
  | "swiss_company"
  | "sailing_specialist"
  | "yacht_specialist"
  | "official_service";

export type ProfessionalProfile = {
  id: string;
  ownerId: string;
  slug: string;
  companyName: string;
  legalName?: string;
  professionalType: ProfessionalType;
  uidVat?: string;
  foundedYear?: number;
  approximateInventory?: string;
  logoUrl?: string;
  coverUrl?: string;
  addressLine?: string;
  postalCode?: string;
  city?: string;
  canton?: string;
  country: string;
  publicPhone?: string;
  publicEmail?: string;
  whatsappPhone?: string;
  whatsappEnabled: boolean;
  website?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  languages: readonly Locale[];
  openingHours?: Record<string, string>;
  socialLinks?: Record<string, string>;
  serviceAreas: readonly string[];
  services: readonly BrokerService[];
  badges: readonly BrokerBadge[];
  gallery: readonly ListingImage[];
  activeListingsCount: number;
  profileCompletedPercent: number;
  publishedAt?: string;
  verifiedAt?: string;
  memberSince: string;
  isFeatured: boolean;
  featuredStartAt?: string;
  featuredEndAt?: string;
  featuredLocations: readonly string[];
  subscriptionPlan?: string;
  subscriptionStatus?: string;
};

export type Listing = {
  id: string;
  slug: string;
  status: ListingStatus;
  title: string;
  listingKind: ListingKind;
  category: string;
  boatType: string;
  brand: string;
  model: string;
  year: number;
  priceChf: number;
  vatIncluded: boolean;
  negotiable: boolean;
  financingAvailable: boolean;
  condition: BoatCondition;
  fuelType: string;
  engineType: string;
  engineCount: number;
  powerHp: number;
  engineHours: number;
  lengthM: number;
  beamM: number;
  weightKg: number;
  hullMaterial: string;
  color: string;
  displacementCc: number;
  seats: number;
  postalCode?: string;
  videoUrl?: string;
  peopleCapacity: number;
  cabins: number;
  berths: number;
  bathrooms: number;
  kitchen: boolean;
  overnightAccommodation: boolean;
  canton: string;
  lake: string;
  city: string;
  marina: string;
  trailerIncluded: boolean;
  berthIncluded: boolean;
  licenseRequired: boolean;
  electric: boolean;
  description: string;
  equipment: string[];
  images: ListingImage[];
  seller: Seller;
  professionalProfile?: Pick<ProfessionalProfile, "id" | "slug" | "companyName" | "logoUrl" | "city" | "canton" | "badges" | "activeListingsCount">;
  createdAt: string;
  publishedAt: string;
  views: number;
  featured: boolean;
  demo: boolean;
};

export type SavedSearch = {
  id: string;
  userId: string;
  name: string;
  filters: ListingFilters;
  frequency: SavedSearchFrequency;
  active: boolean;
  lastCheckedAt?: string;
  lastNotifiedAt?: string;
  createdAt: string;
};

export type ListingComparison = {
  id: string;
  userId?: string;
  anonymousKey?: string;
  listingIds: readonly string[];
  createdAt: string;
  updatedAt: string;
};

export type ListingFilters = {
  q?: string;
  listingKind?: ListingKind;
  boatType?: string;
  category?: string;
  brand?: string;
  model?: string;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  lengthMin?: number;
  lengthMax?: number;
  beamMin?: number;
  beamMax?: number;
  engines?: number;
  powerMin?: number;
  fuelType?: string;
  engineType?: string;
  maxEngineHours?: number;
  seatsMin?: number;
  condition?: string;
  color?: string;
  peopleCapacityMin?: number;
  cabinsMin?: number;
  berthsMin?: number;
  bathroomsMin?: number;
  kitchen?: boolean;
  overnightAccommodation?: boolean;
  hullMaterial?: string;
  canton?: string;
  lake?: string;
  city?: string;
  marina?: string;
  sellerType?: SellerType;
  newOrUsed?: BoatCondition;
  trailerIncluded?: boolean;
  berthIncluded?: boolean;
  licenseRequired?: boolean;
  financingAvailable?: boolean;
  electric?: boolean;
  vatIncluded?: boolean;
  withPhotos?: boolean;
  sort?:
    | "date_desc"
    | "price_asc"
    | "price_desc"
    | "year_asc"
    | "year_desc"
    | "length_asc"
    | "length_desc"
    | "power_asc"
    | "power_desc"
    | "brand_asc"
    | "brand_desc";
  page?: number;
  view?: "cards" | "list";
};
