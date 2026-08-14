import type { Listing, ProfessionalProfile } from "@/types/domain";

const sellers = [
  {
    id: "seller-pro-1",
    type: "professional" as const,
    name: "Leman Nautic",
    companyName: "Leman Nautic SA",
    professionalSlug: "leman-nautic-sa",
    professionalId: "broker-leman-nautic",
    logoUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Sailing_boat_icon.svg",
    city: "Lausanne",
    canton: "Vaud",
    phone: "+41 22 555 12 12",
    email: "sales@leman-nautic.example",
    website: "https://example.com",
    languages: ["fr", "en"] as const,
    verified: true
  },
  {
    id: "seller-private-1",
    type: "private" as const,
    name: "Marc Dubois",
    phone: "+41 79 555 44 20",
    email: "marc@example.com",
    languages: ["fr"] as const,
    verified: false
  },
  {
    id: "seller-pro-2",
    type: "professional" as const,
    name: "Zurichsee Boats",
    companyName: "Zurichsee Boats GmbH",
    professionalSlug: "zurichsee-boats-gmbh",
    professionalId: "broker-zurichsee-boats",
    logoUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Sailing_boat_icon.svg",
    city: "Zurich",
    canton: "Zurich",
    phone: "+41 44 555 19 19",
    email: "hello@zurichsee-boats.example",
    website: "https://example.com",
    languages: ["de", "en"] as const,
    verified: true
  }
];

export const demoProfessionalProfiles: ProfessionalProfile[] = [
  {
    id: "broker-leman-nautic",
    ownerId: "seller-pro-1",
    slug: "leman-nautic-sa",
    companyName: "Leman Nautic SA",
    professionalType: "broker",
    logoUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Sailing_boat_icon.svg",
    coverUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Lake_Geneva_from_Saint-Prex.jpg",
    addressLine: "Quai d'Ouchy 12",
    postalCode: "1006",
    city: "Lausanne",
    canton: "Vaud",
    country: "Switzerland",
    publicPhone: "+41 22 555 12 12",
    publicEmail: "sales@leman-nautic.example",
    website: "https://example.com",
    description: "Broker nautique actif sur le Leman, specialise dans les bateaux a moteur, day cruisers et yachts familiaux.",
    languages: ["fr", "en"],
    openingHours: { text: "Lun-Ven 09:00-18:00, Samedi sur rendez-vous" },
    socialLinks: {},
    serviceAreas: ["Lake Geneva", "Vaud", "Geneva"],
    services: ["sell_boats", "brokerage", "financing", "sea_trials"],
    badges: ["verified_broker", "swiss_company"],
    gallery: [],
    activeListingsCount: 0,
    profileCompletedPercent: 86,
    publishedAt: "2026-06-01T00:00:00.000Z",
    verifiedAt: "2026-06-05T00:00:00.000Z",
    memberSince: "2026-06-01T00:00:00.000Z",
    isFeatured: true,
    featuredLocations: ["home", "brokers"],
    subscriptionPlan: "Professional Plus",
    subscriptionStatus: "active",
    whatsappEnabled: false
  },
  {
    id: "broker-zurichsee-boats",
    ownerId: "seller-pro-2",
    slug: "zurichsee-boats-gmbh",
    companyName: "Zurichsee Boats GmbH",
    professionalType: "dealer",
    logoUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Sailing_boat_icon.svg",
    coverUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Zuerichsee_bei_Staefa.jpg",
    addressLine: "Seestrasse 44",
    postalCode: "8008",
    city: "Zurich",
    canton: "Zurich",
    country: "Switzerland",
    publicPhone: "+41 44 555 19 19",
    publicEmail: "hello@zurichsee-boats.example",
    website: "https://example.com",
    description: "Concessionnaire et courtier pour bateaux premium sur le lac de Zurich, avec accompagnement de vente et essais sur rendez-vous.",
    languages: ["de", "en"],
    openingHours: { text: "Mo-Fr 09:00-18:00" },
    socialLinks: {},
    serviceAreas: ["Lake Zurich", "Zurich"],
    services: ["sell_boats", "maintenance", "sea_trials", "moorings"],
    badges: ["verified_broker", "premium_partner", "swiss_company"],
    gallery: [],
    activeListingsCount: 0,
    profileCompletedPercent: 90,
    publishedAt: "2026-06-03T00:00:00.000Z",
    verifiedAt: "2026-06-08T00:00:00.000Z",
    memberSince: "2026-06-03T00:00:00.000Z",
    isFeatured: true,
    featuredLocations: ["brokers"],
    subscriptionPlan: "Premium Partner",
    subscriptionStatus: "active",
    whatsappEnabled: false
  }
];

