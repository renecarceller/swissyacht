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
  const listing = await saveListing(values, slug, status, locale);

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

async function saveListing(values: ListingFormValues, slug: string, status: "draft" | "published", locale: string) {
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

    await admin.from("profiles").upsert({
      id: userId,
      role: data.user.user_metadata?.account_type === "professional" ? "professional" : "private",
      account_type: data.user.user_metadata?.account_type === "professional" ? "professional" : "private",
      full_name: fullName,
      phone: values.contactPhone || null,
      preferred_locale: locale,
      updated_at: now
    });

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

    const { data: listing, error } = await admin
      .from("listings")
      .insert({
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
      })
      .select("slug")
      .single();

    if (error) throw new Error(error.message);
    if (!listing?.slug) throw new Error("Supabase did not return the listing slug.");

    return { slug: listing.slug, brand: values.brand, model: values.model };
  } catch (error) {
    console.error("Supabase listing save failed; using local fallback", error);
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      throw new Error("No se pudo publicar el anuncio en Supabase. Revisa que las migraciones de base de datos esten aplicadas.");
    }
    return saveUserListing(values, slug, status);
  }
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

  const { data: membership } = await admin
    .from("professional_members")
    .select("professional_profile_id")
    .eq("user_id", userId)
    .not("accepted_at", "is", null)
    .in("role", ["owner", "admin", "editor"])
    .limit(1)
    .maybeSingle();

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
