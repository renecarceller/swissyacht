"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { locales } from "@/lib/data/reference";
import { saveUserListing } from "@/lib/data/user-listing-storage";
import { listingFormSchema, type ListingFormValues } from "@/lib/validation/listing";
import { slugify } from "@/lib/utils";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProfessionalProfileOwner = {
  id: string;
  company_name: string | null;
};

export type ListingActionState = {
  error: string;
};

type SupabaseMutationError = {
  message?: string;
  code?: string;
  details?: string;
};

type SaveListingResult =
  | { ok: true; slug: string; brand: string; model: string }
  | { ok: false; error: string };

type ListingInsertPayload = Record<string, unknown>;

function isSchemaCompatibilityError(error: unknown) {
  const issue = error as SupabaseMutationError | null;
  const text = `${issue?.code || ""} ${issue?.message || ""} ${issue?.details || ""}`.toLowerCase();
  return (
    text.includes("pgrst204") ||
    text.includes("schema cache") ||
    text.includes("could not find") ||
    text.includes("does not exist")
  );
}

export async function submitListingAction(_state: ListingActionState, formData: FormData): Promise<ListingActionState> {
  const parsed = listingFormSchema.safeParse(Object.fromEntries(formData.entries()));
  const rawLocale = String(formData.get("locale") || "fr");
  const locale = locales.includes(rawLocale as (typeof locales)[number]) ? rawLocale : "fr";

  if (!parsed.success) {
    console.error("Invalid listing", parsed.error.flatten().fieldErrors);
    return { error: listingErrorMessage(locale, "invalid") };
  }

  const values = parsed.data;
  const status = values.saveAsDraft ? "draft" : "published";
  const slug = `${slugify(`${values.brand} ${values.model}`)}-${Date.now().toString().slice(-6)}`;
  const photoFiles = getListingPhotoFiles(formData);
  const result = await saveListing(values, slug, status, locale, photoFiles);
  if (!result.ok) return { error: result.error };

  for (const appLocale of locales) {
    revalidatePath(`/${appLocale}`);
    revalidatePath(`/${appLocale}/boats`);
    revalidatePath(`/${appLocale}/dashboard/listings`);
  }

  console.info("Listing accepted", { status, slug, brand: result.brand, model: result.model });

  if (status === "draft") {
    redirect(`/${locale}/dashboard/listings`);
  }

  redirect(`/${locale}/listing/${result.slug}`);
}