const baseListings = [
  ["jeanneau-cap-camarat-755-wa-12345", "Jeanneau Cap Camarat 755 WA", "Motor boats", "Day cruiser", "Jeanneau", "Cap Camarat 755 WA", 2019, 74500, "Vaud", "Lake Geneva", "Lausanne", "Port d'Ouchy", 7.52, 2.59, "Petrol", "Outboard", 250],
  ["beneteau-oceanis-31-lac-leman-12346", "Beneteau Oceanis 31", "Sailing boats", "Sailer", "Beneteau", "Oceanis 31", 2016, 92500, "Geneva", "Lake Geneva", "Geneva", "Port des Eaux-Vives", 9.66, 3.39, "Diesel", "Inboard", 21],
  ["bavaria-sport-32-zurich-12347", "Bavaria Sport 32", "Yachts", "Sport cruiser", "Bavaria", "Sport 32", 2021, 198000, "Zurich", "Lake Zurich", "Zurich", "Tiefenbrunnen", 10.28, 3.31, "Diesel", "Sterndrive", 440],
  ["candela-c-8-electric-lugano-12348", "Candela C-8 Electric", "Electric boats", "Electric hydrofoil", "Candela", "C-8", 2024, 329000, "Ticino", "Lake Lugano", "Lugano", "Marina di Lugano", 8.5, 2.5, "Electric", "Jet", 69],
  ["zodiac-medline-580-neuchatel-12349", "Zodiac Medline 580", "RIBs", "RIB", "Zodiac", "Medline 580", 2020, 38500, "Neuchatel", "Lake Neuchatel", "Neuchatel", "Port de Neuchatel", 5.8, 2.54, "Petrol", "Outboard", 115],
  ["quicksilver-activ-675-thun-12350", "Quicksilver Activ 675 Open", "Motor boats", "Open boat", "Quicksilver", "Activ 675 Open", 2022, 68500, "Bern", "Lake Thun", "Thun", "Lachen", 6.74, 2.55, "Petrol", "Outboard", 200],
  ["frauscher-740-mirage-zug-12351", "Frauscher 740 Mirage", "Motor boats", "Runabout", "Frauscher", "740 Mirage", 2018, 139000, "Zug", "Lake Zug", "Zug", "Bruggli", 7.47, 2.49, "Petrol", "Inboard", 350],
  ["princess-v40-lucerne-12352", "Princess V40", "Yachts", "Motor yacht", "Princess", "V40", 2017, 475000, "Lucerne", "Lake Lucerne", "Lucerne", "Alpenquai", 12.98, 3.81, "Diesel", "Sterndrive", 660],
  ["bayliner-vr5-biel-12353", "Bayliner VR5 Bowrider", "Motor boats", "Bowrider", "Bayliner", "VR5", 2021, 52900, "Bern", "Lake Biel", "Biel", "Port de Bienne", 6.2, 2.43, "Petrol", "Sterndrive", 200],
  ["nimbus-305-coupe-constance-12354", "Nimbus 305 Coupe", "Motor boats", "Cabin cruiser", "Nimbus", "305 Coupe", 2019, 248000, "Thurgau", "Lake Constance", "Romanshorn", "Romanshorn Hafen", 10.07, 3.25, "Diesel", "Inboard", 220],
  ["riva-aquarama-maggiore-12355", "Riva Aquarama Super", "Classic boats", "Classic runabout", "Riva", "Aquarama Super", 1978, 89000, "Ticino", "Lake Maggiore", "Locarno", "Porto Regionale", 8.78, 2.6, "Petrol", "Inboard", 370],
  ["sunseeker-portofino-40-leman-12356", "Sunseeker Portofino 40", "Yachts", "Sport yacht", "Sunseeker", "Portofino 40", 2015, 390000, "Vaud", "Lake Geneva", "Nyon", "Port de Nyon", 12.9, 3.87, "Diesel", "Inboard", 740],
  ["axopar-28-zurich-demo-12357", "Axopar 28 Cabin", "Motor boats", "Cabin boat", "Axopar", "28 Cabin", 2023, 169000, "Zurich", "Lake Zurich", "Horgen", "Horgen Marina", 8.75, 2.95, "Petrol", "Outboard", 300],
  ["catamaran-lagoon-380-lugano-12358", "Lagoon 380", "Catamarans", "Catamaran", "Lagoon", "380", 2014, 285000, "Ticino", "Lake Lugano", "Melide", "Melide", 11.55, 6.53, "Diesel", "Inboard", 58],
  ["fishing-aluminium-lucerne-12359", "Aluminium Fishing 520", "Fishing boats", "Fishing boat", "Alumacraft", "Classic 520", 2020, 31500, "Schwyz", "Lake Lucerne", "Brunnen", "Brunnen", 5.2, 2.05, "Petrol", "Outboard", 80]
] as const;

