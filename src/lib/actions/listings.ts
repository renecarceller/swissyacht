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
  publishedSlug?: string;
  draftSaved?: boolean;
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
type EncodedListingPhoto = {
  name: string;
  type: string;
  size: number;
  lastModified?: number;
  sortOrder?: number;
  dataUrl: string;
};
type ListingPhotoInput = File | EncodedListingPhoto;

const acceptedListingImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxListingImageBytes = 10 * 1024 * 1024;
const listingFieldLabels: Record<string, { fr: string; de: string; it: string; en: string }> = {
  boatType: { fr: "Type", de: "Typ", it: "Tipo", en: "Type" },
  category: { fr: "Catégorie", de: "Kategorie", it: "Categoria", en: "Category" },
  brand: { fr: "Marque", de: "Marke", it: "Marca", en: "Brand" },
  model: { fr: "Modèle", de: "Modell", it: "Modello", en: "Model" },
  year: { fr: "Année", de: "Jahr", it: "Anno", en: "Year" },
  condition: { fr: "État", de: "Zustand", it: "Stato", en: "Condition" },
  priceChf: { fr: "Prix", de: "Preis", it: "Prezzo", en: "Price" },
  lengthM: { fr: "Longueur", de: "Länge", it: "Lunghezza", en: "Length" },
  beamM: { fr: "Largeur", de: "Breite", it: "Larghezza", en: "Beam" },
  canton: { fr: "Canton", de: "Kanton", it: "Cantone", en: "Canton" },
  lake: { fr: "Lac", de: "See", it: "Lago", en: "Lake" },
  city: { fr: "Ville", de: "Ort", it: "Città", en: "City" },
  description: { fr: "Description", de: "Beschreibung", it: "Descrizione", en: "Description" }
};

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

function isRecoverableInsertError(error: unknown) {
  const issue = error as SupabaseMutationError | null;
  const text = `${issue?.code || ""} ${issue?.message || ""} ${issue?.details || ""}`.toLowerCase();

  return (
    isSchemaCompatibilityError(error) ||
    isPermissionError(error) ||
    ["23502", "23503", "23514", "22P02", "22001"].includes(issue?.code || "") ||
    text.includes("violates not-null constraint") ||
    text.includes("violates foreign key constraint") ||
    text.includes("violates check constraint") ||
    text.includes("invalid input value") ||
    text.includes("value too long")
  );
}

export async function submitListingAction(_state: ListingActionState, formData: FormData): Promise<ListingActionState> {
  const rawValues = normalizeListingFormValues(formData);
  const parsed = listingFormSchema.safeParse(rawValues);
  const rawLocale = String(formData.get("locale") || "fr");
  const locale = locales.includes(rawLocale as (typeof locales)[number]) ? rawLocale : "fr";

  if (!parsed.success) {
    console.error("Invalid listing", parsed.error.flatten().fieldErrors);
    return { error: listingInvalidMessage(locale, parsed.error.issues.map((issue) => String(issue.path[0] || "")).filter(Boolean)) };
  }

  const values = parsed.data;
  const status = values.saveAsDraft ? "draft" : "published";
  const slug = `${slugify(`${values.brand} ${values.model}`)}-${Date.now().toString().slice(-6)}`;
  const photoFiles = getListingPhotoFiles(formData);
  const result = await saveListing(values, slug, status, locale, photoFiles);
  if (!result.ok) return { error: result.error };

  try {
    for (const appLocale of locales) {
      revalidatePath(`/${appLocale}`);
      revalidatePath(`/${appLocale}/boats`);
      revalidatePath(`/${appLocale}/dashboard/listings`);
    }
  } catch (error) {
    console.error("Listing cache refresh failed after publish", error);
  }

  console.info("Listing accepted", { status, slug, brand: result.brand, model: result.model });

  if (status === "draft") {
    return { error: "", draftSaved: true };
  }

  return { error: "", publishedSlug: result.slug };
}

