export type Locale = "fr" | "de" | "it" | "en";

export type AccountRole = "private" | "professional" | "admin";

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
  phone?: string;
  email: string;
  website?: string;
  languages: readonly Locale[];
  verified: boolean;
};

export type Listing = {
  id: string;
  slug: string;
  status: ListingStatus;
  title: string;
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
  createdAt: string;
  publishedAt: string;
  views: number;
  featured: boolean;
  demo: boolean;
};

export type ListingFilters = {
  q?: string;
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