async function saveListing(values: ListingFormValues, slug: string, status: "draft" | "published", locale: string, photoFiles: File[]): Promise<SaveListingResult> {
  const supabase = await createSupabaseServerClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!data.user) {
    redirect(`/${locale}/?account=1&publishError=auth_required` as never);
  }

  try {
    const admin = createSupabaseAdminClient();
    const userId = data.user.id;
    const now = new Date().toISOString();
    const fullName = [data.user.user_metadata?.first_name, data.user.user_metadata?.last_name].filter(Boolean).join(" ") || values.contactName;
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle<{ role: string | null }>();
    const profileRole = existingProfile?.role || (data.user.user_metadata?.account_type === "professional" ? "professional" : "private");

    const { error: profileError } = await admin.from("profiles").upsert({
      id: userId,
      role: profileRole,
      full_name: fullName,
      phone: values.contactPhone || null,
      preferred_locale: locale,
      updated_at: now
    });
    if (profileError) throw new Error(profileError.message);

    const [{ id: categoryId }, { id: brandId }, { id: modelId }, { id: cantonId }, { id: lakeId }] = await Promise.all([
      findReferenceId("categories", values.category),
      ensureBrand(values.brand),
      ensureModel(values.brand, values.model),
      findReferenceId("cantons", values.canton),
      findReferenceId("lakes", values.lake)
    ]);
    const cityId = await ensureCity(values.city, cantonId);
    const marinaId = values.marina ? await ensureMarina(values.marina, cityId, lakeId) : null;
    const professionalProfile = await getProfessionalProfileForUser(userId);
    const sellerType = professionalProfile ? "professional" : "private";
    const title = `${values.brand.trim()} ${values.model.trim()}`.trim();

    const listingPayload: ListingInsertPayload = {
      owner_id: userId,
      professional_profile_id: professionalProfile?.id || null,
      category_id: categoryId,
      brand_id: brandId,
      model_id: modelId,
      canton_id: cantonId,
      lake_id: lakeId,
      city_id: cityId,
      marina_id: marinaId,
      slug,
      title,
      status,
      seller_type: sellerType,
      boat_type: values.boatType || values.category,
      brand_name: values.brand.trim(),
      model_name: values.model.trim(),
      year: values.year,
      condition: values.condition,
      price_chf: values.priceChf,
      vat_included: values.vatIncluded,
      negotiable: values.negotiable,
      financing_available: values.financingAvailable,
      fuel_type: values.fuelType,
      engine_type: values.engineType,
      engine_count: values.engineCount,
      power_hp: values.powerHp,
      engine_hours: values.engineHours,
      length_m: values.lengthM,
      beam_m: values.beamM,
      weight_kg: values.weightKg,
      hull_material: values.hullMaterial,
      color: values.color,
      people_capacity: values.peopleCapacity,
      cabins: values.cabins,
      berths: values.berths,
      bathrooms: values.bathrooms,
      kitchen: values.kitchen,
      overnight_accommodation: values.overnightAccommodation,
      license_required: values.powerHp > 8,
      electric: values.fuelType === "Electric",
      description: values.description,
      equipment: values.equipment ? values.equipment.split(",").map((item) => item.trim()).filter(Boolean) : [],
      contact_name: professionalProfile?.company_name || values.contactName,
      contact_email: values.contactEmail,
      contact_phone: values.contactPhone || null,
      published_at: status === "published" ? now : null
    };

    const { data: listing, error } = await insertListingWithCompatibility(listingPayload);

    if (error) throw new Error(error.message);
    if (!listing?.slug) throw new Error("Supabase did not return the listing slug.");

    if (photoFiles.length > 0) {
      try {
        await saveListingImages({
          files: photoFiles,
          listingId: listing.id as string,
          ownerId: userId,
          slug,
          title
        });
      } catch (imageError) {
        console.error("Listing images could not be saved", imageError);
      }
    }

    return { ok: true, slug: listing.slug as string, brand: values.brand, model: values.model };
  } catch (error) {
    console.error("Supabase listing save failed; using local fallback", error);
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      return { ok: false, error: listingErrorMessage(locale, "supabase") };
    }
    const listing = await saveUserListing(values, slug, status, await filesToDataUrls(photoFiles));
    return { ok: true, ...listing };
  }
}

async function insertListingWithCompatibility(payload: ListingInsertPayload) {
  const admin = createSupabaseAdminClient();
  let result = await admin
    .from("listings")
    .insert(payload)
    .select("id, slug")
    .single();

  if (!result.error || !isSchemaCompatibilityError(result.error)) return result;

  const compatiblePayload = { ...payload };
  for (const key of ["people_capacity", "cabins", "berths", "bathrooms", "kitchen", "overnight_accommodation", "allow_trade_in"]) {
    delete compatiblePayload[key];
  }

  result = await admin
    .from("listings")
    .insert(compatiblePayload)
    .select("id, slug")
    .single();

  return result;
}

function listingErrorMessage(locale: string, reason: "invalid" | "supabase") {
  const messages = {
    invalid: {
      fr: "Veuillez compléter tous les champs obligatoires avant de publier votre annonce.",
      de: "Bitte füllen Sie alle Pflichtfelder aus, bevor Sie Ihr Inserat veröffentlichen.",
      it: "Completa tutti i campi obbligatori prima di pubblicare l'annuncio.",
      en: "Please complete all required fields before publishing your listing."
    },
    supabase: {
      fr: "L'annonce n'a pas pu être publiée. Vérifiez que Supabase est connecté et que les migrations sont appliquées.",
      de: "Das Inserat konnte nicht veröffentlicht werden. Prüfen Sie, ob Supabase verbunden ist und die Migrationen angewendet wurden.",
      it: "Non è stato possibile pubblicare l'annuncio. Verifica che Supabase sia collegato e che le migrazioni siano applicate.",
      en: "The listing could not be published. Check that Supabase is connected and the migrations are applied."
    }
  };

  return messages[reason][locale as keyof (typeof messages)[typeof reason]] ?? messages[reason].fr;
}