function normalizeListingFormValues(formData: FormData) {
  const rawValues = Object.fromEntries(
    Array.from(formData.entries()).filter(([, value]) => !(value instanceof File))
  ) as Record<string, FormDataEntryValue>;

  const lastDraftValue = formData
    .getAll("saveAsDraft")
    .filter((value): value is string => typeof value === "string")
    .at(-1);
  rawValues.saveAsDraft = lastDraftValue ?? "false";

  const aliases: Record<string, string[]> = {
    priceChf: ["price", "priceCHF", "price_chf"],
    powerHp: ["power", "powerHP", "power_hp", "enginePower", "engine_power", "horsepower"],
    lengthM: ["length", "length_m"],
    beamM: ["beam", "beam_m", "width", "widthM"],
    weightKg: ["weight", "weight_kg"],
    engineCount: ["engine_count", "motors", "numberOfEngines"],
    engineHours: ["engine_hours", "hours", "motorHours"],
    fuelType: ["fuel", "fuel_type"],
    engineType: ["engine", "engine_type", "motorType"],
    hullMaterial: ["material", "hull_material"],
    peopleCapacity: ["people", "people_capacity", "capacity"],
    overnightAccommodation: ["overnight", "overnight_accommodation"]
  };

  for (const [target, sources] of Object.entries(aliases)) {
    if (hasUsableFormValue(rawValues[target])) continue;
    const source = sources.find((name) => hasUsableFormValue(rawValues[name]));
    if (source) rawValues[target] = rawValues[source];
  }

  const numericDefaults: Record<string, string> = {
    year: String(new Date().getFullYear()),
    priceChf: "1",
    powerHp: "0",
    engineCount: "0",
    engineHours: "0",
    lengthM: "1",
    beamM: "1",
    weightKg: "0",
    peopleCapacity: "0",
    cabins: "0",
    berths: "0",
    bathrooms: "0"
  };

  for (const [field, fallback] of Object.entries(numericDefaults)) {
    if (!hasUsableFormValue(rawValues[field])) rawValues[field] = fallback;
  }

  return rawValues;
}

function hasUsableFormValue(value: unknown) {
  return typeof value === "string" ? value.trim() !== "" : value !== null && value !== undefined;
}

function listingInvalidMessage(locale: string, fields: string[]) {
  const uniqueFields = Array.from(new Set(fields))
    .map((field) => listingFieldLabels[field]?.[locale as keyof (typeof listingFieldLabels)[string]] ?? listingFieldLabels[field]?.fr ?? field)
    .filter(Boolean);

  if (uniqueFields.length === 0) return listingErrorMessage(locale, "invalid");

  const messages = {
    fr: `Veuillez compléter : ${uniqueFields.join(", ")}.`,
    de: `Bitte ausfüllen: ${uniqueFields.join(", ")}.`,
    it: `Completa: ${uniqueFields.join(", ")}.`,
    en: `Please complete: ${uniqueFields.join(", ")}.`
  };

  return messages[locale as keyof typeof messages] ?? messages.fr;
}

