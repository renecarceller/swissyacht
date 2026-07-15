"use server";

import { inquirySchema } from "@/lib/validation/listing";

export async function createInquiryAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = inquirySchema.safeParse({
    ...raw,
    privacyConsent: raw.privacyConsent === "on" || raw.privacyConsent === "true"
  });

  if (!parsed.success) {
    throw new Error(`Invalid inquiry: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
  }

  console.info("Inquiry accepted", { listingId: parsed.data.listingId, sellerId: parsed.data.sellerId });
}
