"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { locales } from "@/lib/data/reference";
import { saveUserListing } from "@/lib/data/user-listing-storage";
import { listingFormSchema } from "@/lib/validation/listing";
import { slugify } from "@/lib/utils";

export async function submitListingAction(formData: FormData) {
  const parsed = listingFormSchema.safeParse(Object.fromEntries(formData.entries()));
  const rawLocale = String(formData.get("locale") || "fr");
  const locale = locales.includes(rawLocale as (typeof locales)[number]) ? rawLocale : "fr";

  if (!parsed.success) {
    throw new Error(`Invalid listing: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
  }

  const values = parsed.data;
  const status = values.saveAsDraft ? "draft" : "published";
  const slug = `${slugify(`${values.brand} ${values.model}`)}-${Date.now().toString().slice(-6)}`;
  const listing = saveUserListing(values, slug, status);

  for (const appLocale of locales) {
    revalidatePath(`/${appLocale}`);
    revalidatePath(`/${appLocale}/boats`);
    revalidatePath(`/${appLocale}/dashboard/listings`);
  }

  console.info("Listing accepted", { status, slug, brand: listing.brand, model: listing.model });

  if (status === "draft") {
    redirect(`/${locale}/dashboard/listings`);
  }

  redirect(`/${locale}/listing/${listing.slug}`);
}
