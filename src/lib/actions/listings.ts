"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
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
  public_email?: string | null;
  public_phone?: string | null;
  phones?: string[] | null;
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
type ListingDbClient = SupabaseClient;

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

function isPermissionError(error: unknown) {
  const issue = error as SupabaseMutationError | null;
  const text = `${issue?.code || ""} ${issue?.message || ""} ${issue?.details || ""}`.toLowerCase();
  return (
    issue?.code === "42501" ||
    text.includes("row-level security") ||
    text.includes("permission denied") ||
    text.includes("violates row-level security policy") ||
    text.includes("rls")
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
  const user = await getCurrentUserForListing();

  if (!user) {
    redirect(`/${locale}?account=1&mode=login&publishError=auth_required&returnTo=${encodeURIComponent(`/${locale}/sell`)}` as never);
  }

  try {
    const db = (await createSupabaseMutationClient()) as ListingDbClient | null;
    if (!db) return { ok: false, error: listingErrorMessage(locale, "supabase") };

    const userId = user.id;
    const now = new Date().toISOString();
    const { data: existingProfile } = await db
      .from("profiles")
      .select("role, full_name, phone")
      .eq("id", userId)
      .maybeSingle<{ role: string | null; full_name: string | null; phone: string | null }>();
    const profileRole = existingProfile?.role || (user.user_metadata?.account_type === "professional" ? "professional" : "private");
    const userMetadataName = [user.user_metadata?.first_name, user.user_metadata?.last_name].filter(Boolean).join(" ");
    const fullName = existingProfile?.full_name || userMetadataName || user.email || "Swissnaut user";
    const profilePhone = existingProfile?.phone || "";

    const { error: profileError } = await db.from("profiles").upsert({
      id: userId,
      role: profileRole,
      full_name: fullName,
      phone: profilePhone || null,
      preferred_locale: locale,
      updated_at: now
    });
    if (profileError) throw new Error(profileError.message);

    const [{ id: categoryId }, { id: brandId }, { id: modelId }, { id: cantonId }, { id: lakeId }] = await Promise.all([
      findReferenceId(db, "categories", values.category),
      ensureBrand(db, values.brand),
      ensureModel(db, values.brand, values.model),
      findReferenceId(db, "cantons", values.canton),
      findReferenceId(db, "lakes", values.lake)
    ]);
    const cityId = await ensureCity(db, values.city, cantonId);
    const marinaId = values.marina ? await ensureMarina(db, values.marina, cityId, lakeId) : null;
    const professionalProfile = await getProfessionalProfileForUser(db, userId);
    const sellerType = professionalProfile ? "professional" : "private";
    const title = `${values.brand.trim()} ${values.model.trim()}`.trim();
    const professionalPhone = professionalProfile?.public_phone || professionalProfile?.phones?.[0] || "";
    const contactName = professionalProfile?.company_name || fullName;
    const contactEmail = professionalProfile?.public_email || user.email || values.contactEmail || "";
    const contactPhone = professionalPhone || profilePhone || values.contactPhone || "";

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
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone || null,
      published_at: status === "published" ? now : null
    };

    const { data: listing, error } = await insertListingWithCompatibility(db, listingPayload);

    if (error) throw new Error(error.message);
    if (!listing?.slug) throw new Error("Supabase did not return the listing slug.");

    if (photoFiles.length > 0) {
      try {
        await saveListingImages(db, {
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

async function createSupabaseMutationClient() {
  const admin = tryCreateSupabaseAdminClient();
  if (admin) return admin;
  return createSupabaseServerClient();
}

function tryCreateSupabaseAdminClient() {
  try {
    return createSupabaseAdminClient();
  } catch (error) {
    console.error("Supabase admin client unavailable, falling back to signed-in user session", error);
    return null;
  }
}

async function getCurrentUserForListing() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Listing session read failed", error);
      return null;
    }

    return data.user ?? null;
  } catch (error) {
    console.error("Listing session read failed", error);
    return null;
  }
}

async function insertListingWithCompatibility(db: ListingDbClient, payload: ListingInsertPayload) {
  const optionalColumns = [
    "professional_profile_id",
    "vat_included",
    "negotiable",
    "financing_available",
    "fuel_type",
    "engine_type",
    "engine_count",
    "power_hp",
    "engine_hours",
    "length_m",
    "beam_m",
    "weight_kg",
    "hull_material",
    "color",
    "people_capacity",
    "cabins",
    "berths",
    "bathrooms",
    "kitchen",
    "overnight_accommodation",
    "license_required",
    "electric",
    "equipment",
    "contact_name",
    "contact_email",
    "contact_phone",
    "published_at",
    "allow_trade_in"
  ];

  const directInsert = await insertCompatibleListingPayload(db, payload, optionalColumns);
  if (!directInsert.error || payload.status !== "published" || !isPermissionError(directInsert.error)) {
    return directInsert;
  }

  const publishedAt = typeof payload.published_at === "string" ? payload.published_at : new Date().toISOString();
  const pendingInsert = await insertCompatibleListingPayload(
    db,
    {
      ...payload,
      status: "pending_review",
      published_at: null
    },
    optionalColumns
  );

  const insertedId = typeof pendingInsert.data?.id === "string" ? pendingInsert.data.id : null;
  if (pendingInsert.error || !insertedId) return pendingInsert;

  return db
    .from("listings")
    .update({ status: "published", published_at: publishedAt })
    .eq("id", insertedId)
    .select("id, slug")
    .single();
}

async function insertCompatibleListingPayload(db: ListingDbClient, payload: ListingInsertPayload, optionalColumns: string[]) {
  const compatiblePayload = { ...payload };
  const removed = new Set<string>();
  let lastResult = await db.from("listings").insert(compatiblePayload).select("id, slug").single();

  for (let attempt = 0; lastResult.error && isSchemaCompatibilityError(lastResult.error) && attempt < optionalColumns.length; attempt += 1) {
    const missingColumn = missingColumnFromError(lastResult.error);
    const columnToRemove =
      missingColumn && optionalColumns.includes(missingColumn) && missingColumn in compatiblePayload
        ? missingColumn
        : optionalColumns.find((column) => column in compatiblePayload && !removed.has(column));

    if (!columnToRemove) break;
    delete compatiblePayload[columnToRemove];
    removed.add(columnToRemove);
    lastResult = await db.from("listings").insert(compatiblePayload).select("id, slug").single();
  }

  return lastResult;
}

function missingColumnFromError(error: unknown) {
  const issue = error as SupabaseMutationError | null;
  const text = `${issue?.message || ""} ${issue?.details || ""}`;
  return text.match(/column ['"]?([a-z0-9_]+)['"]?/i)?.[1] ?? text.match(/['"]([a-z0-9_]+)['"] column/i)?.[1] ?? null;
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

async function saveListingImages(
  db: ListingDbClient,
  {
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
  const rows = [];

  for (const [index, file] of files.entries()) {
    validateListingImage(file);
    const extension = imageExtension(file);
    const storagePath = `${ownerId}/${slug}/${index + 1}-${Date.now()}.${extension}`;
    const { error: uploadError } = await db.storage
      .from("listing-images")
      .upload(storagePath, file, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data: signedData } = await db.storage
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
  const { error } = await db.from("listing_images").insert(rows);
  if (error) throw new Error(error.message);
}

function validateListingImage(file: File) {
  const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!acceptedTypes.includes(file.type)) {
    throw new Error("Formato de imagen no aceptado. Usa JPG, PNG o WebP.");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Una imagen supera 10 MB.");
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

async function findReferenceId(db: ListingDbClient, table: "categories" | "cantons" | "lakes", label: string) {
  const { data, error } = await db.from(table).select("*");
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

async function ensureBrand(db: ListingDbClient, name: string) {
  const cleanName = name.trim();
  const slug = slugify(cleanName);
  const existing = await db.from("brands").select("id").eq("slug", slug).maybeSingle();
  if (existing.data?.id) return { id: existing.data.id as string };

  const { data, error } = await db
    .from("brands")
    .insert({ slug, name: cleanName })
    .select("id")
    .single();

  if (error) {
    const retry = await db.from("brands").select("id").eq("slug", slug).maybeSingle();
    if (retry.data?.id) return { id: retry.data.id as string };
    console.error("Brand reference could not be created; listing will keep brand_name text", error);
    return { id: null as string | null };
  }
  return { id: data.id as string };
}

async function ensureModel(db: ListingDbClient, brandName: string, modelName: string) {
  const { id: brandId } = await ensureBrand(db, brandName);
  if (!brandId) return { id: null as string | null };
  const cleanName = modelName.trim();
  const slug = slugify(cleanName);
  const existing = await db.from("models").select("id").eq("brand_id", brandId).eq("slug", slug).maybeSingle();
  if (existing.data?.id) return { id: existing.data.id as string };

  const { data, error } = await db
    .from("models")
    .insert({ brand_id: brandId, slug, name: cleanName })
    .select("id")
    .single();

  if (error) {
    const retry = await db.from("models").select("id").eq("brand_id", brandId).eq("slug", slug).maybeSingle();
    if (retry.data?.id) return { id: retry.data.id as string };
    console.error("Model reference could not be created; listing will keep model_name text", error);
    return { id: null as string | null };
  }
  return { id: data.id as string };
}

async function ensureCity(db: ListingDbClient, name: string, cantonId: string | null) {
  if (!name.trim() || !cantonId) return null;
  const slug = slugify(name);
  const existing = await db.from("cities").select("id").eq("canton_id", cantonId).eq("slug", slug).maybeSingle();
  if (existing.data?.id) return existing.data.id as string;

  const { data, error } = await db
    .from("cities")
    .insert({ canton_id: cantonId, slug, name: name.trim() })
    .select("id")
    .single();

  if (error) {
    const retry = await db.from("cities").select("id").eq("canton_id", cantonId).eq("slug", slug).maybeSingle();
    if (retry.data?.id) return retry.data.id as string;
    console.error("City reference could not be created; listing will keep city text unavailable as relation", error);
    return null;
  }
  return data.id as string;
}

async function ensureMarina(db: ListingDbClient, name: string, cityId: string | null, lakeId: string | null) {
  if (!name.trim() || !cityId) return null;
  const slug = slugify(name);
  const existing = await db.from("marinas").select("id").eq("city_id", cityId).eq("slug", slug).maybeSingle();
  if (existing.data?.id) return existing.data.id as string;

  const { data, error } = await db
    .from("marinas")
    .insert({ city_id: cityId, lake_id: lakeId, slug, name: name.trim() })
    .select("id")
    .single();

  if (error) {
    const retry = await db.from("marinas").select("id").eq("city_id", cityId).eq("slug", slug).maybeSingle();
    if (retry.data?.id) return retry.data.id as string;
    console.error("Marina reference could not be created; listing will keep marina text unavailable as relation", error);
    return null;
  }
  return data.id as string;
}

async function getProfessionalProfileForUser(db: ListingDbClient, userId: string): Promise<ProfessionalProfileOwner | null> {
  const { data } = await db
    .from("professional_profiles")
    .select("id, company_name, public_email, public_phone, phones")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .is("suspended_at", null)
    .maybeSingle();

  if (data) return data as ProfessionalProfileOwner;

  const { data: membership, error: membershipError } = await db
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

  const { data: memberProfile } = await db
    .from("professional_profiles")
    .select("id, company_name, public_email, public_phone, phones")
    .eq("id", professionalProfileId)
    .is("deleted_at", null)
    .is("suspended_at", null)
    .maybeSingle();

  return (memberProfile as ProfessionalProfileOwner | null) ?? null;
}