function getListingPhotoFiles(formData: FormData) {
  const seen = new Set<string>();

  return formData
    .getAll("photos")
    .filter((item): item is File => item instanceof File && item.size > 0)
    .filter((file) => {
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
}

async function saveListingImages({
  files,
  listingId,
  ownerId,
  slug,
  title
}: {
  files: File[];
  listingId: string;
  ownerId: string;
  slug: string;
  title: string;
}) {
  const admin = createSupabaseAdminClient();
  const rows = [];

  for (const [index, file] of files.entries()) {
    validateListingImage(file);
    const extension = imageExtension(file);
    const storagePath = `${ownerId}/${slug}/${index + 1}-${Date.now()}.${extension}`;
    const { error: uploadError } = await admin.storage
      .from("listing-images")
      .upload(storagePath, file, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data: signedData } = await admin.storage
      .from("listing-images")
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365 * 10);

    rows.push({
      listing_id: listingId,
      storage_path: storagePath,
      public_url: signedData?.signedUrl || null,
      alt_text: `${title} photo ${index + 1}`,
      is_primary: index === 0,
      sort_order: index
    });
  }

  if (rows.length === 0) return;
  const { error } = await admin.from("listing_images").insert(rows);
  if (error) throw new Error(error.message);
}

function validateListingImage(file: File) {
  const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!acceptedTypes.includes(file.type)) {
    throw new Error("Formato de imagen no aceptado. Usa JPG, PNG o WebP.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Una imagen supera 5 MB.");
  }
}

function imageExtension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

async function filesToDataUrls(files: File[]) {
  const urls: string[] = [];

  for (const file of files) {
    validateListingImage(file);
    const buffer = Buffer.from(await file.arrayBuffer());
    urls.push(`data:${file.type};base64,${buffer.toString("base64")}`);
  }

  return urls;
}

async function findReferenceId(table: "categories" | "cantons" | "lakes", label: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from(table).select("*");
  if (error || !data) return { id: null as string | null };

  const slug = slugify(label);
  const row = data.find((item: Record<string, unknown>) =>
    item.slug === slug ||
    item.name === label ||
    item.name_en === label ||
    item.name_fr === label ||
    item.name_de === label ||
    item.name_it === label
  );

  return { id: typeof row?.id === "string" ? row.id : null };
}

async function ensureBrand(name: string) {
  const admin = createSupabaseAdminClient();
  const cleanName = name.trim();
  const slug = slugify(cleanName);
  const { data, error } = await admin
    .from("brands")
    .upsert({ slug, name: cleanName }, { onConflict: "slug" })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { id: data.id as string };
}

async function ensureModel(brandName: string, modelName: string) {
  const admin = createSupabaseAdminClient();
  const { id: brandId } = await ensureBrand(brandName);
  const cleanName = modelName.trim();
  const slug = slugify(cleanName);
  const { data, error } = await admin
    .from("models")
    .upsert({ brand_id: brandId, slug, name: cleanName }, { onConflict: "brand_id,slug" })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { id: data.id as string };
}

async function ensureCity(name: string, cantonId: string | null) {
  if (!name.trim() || !cantonId) return null;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("cities")
    .upsert({ canton_id: cantonId, slug: slugify(name), name: name.trim() }, { onConflict: "canton_id,slug" })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

async function ensureMarina(name: string, cityId: string | null, lakeId: string | null) {
  if (!name.trim() || !cityId) return null;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("marinas")
    .upsert({ city_id: cityId, lake_id: lakeId, slug: slugify(name), name: name.trim() }, { onConflict: "city_id,slug" })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

async function getProfessionalProfileForUser(userId: string): Promise<ProfessionalProfileOwner | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("professional_profiles")
    .select("id, company_name")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .is("suspended_at", null)
    .maybeSingle();

  if (data) return data as ProfessionalProfileOwner;

  const { data: membership, error: membershipError } = await admin
    .from("professional_members")
    .select("professional_profile_id")
    .eq("user_id", userId)
    .not("accepted_at", "is", null)
    .in("role", ["owner", "admin", "editor"])
    .limit(1)
    .maybeSingle();

  if (membershipError && isSchemaCompatibilityError(membershipError)) return null;
  if (membershipError) throw new Error(membershipError.message);

  const professionalProfileId = typeof membership?.professional_profile_id === "string" ? membership.professional_profile_id : null;
  if (!professionalProfileId) return null;

  const { data: memberProfile } = await admin
    .from("professional_profiles")
    .select("id, company_name")
    .eq("id", professionalProfileId)
    .is("deleted_at", null)
    .is("suspended_at", null)
    .maybeSingle();

  return (memberProfile as ProfessionalProfileOwner | null) ?? null;
}
