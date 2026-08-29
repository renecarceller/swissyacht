import type { Listing } from "@/types/domain";

export type LocationCoordinate = {
  lat: number;
  lng: number;
};

const coordinates: Record<string, LocationCoordinate> = {
  // Marinas and ports used by listings can take priority over city/lake fallbacks.
  "Port d'Ouchy": { lat: 46.5076, lng: 6.6273 },
  "Port de Portalban": { lat: 46.9208, lng: 6.9577 },
  Portalban: { lat: 46.9189, lng: 6.9574 },
  "Port de Vidy": { lat: 46.5124, lng: 6.5989 },
  "Port de Lutry": { lat: 46.5022, lng: 6.6866 },
  "Port de Zurich": { lat: 47.3586, lng: 8.5417 },
  "Port de Thalwil": { lat: 47.2919, lng: 8.5672 },
  "Marina Lugano": { lat: 46.0045, lng: 8.952 },
  "Port de Neuchatel": { lat: 46.9916, lng: 6.931 },
  "Port de Lucerne": { lat: 47.0502, lng: 8.3093 },
  "Port de Thun": { lat: 46.7549, lng: 7.6328 },
  "Port de Biel": { lat: 47.1368, lng: 7.2468 },

  Lausanne: { lat: 46.5197, lng: 6.6323 },
  Geneva: { lat: 46.2044, lng: 6.1432 },
  Geneve: { lat: 46.2044, lng: 6.1432 },
  Genève: { lat: 46.2044, lng: 6.1432 },
  Zurich: { lat: 47.3769, lng: 8.5417 },
  Zürich: { lat: 47.3769, lng: 8.5417 },
  Lugano: { lat: 46.0037, lng: 8.9511 },
  Neuchatel: { lat: 46.9918, lng: 6.931 },
  Neuchâtel: { lat: 46.9918, lng: 6.931 },
  Lucerne: { lat: 47.0502, lng: 8.3093 },
  Luzern: { lat: 47.0502, lng: 8.3093 },
  Thun: { lat: 46.757, lng: 7.628 },
  Biel: { lat: 47.1368, lng: 7.2468 },
  Bienne: { lat: 47.1368, lng: 7.2468 },
  Zug: { lat: 47.1662, lng: 8.5155 },
  Romanshorn: { lat: 47.5659, lng: 9.3787 },
  Locarno: { lat: 46.169, lng: 8.795 },
  Morat: { lat: 46.9281, lng: 7.117 },
  Murten: { lat: 46.9281, lng: 7.117 },

  "Lake Geneva": { lat: 46.45, lng: 6.55 },
  "Lac Leman": { lat: 46.45, lng: 6.55 },
  "Lac Léman": { lat: 46.45, lng: 6.55 },
  "Lake Zurich": { lat: 47.27, lng: 8.66 },
  "Lac de Zurich": { lat: 47.27, lng: 8.66 },
  "Lake Neuchatel": { lat: 46.93, lng: 6.82 },
  "Lac de Neuchatel": { lat: 46.93, lng: 6.82 },
  "Lac de Neuchâtel": { lat: 46.93, lng: 6.82 },
  "Lake Lucerne": { lat: 47.01, lng: 8.4 },
  "Lac des Quatre-Cantons": { lat: 47.01, lng: 8.4 },
  "Lake Constance": { lat: 47.62, lng: 9.35 },
  "Lac de Constance": { lat: 47.62, lng: 9.35 },
  "Lake Lugano": { lat: 46.0, lng: 8.97 },
  "Lac de Lugano": { lat: 46.0, lng: 8.97 },
  "Lake Maggiore": { lat: 46.14, lng: 8.74 },
  "Lac Majeur": { lat: 46.14, lng: 8.74 },
  "Lake Thun": { lat: 46.69, lng: 7.72 },
  "Lac de Thun": { lat: 46.69, lng: 7.72 },
  "Lake Biel": { lat: 47.09, lng: 7.18 },
  "Lac de Biel": { lat: 47.09, lng: 7.18 },
  "Lac de Bienne": { lat: 47.09, lng: 7.18 },

  Aargau: { lat: 47.39, lng: 8.05 },
  "Appenzell Ausserrhoden": { lat: 47.37, lng: 9.3 },
  "Appenzell Innerrhoden": { lat: 47.32, lng: 9.43 },
  Basel: { lat: 47.56, lng: 7.59 },
  "Basel-Landschaft": { lat: 47.44, lng: 7.74 },
  "Basel-Stadt": { lat: 47.56, lng: 7.59 },
  Bern: { lat: 46.95, lng: 7.44 },
  Fribourg: { lat: 46.81, lng: 7.16 },
  Freiburg: { lat: 46.81, lng: 7.16 },
  Glarus: { lat: 47.04, lng: 9.07 },
  Graubunden: { lat: 46.66, lng: 9.57 },
  Graubünden: { lat: 46.66, lng: 9.57 },
  Jura: { lat: 47.35, lng: 7.34 },
  Nidwalden: { lat: 46.93, lng: 8.38 },
  Obwalden: { lat: 46.88, lng: 8.24 },
  Schaffhausen: { lat: 47.7, lng: 8.64 },
  Schwyz: { lat: 47.02, lng: 8.65 },
  Solothurn: { lat: 47.21, lng: 7.54 },
  "St. Gallen": { lat: 47.42, lng: 9.37 },
  Thurgau: { lat: 47.57, lng: 9.11 },
  Ticino: { lat: 46.33, lng: 8.8 },
  Uri: { lat: 46.77, lng: 8.63 },
  Valais: { lat: 46.19, lng: 7.54 },
  Vaud: { lat: 46.56, lng: 6.54 }
};

export function getListingCoordinate(listing: Pick<Listing, "marina" | "city" | "lake" | "canton">) {
  return coordinates[listing.marina] || coordinates[listing.city] || coordinates[listing.lake] || coordinates[listing.canton] || null;
}
