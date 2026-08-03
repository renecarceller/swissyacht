import { describe, expect, it } from "vitest";
import { demoListings } from "@/lib/data/demo";
import { filterListings, getBrandCounts, getCategoryCounts, getListings, parseFilters, sortListings } from "@/lib/data/listings";

describe("listing filters", () => {
  it("parses URL reflected filters", () => {
    const filters = parseFilters(new URLSearchParams("listingKind=Jet-ski&brand=Jeanneau&priceMax=90000&withPhotos=true&page=2&view=list"));
    expect(filters.listingKind).toBe("Jet-ski");
    expect(filters.brand).toBe("Jeanneau");
    expect(filters.priceMax).toBe(90000);
    expect(filters.withPhotos).toBe(true);
    expect(filters.page).toBe(2);
    expect(filters.view).toBe("list");
  });

  it("filters by brand and price", () => {
    const results = filterListings(demoListings, { brand: "Jeanneau", priceMax: 90000 });
    expect(results).toHaveLength(1);
    expect(results[0]?.brand).toBe("Jeanneau");
  });

  it("paginates results", () => {
    const results = getListings({ page: 1 });
    expect(results.listings.length).toBeLessThanOrEqual(results.pageSize);
    expect(results.total).toBeGreaterThan(12);
  });

  it("counts published listings by brand", () => {
    const counts = getBrandCounts();
    expect(counts.Jeanneau).toBe(1);
    expect(counts.Beneteau).toBe(1);
    expect(counts["AB Inflatables"]).toBeUndefined();
  });

  it("counts published listings by boat type category", () => {
    const counts = getCategoryCounts();
    expect(counts["Motor boats"]).toBe(6);
    expect(counts.Yachts).toBe(3);
    expect(counts["Sailing boats"]).toBe(1);
    expect(counts["Jet skis"]).toBe(4);
  });

  it("filters Jet-skis by seats and engine hours", () => {
    const results = filterListings(demoListings, { listingKind: "Jet-ski", seatsMin: 3, maxEngineHours: 500 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((listing) => listing.listingKind === "Jet-ski" && listing.seats >= 3 && listing.engineHours <= 500)).toBe(true);
  });

  it("sorts by engine power descending", () => {
    const sorted = sortListings(demoListings, "power_desc");
    expect(sorted[0]?.powerHp).toBeGreaterThanOrEqual(sorted[1]?.powerHp ?? 0);
    expect(sorted[0]?.powerHp).toBe(740);
  });
});
