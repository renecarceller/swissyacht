"use server";

import { revalidatePath } from "next/cache";
import { listingFormSchema } from "@/lib/validation/listing";
import { slugify } from "@/lib/utils";

export async function submitListingAction(formData: FormData) {
  const parsed = listingFormSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    throw new Error(`Invalid listing: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
  }

  const values = parsed.data;
  const status = values.saveAsDraft ? "draft" : "pending_review";
  const slug = `${slugify(`${values.brand} ${values.model}`)}-${Date.now().toString().slice(-6)}`;

  revalidatePath("/fr/dashboard/listings");

  console.info("Listing accepted", { status, slug });
}