const commonsFile = (filename: string) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`;

const photoSets: Record<string, string[]> = {
  "Motor boats": [
    commonsFile("22_ft_Spencer_Runabout.jpg"),
    commonsFile("Motorboat_at_Kankaria_lake.JPG"),
    commonsFile("1928_Chris_Craft_Cadet.jpg")
  ],
  "Sailing boats": [
    commonsFile("Bavaria_Cruiser_45.jpg"),
    commonsFile("Hunter_25_September_Song_0878.jpg"),
    commonsFile("The_Maltese_Falcon_(2906785674).jpg")
  ],
  "Yachts": [
    commonsFile("Azzam_bei_Lürssen.JPG"),
    commonsFile("Bavaria_Cruiser_45.jpg"),
    commonsFile("The_Maltese_Falcon_(2906785674).jpg")
  ],
  "Electric boats": [
    commonsFile("Untersee-RA66_Helio.jpg"),
    commonsFile("\"e-Tolly\"_a_1973_Tollycraft_Electric_Retrofit.jpg"),
    commonsFile("\"e-Tolly\"_a_1973_Tollycraft_Electric_Retrofit.jpg")
  ],
  "RIBs": [
    commonsFile("Falmouth_irb_02.jpg"),
    commonsFile("Falmouth_irb_02.jpg"),
    commonsFile("Falmouth_irb_02.jpg")
  ],
  "Classic boats": [
    commonsFile("1928_Chris_Craft_Cadet.jpg"),
    commonsFile("22_ft_Spencer_Runabout.jpg"),
    commonsFile("1928_Chris_Craft_Cadet.jpg")
  ],
  "Catamarans": [
    commonsFile("Catamaran_de_croisière_Lagoon_560.JPG"),
    commonsFile("Untersee-RA66_Helio.jpg"),
    commonsFile("Catamaran_de_croisière_Lagoon_560.JPG")
  ],
  "Fishing boats": [
    commonsFile("Small_sport_fishing_boat.jpg"),
    commonsFile("Krabbenkutter_Ivonne_Pellworm_P5242390jm.JPG"),
    commonsFile("Parked_boats_at_Anjarle_Creek.jpg")
  ]
};

export function demoBoatImages(category: string) {
  return photoSets[category] || photoSets["Motor boats"];
}

export const demoListings: Listing[] = baseListings.map((row, index) => {
  const [slug, title, category, boatType, brand, model, year, priceChf, canton, lake, city, marina, lengthM, beamM, fuelType, engineType, powerHp] = row;
  const seller = sellers[index % sellers.length];
  const electric = fuelType === "Electric";

  return {
    id: `demo-${index + 1}`,
    slug,
    status: "published",
    title,
    category,
    boatType,
    brand,
    model,
    year,
    priceChf,
    vatIncluded: index % 3 !== 0,
    negotiable: index % 2 === 0,
    financingAvailable: seller.type === "professional",
    condition: year >= 2023 ? "new" : year < 1990 ? "classic" : "used",
    fuelType,
    engineType,
    engineCount: category === "Catamarans" || category === "Yachts" ? 2 : 1,
    powerHp,
    engineHours: Math.max(8, (2026 - year) * 55 + index * 12),
    lengthM,
    beamM,
    weightKg: Math.round(Number(lengthM) * Number(beamM) * 420),
    hullMaterial: category === "Classic boats" ? "Wood" : category === "Fishing boats" ? "Aluminium" : "Fiberglass",
    color: index % 4 === 0 ? "White" : index % 4 === 1 ? "Blue" : index % 4 === 2 ? "Grey" : "Black",
    peopleCapacity: category === "Catamarans" ? 10 : category === "Yachts" ? 8 : Number(lengthM) >= 9 ? 7 : 5,
    cabins: category === "Fishing boats" || Number(lengthM) < 7 ? 0 : category === "Catamarans" ? 4 : category === "Yachts" ? 2 : 1,
    berths: category === "Fishing boats" || Number(lengthM) < 7 ? 0 : category === "Catamarans" ? 8 : category === "Yachts" ? 4 : 2,
    bathrooms: category === "Catamarans" ? 2 : category === "Yachts" || Number(lengthM) >= 9 ? 1 : 0,
    kitchen: category === "Catamarans" || category === "Yachts" || Number(lengthM) >= 9,
    overnightAccommodation: category === "Catamarans" || category === "Yachts" || Number(lengthM) >= 9,
    canton,
    lake,
    city,
    marina,
    trailerIncluded: Number(lengthM) < 7,
    berthIncluded: seller.type === "professional" && index % 2 === 0,
    licenseRequired: Number(powerHp) > 8,
    electric,
    description:
      "Demo listing created for Swissnaut MVP. The boat data is illustrative and must be replaced by verified seller information before production publication.",
    equipment: ["Navigation lights", "Mooring cover", "Bathing ladder", "Safety kit", index % 2 === 0 ? "GPS" : "Teak cockpit"],
    images: demoBoatImages(category).map((url, offset) => ({
      id: `demo-${index + 1}-image-${offset + 1}`,
      url,
      alt: `${title} real demo boat photo ${offset + 1}`,
      isPrimary: offset === 0,
      sortOrder: offset
    })),
    seller,
    professionalProfile: seller.type === "professional" ? {
      id: seller.professionalId || seller.id,
      slug: seller.professionalSlug || seller.id,
      companyName: seller.companyName || seller.name,
      logoUrl: seller.logoUrl,
      city: seller.city,
      canton: seller.canton,
      badges: seller.verified ? ["verified_broker"] : [],
      activeListingsCount: 0
    } : undefined,
    createdAt: new Date(Date.UTC(2026, 5, 20 - index)).toISOString(),
    publishedAt: new Date(Date.UTC(2026, 5, 22 - index)).toISOString(),
    views: 140 + index * 37,
    featured: index < 6,
    demo: true
  };
});