async function saveListing(
  values: ListingFormValues,
  slug: string,
  status: "draft" | "published",
  locale: string,
  photoFiles: ListingPhotoInput[]
): Promise<SaveListingResult> {
  const user = await getCurrentUserForListing();

  if (!user) {
    redirect(`/${locale}?account=1&mode=login&publishError=auth_required&returnTo=${encodeURIComponent(`/${locale}/sell`)}` as never);
  }

  try {
    const db = (await createSupabaseMutationClient()) as ListingDbClient | null;
    if (!db) throw new Error("Supabase client unavailable.");

    const userId = user.id;
    const now = new Date().toISOString();
    const cleanBrand = values.brand.trim() || "Marque non renseignée";
    const cleanModel = values.model.trim() || "Modèle non renseigné";
    const cleanCategory = values.category.trim() || "Bateaux à moteur";
    const cleanBoatType = values.boatType.trim() || cleanCategory || "Bateau";
    const cleanCanton = values.canton.trim();
    const cleanLake = values.lake.trim();
    const cleanCity = values.city.trim();
    const cleanMarina = values.marina.trim();
    const cleanFuelType = values.fuelType.trim();
    const cleanEngineType = values.engineType.trim();
    const cleanHullMaterial = values.hullMaterial.trim();
    const cleanColor = values.color.trim();
    const cleanDescription =
      values.description.trim() || `Annonce publiée sur Swissnaut pour ${cleanBrand} ${cleanModel}.`;
    const { data: existingProfile, error: profileReadError } = await db
      .from("profiles")
      .select("role, full_name, phone")
      .eq("id", userId)
      .maybeSingle<{ role: string | null; full_name: string | null; phone: string | null }>();

    if (profileReadError) {
      console.error("Profile could not be read before listing publish", profileReadError);
    }
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
    if (profileError) {
      console.error("Profile could not be refreshed before listing publish", profileError);
    }

    const referenceIds = await Promise.all([
      findReferenceId(db, "categories", cleanCategory),
      ensureBrand(db, cleanBrand),
      ensureModel(db, cleanBrand, cleanModel),
      findReferenceId(db, "cantons", cleanCanton),
      findReferenceId(db, "lakes", cleanLake)
    ]).catch((referenceError) => {
      console.error("Listing references could not be resolved; publishing with text fields only", referenceError);
      return [
        { id: null as string | null },
        { id: null as string | null },
        { id: null as string | null },
        { id: null as string | null },
        { id: null as string | null }
      ];
    });
    const [{ id: categoryId }, { id: brandId }, { id: modelId }, { id: cantonId }, { id: lakeId }] = referenceIds;
    const cityId = await ensureCity(db, cleanCity, cantonId).catch((cityError) => {
      console.error("City reference could not be resolved; publishing without city relation", cityError);
      return null;
    });
    const marinaId = cleanMarina
      ? await ensureMarina(db, cleanMarina, cityId, lakeId).catch((marinaError) => {
          console.error("Marina reference could not be resolved; publishing without marina relation", marinaError);
          return null;
        })
      : null;
    const professionalProfile = await getProfessionalProfileForUser(db, userId).catch((profileError) => {
      console.error("Professional owner profile could not be resolved; publishing as private listing", profileError);
      return null;
    });
    const sellerType = professionalProfile ? "professional" : "private";
    const title = `${cleanBrand} ${cleanModel}`.trim();
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
      boat_type: cleanBoatType,
      brand_name: cleanBrand,
      model_name: cleanModel,
      year: values.year,
      condition: values.condition,
      price_chf: values.priceChf,
      vat_included: values.vatIncluded,
      negotiable: values.negotiable,
      financing_available: values.financingAvailable,
      fuel_type: cleanFuelType,
      engine_type: cleanEngineType,
      engine_count: values.engineCount,
      power_hp: values.powerHp,
      engine_hours: values.engineHours,
      length_m: values.lengthM,
      beam_m: values.beamM,
      weight_kg: values.weightKg,
      hull_material: cleanHullMaterial,
      color: cleanColor,
      people_capacity: values.peopleCapacity,
      cabins: values.cabins,
      berths: values.berths,
      bathrooms: values.bathrooms,
      kitchen: values.kitchen,
      overnight_accommodation: values.overnightAccommodation,
      license_required: values.powerHp > 8,
      electric: cleanFuelType === "Electric",
      description: cleanDescription,
      equipment: values.equipment ? values.equipment.split(",").map((item) => item.trim()).filter(Boolean) : [],
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone || null,
      published_at: status === "published" ? now : null
    };

    const { data: listing, error } = await insertListingWithCompatibility(db, listingPayload);

    if (error) throw new Error(formatSupabaseError(error));
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

    return { ok: true, slug: listing.slug as string, brand: cleanBrand, model: cleanModel };
  } catch (error) {
    console.error("Supabase listing save failed; using local fallback", error);
    try {
      const userMetadataName = [user.user_metadata?.first_name, user.user_metadata?.last_name].filter(Boolean).join(" ");
      const fallbackImageUrls = await filesToDataUrls(photoFiles).catch((imageError) => {
        console.error("Listing fallback images could not be prepared", imageError);
        return [];
      });
      const listing = await saveUserListing(values, slug, status, fallbackImageUrls, {
        id: user.id,
        type: user.user_metadata?.account_type === "professional" ? "professional" : "private",
        name: userMetadataName || user.email || "Swissnaut",
        email: user.email || values.contactEmail || "contact@swissnaut.ch"
      });
      return { ok: true, ...listing };
    } catch (fallbackError) {
      console.error("Local listing fallback failed", fallbackError);
      return { ok: false, error: listingErrorMessage(locale, "supabase") };
    }
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
    "category_id",
    "brand_id",
    "model_id",
    "canton_id",
    "lake_id",
    "city_id",
    "marina_id",
    "seller_type",
    "boat_type",
    "brand_name",
    "model_name",
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
    "trailer_included",
    "berth_included",
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
  if (!directInsert.error) return directInsert;

  if (isRecoverableInsertError(directInsert.error)) {
    const candidates = [
      coreListingPayload(payload, { keepProfessionalProfile: true }),
      coreListingPayload(payload, { keepProfessionalProfile: false }),
      minimalListingPayload(payload)
    ];

    for (const candidate of candidates) {
      const candidateInsert = await insertCompatibleListingPayload(db, candidate, optionalColumns);
      if (!candidateInsert.error) return candidateInsert;

      if (payload.status === "published" && isPermissionError(candidateInsert.error)) {
        const pendingInsert = await publishThroughPendingReview(db, candidate, optionalColumns);
        if (!pendingInsert.error) return pendingInsert;
      }
    }
  }

  if (payload.status !== "published" || !isPermissionError(directInsert.error)) {
    return directInsert;
  }

  return publishThroughPendingReview(db, payload, optionalColumns);
}

