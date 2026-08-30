import type { Listing, ProfessionalProfile } from "@/types/domain";

const sellers = [
  {
    id: "seller-demo-swissnaut",
    type: "private" as const,
    name: "Swissnaut Demonstration",
    email: "",
    languages: ["fr"] as const,
    verified: false
  }
];

export const demoProfessionalProfiles: ProfessionalProfile[] = [];

const baseListings = [
  ["jeanneau-cap-camarat-755-wa-demo", "Jeanneau Cap Camarat 755 WA", "Motor boats", "Day cruiser", "Jeanneau", "Cap Camarat 755 WA", 2019, 74500, "Vaud", "Lake Geneva", "Lausanne", "Port d'Ouchy", 7.52, 2.59, "Petrol", "Outboard", 250],
  ["beneteau-oceanis-31-demo", "Beneteau Oceanis 31", "Sailing boats", "Sailer", "Beneteau", "Oceanis 31", 2016, 92500, "Geneva", "Lake Geneva", "Geneva", "Port des Eaux-Vives", 9.66, 3.39, "Diesel", "Inboard", 21],
  ["bavaria-sport-32-demo", "Bavaria Sport 32", "Yachts", "Sport cruiser", "Bavaria", "Sport 32", 2021, 198000, "Zurich", "Lake Zurich", "Zurich", "Tiefenbrunnen", 10.28, 3.31, "Diesel", "Sterndrive", 440],
  ["candela-c-8-electric-demo", "Candela C-8 Electric", "Electric boats", "Electric hydrofoil", "Candela", "C-8", 2024, 329000, "Ticino", "Lake Lugano", "Lugano", "Marina di Lugano", 8.5, 2.5, "Electric", "Jet", 69],
  ["zodiac-medline-580-demo", "Zodiac Medline 580", "RIBs", "RIB", "Zodiac", "Medline 580", 2020, 38500, "Neuchatel", "Lake Neuchatel", "Neuchatel", "Port de Neuchatel", 5.8, 2.54, "Petrol", "Outboard", 115],
  ["quicksilver-activ-675-open-demo", "Quicksilver Activ 675 Open", "Motor boats", "Open boat", "Quicksilver", "Activ 675 Open", 2022, 68500, "Bern", "Lake Thun", "Thun", "Lachen", 6.74, 2.55, "Petrol", "Outboard", 200],
  ["frauscher-740-mirage-demo", "Frauscher 740 Mirage", "Motor boats", "Runabout", "Frauscher", "740 Mirage", 2018, 139000, "Zug", "Lake Zug", "Zug", "Bruggli", 7.47, 2.49, "Petrol", "Inboard", 350],
  ["princess-v40-demo", "Princess V40", "Yachts", "Motor yacht", "Princess", "V40", 2017, 475000, "Lucerne", "Lake Lucerne", "Lucerne", "Alpenquai", 12.98, 3.81, "Diesel", "Sterndrive", 660],
  ["bayliner-vr5-bowrider-demo", "Bayliner VR5 Bowrider", "Motor boats", "Bowrider", "Bayliner", "VR5", 2021, 52900, "Bern", "Lake Biel", "Biel", "Port de Bienne", 6.2, 2.43, "Petrol", "Sterndrive", 200],
  ["nimbus-305-coupe-demo", "Nimbus 305 Coupe", "Motor boats", "Cabin cruiser", "Nimbus", "305 Coupe", 2019, 248000, "Thurgau", "Lake Constance", "Romanshorn", "Romanshorn Hafen", 10.07, 3.25, "Diesel", "Inboard", 220],
  ["riva-aquarama-super-demo", "Riva Aquarama Super", "Classic boats", "Classic runabout", "Riva", "Aquarama Super", 1978, 89000, "Ticino", "Lake Maggiore", "Locarno", "Porto Regionale", 8.78, 2.6, "Petrol", "Inboard", 370],
  ["sunseeker-portofino-40-demo", "Sunseeker Portofino 40", "Yachts", "Sport yacht", "Sunseeker", "Portofino 40", 2015, 390000, "Vaud", "Lake Geneva", "Nyon", "Port de Nyon", 12.9, 3.87, "Diesel", "Inboard", 740],
  ["axopar-28-cabin-demo", "Axopar 28 Cabin", "Motor boats", "Cabin boat", "Axopar", "28 Cabin", 2023, 169000, "Zurich", "Lake Zurich", "Horgen", "Horgen Marina", 8.75, 2.95, "Petrol", "Outboard", 300],
  ["lagoon-380-demo", "Lagoon 380", "Catamarans", "Catamaran", "Lagoon", "380", 2014, 285000, "Ticino", "Lake Lugano", "Melide", "Melide", 11.55, 6.53, "Diesel", "Inboard", 58],
  ["alumacraft-classic-520-demo", "Alumacraft Classic 520", "Fishing boats", "Fishing boat", "Alumacraft", "Classic 520", 2020, 31500, "Schwyz", "Lake Lucerne", "Brunnen", "Brunnen", 5.2, 2.05, "Petrol", "Outboard", 80]
] as const;

const commonsFile = (filename: string) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=2200`;

const photoSets: Record<string, string[]> = {
  "Motor boats": [commonsFile("Motorboat_at_Kankaria_lake.JPG")],
  "Sailing boats": [commonsFile("Bavaria_Cruiser_45.jpg")],
  Yachts: [commonsFile("Bavaria_Sport_32.jpg")],
  "Electric boats": [commonsFile("Untersee-RA66_Helio.jpg")],
  RIBs: [commonsFile("Falmouth_irb_02.jpg")],
  "Classic boats": [commonsFile("22_ft_Spencer_Runabout.jpg")],
  Catamarans: [commonsFile("Catamaran_de_croisière_Lagoon_560.JPG")],
  "Fishing boats": [commonsFile("Small_sport_fishing_boat.jpg")]
};

export function demoBoatImages(category: string) {
  return photoSets[category] || photoSets["Motor boats"];
}

export const demoListings: Listing[] = baseListings.map((row, index) => {
  const [slug, title, category, boatType, brand, model, year, priceChf, canton, lake, city, marina, lengthM, beamM, fuelType, engineType, powerHp] = row;
  const seller = sellers[0];
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
    financingAvailable: false,
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
    berthIncluded: false,
    licenseRequired: Number(powerHp) > 8,
    electric,
    description:
      "Cette annonce illustre le fonctionnement de Swissnaut et ne correspond pas à un bateau actuellement proposé à la vente.",
    equipment: ["Navigation lights", "Mooring cover", "Bathing ladder", "Safety kit", index % 2 === 0 ? "GPS" : "Teak cockpit"],
    images: demoBoatImages(category).map((url, offset) => ({
      id: `demo-${index + 1}-image-${offset + 1}`,
      url,
      alt: `${title} - annonce de démonstration`,
      isPrimary: offset === 0,
      sortOrder: offset
    })),
    seller,
    createdAt: new Date(Date.UTC(2026, 5, 20 - index)).toISOString(),
    publishedAt: new Date(Date.UTC(2026, 5, 22 - index)).toISOString(),
    views: 140 + index * 37,
    featured: index < 6,
    demo: true
  };
});
