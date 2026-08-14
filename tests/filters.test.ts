import { describe, expect, it } from "vitest";
import { demoListings } from "@/lib/data/demo";
import { filterListings, getBrandCounts, getCategoryCounts, getListings, parseFilters, sortListings } from "@/lib/data/listings";

describe("listing filters", () => {
  it("parses URL reflected filters", () => {
    const filters = parseFilters(new URLSearchParams("brand=Jeanneau&priceMax=90000&withPhotos=true&page=2&view=list"));
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
  });

  it("sorts by engine power descending", () => {
    const sorted = sortListings(demoListings, "power_desc");
    expect(sorted[0]?.powerHp).toBeGreaterThanOrEqual(sorted[1]?.powerHp ?? 0);
    expect(sorted[0]?.powerHp).toBe(740);
  });
});