async function publishThroughPendingReview(db: ListingDbClient, payload: ListingInsertPayload, optionalColumns: string[]) {
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

  const publishedUpdate = await db
    .from("listings")
    .update({ status: "published", published_at: publishedAt })
    .eq("id", insertedId)
    .select("id, slug")
    .single();

  if (!publishedUpdate.error || !isSchemaCompatibilityError(publishedUpdate.error)) {
    return publishedUpdate;
  }

  return db
    .from("listings")
    .update({ status: "published" })
    .eq("id", insertedId)
    .select("id, slug")
    .single();
}

function minimalListingPayload(payload: ListingInsertPayload) {
  return {
    owner_id: payload.owner_id,
    slug: cleanRequiredString(payload.slug, `annonce-${Date.now()}`),
    title: cleanRequiredString(payload.title, "Bateau à vendre"),
    status: cleanStatusValue(payload.status),
    boat_type: cleanRequiredString(payload.boat_type, "Bateau"),
    brand_name: cleanRequiredString(payload.brand_name, "Marque non renseignée"),
    model_name: cleanRequiredString(payload.model_name, "Modèle non renseigné"),
    year: cleanYearValue(payload.year),
    condition: cleanRequiredString(payload.condition, "Occasion"),
    price_chf: cleanInteger(payload.price_chf, 1, 1),
    engine_count: cleanInteger(payload.engine_count, 0, 0),
    power_hp: cleanInteger(payload.power_hp, 0, 0),
    engine_hours: cleanInteger(payload.engine_hours, 0, 0),
    length_m: cleanDecimal(payload.length_m, 0.01, 0.01),
    beam_m: cleanDecimal(payload.beam_m, 0.01, 0.01),
    description: cleanRequiredString(payload.description, "Annonce publiée sur Swissnaut."),
    contact_name: cleanRequiredString(payload.contact_name, "Swissnaut"),
    contact_email: cleanRequiredString(payload.contact_email, "contact@swissnaut.ch"),
    published_at: cleanStatusValue(payload.status) === "published" ? cleanRequiredString(payload.published_at, new Date().toISOString()) : null
  };
}

