import { describe, expect, it } from "vitest";
import { listingStatusSchema } from "@/lib/validation/listing";

describe("publishing workflow", () => {
  it("supports required moderation statuses", () => {
    for (const status of ["draft", "pending_review", "published", "paused", "sold", "rejected", "expired", "archived"]) {
      expect(listingStatusSchema.safeParse(status).success).toBe(true);
    }
  });
});
