import { describe, expect, it } from "vitest";
import { canManageListing } from "@/lib/data/listings";

describe("listing permissions", () => {
  it("allows owners to manage their own listings", () => {
    expect(canManageListing("user-1", "user-1")).toBe(true);
  });

  it("blocks other users", () => {
    expect(canManageListing("user-2", "user-1")).toBe(false);
  });

  it("allows admins", () => {
    expect(canManageListing("admin-1", "user-1", "admin")).toBe(true);
  });
});