function coreListingPayload(payload: ListingInsertPayload, { keepProfessionalProfile }: { keepProfessionalProfile: boolean }) {
  const status = cleanStatusValue(payload.status);
  const safePayload: ListingInsertPayload = {
    owner_id: payload.owner_id,
    slug: cleanRequiredString(payload.slug, `annonce-${Date.now()}`),
    title: cleanRequiredString(payload.title, "Bateau à vendre"),
    status,
    seller_type: payload.seller_type === "professional" ? "professional" : "private",
    boat_type: cleanRequiredString(payload.boat_type, "Bateau"),
    brand_name: cleanRequiredString(payload.brand_name, "Marque non renseignée"),
    model_name: cleanRequiredString(payload.model_name, "Modèle non renseigné"),
    year: cleanYearValue(payload.year),
    condition: cleanRequiredString(payload.condition, "Occasion"),
    price_chf: cleanInteger(payload.price_chf, 1, 1),
    vat_included: Boolean(payload.vat_included),
    negotiable: Boolean(payload.negotiable),
    financing_available: Boolean(payload.financing_available),
    engine_count: cleanInteger(payload.engine_count, 0, 0),
    power_hp: cleanInteger(payload.power_hp, 0, 0),
    engine_hours: cleanInteger(payload.engine_hours, 0, 0),
    length_m: cleanDecimal(payload.length_m, 0.01, 0.01),
    beam_m: cleanDecimal(payload.beam_m, 0.01, 0.01),
    trailer_included: Boolean(payload.trailer_included),
    berth_included: Boolean(payload.berth_included),
    license_required: Boolean(payload.license_required),
    electric: Boolean(payload.electric),
    description: cleanRequiredString(payload.description, "Annonce publiée sur Swissnaut."),
    equipment: Array.isArray(payload.equipment) ? payload.equipment : [],
    contact_name: cleanRequiredString(payload.contact_name, "Swissnaut"),
    contact_email: cleanRequiredString(payload.contact_email, "contact@swissnaut.ch"),
    contact_phone: cleanNullableString(payload.contact_phone),
    published_at: status === "published" ? cleanRequiredString(payload.published_at, new Date().toISOString()) : null
  };

  if (keepProfessionalProfile && typeof payload.professional_profile_id === "string" && payload.professional_profile_id) {
    safePayload.professional_profile_id = payload.professional_profile_id;
  }

  return safePayload;
}

function cleanRequiredString(value: unknown, fallback: string) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || fallback;
}

function cleanNullableString(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

function cleanInteger(value: unknown, fallback: number, min = 0) {
  const numberValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  return Math.max(min, Math.round(numberValue));
}

function cleanDecimal(value: unknown, fallback: number, min = 0.01) {
  const numberValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  return Math.max(min, Number(numberValue.toFixed(2)));
}

function cleanYearValue(value: unknown) {
  const currentYear = new Date().getFullYear() + 1;
  const year = cleanInteger(value, currentYear, 1900);
  return Math.min(currentYear, year);
}

function cleanStatusValue(value: unknown) {
  const status = typeof value === "string" ? value : "";
  return ["draft", "pending_review", "published", "paused", "sold", "rejected", "expired", "archived"].includes(status) ? status : "published";
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

function getListingPhotoFiles(formData: FormData): ListingPhotoInput[] {
  const seen = new Set<string>();
  const photos: ListingPhotoInput[] = [];

  const addPhoto = (photo: ListingPhotoInput) => {
    const key = `${photoName(photo)}-${photoSize(photo)}-${photoLastModified(photo)}`;
    if (seen.has(key)) return;
    seen.add(key);
    photos.push(photo);
  };

  formData.getAll("photos").forEach((item) => {
    if (item instanceof File && item.size > 0) addPhoto(item);
  });

  const encodedRaw = formData.get("photoDataUrls");
  if (typeof encodedRaw === "string" && encodedRaw.trim()) {
    try {
      const parsed = JSON.parse(encodedRaw);
      if (Array.isArray(parsed)) {
        parsed
          .filter(isEncodedListingPhoto)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .forEach(addPhoto);
      }
    } catch (error) {
      console.error("Encoded listing photos could not be parsed", error);
    }
  }

  return photos.slice(0, 8);
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
  files: ListingPhotoInput[];
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
    const uploadBody = await photoUploadBody(file);
    const { error: uploadError } = await db.storage
      .from("listing-images")
      .upload(storagePath, uploadBody, {
        contentType: photoType(file),
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

function validateListingImage(file: ListingPhotoInput) {
  if (!acceptedListingImageTypes.has(photoType(file))) {
    throw new Error("Formato de imagen no aceptado. Usa JPG, PNG o WebP.");
  }
  if (photoSize(file) > maxListingImageBytes) {
    throw new Error("Una imagen supera 10 MB.");
  }
}

function imageExtension(file: ListingPhotoInput) {
  if (photoType(file) === "image/png") return "png";
  if (photoType(file) === "image/webp") return "webp";
  return "jpg";
}

async function filesToDataUrls(files: ListingPhotoInput[]) {
  const urls: string[] = [];

  for (const file of files) {
    try {
      validateListingImage(file);
      if (!(file instanceof File)) {
        urls.push(file.dataUrl);
        continue;
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      urls.push(`data:${file.type};base64,${buffer.toString("base64")}`);
    } catch (error) {
      console.error("Listing fallback image skipped", error);
    }
  }

  return urls;
}

function isEncodedListingPhoto(value: unknown): value is EncodedListingPhoto {
  if (!value || typeof value !== "object") return false;
  const photo = value as Partial<EncodedListingPhoto>;
  return (
    typeof photo.name === "string" &&
    typeof photo.type === "string" &&
    acceptedListingImageTypes.has(photo.type) &&
    typeof photo.size === "number" &&
    photo.size > 0 &&
    photo.size <= maxListingImageBytes &&
    typeof photo.dataUrl === "string" &&
    photo.dataUrl.startsWith(`data:${photo.type};base64,`)
  );
}

function photoName(photo: ListingPhotoInput) {
  return photo instanceof File ? photo.name : photo.name;
}

function photoType(photo: ListingPhotoInput) {
  return photo instanceof File ? photo.type : photo.type;
}

function photoSize(photo: ListingPhotoInput) {
  return photo instanceof File ? photo.size : photo.size;
}

function photoLastModified(photo: ListingPhotoInput) {
  return photo instanceof File ? photo.lastModified : photo.lastModified ?? 0;
}

async function photoUploadBody(photo: ListingPhotoInput) {
  if (photo instanceof File) return photo;
  const [, base64 = ""] = photo.dataUrl.split(",");
  return Buffer.from(base64, "base64");
}

function formatSupabaseError(error: SupabaseMutationError) {
  return [error.code, error.message, error.details].filter(Boolean).join(" · ") || "Supabase listing insert failed";
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
  const { data, error } = await db
    .from("professional_profiles")
    .select("id, company_name, public_email, public_phone, phones")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .is("suspended_at", null)
    .maybeSingle();

  if (error && isSchemaCompatibilityError(error)) {
    const fallback = await db
      .from("professional_profiles")
      .select("id, company_name")
      .eq("user_id", userId)
      .maybeSingle();
    return (fallback.data as ProfessionalProfileOwner | null) ?? null;
  }

  if (error) {
    console.error("Professional profile could not be read", error);
    return null;
  }

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
  if (membershipError) {
    console.error("Professional membership could not be read", membershipError);
    return null;
  }

  const professionalProfileId = typeof membership?.professional_profile_id === "string" ? membership.professional_profile_id : null;
  if (!professionalProfileId) return null;

  const { data: memberProfile, error: memberProfileError } = await db
    .from("professional_profiles")
    .select("id, company_name, public_email, public_phone, phones")
    .eq("id", professionalProfileId)
    .is("deleted_at", null)
    .is("suspended_at", null)
    .maybeSingle();

  if (memberProfileError && isSchemaCompatibilityError(memberProfileError)) {
    const fallback = await db
      .from("professional_profiles")
      .select("id, company_name")
      .eq("id", professionalProfileId)
      .maybeSingle();
    return (fallback.data as ProfessionalProfileOwner | null) ?? null;
  }

  if (memberProfileError) {
    console.error("Professional member profile could not be read", memberProfileError);
    return null;
  }

  return (memberProfile as ProfessionalProfileOwner | null) ?? null;
}
