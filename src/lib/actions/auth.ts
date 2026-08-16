"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { privateRegisterSchema, professionalProfileUpdateSchema, professionalRegisterSchema } from "@/lib/validation/listing";
import { slugify } from "@/lib/utils";
import { locales } from "@/lib/data/reference";

export type AuthActionState = {
  error: string;
};

type SupabaseMutationError = {
  message?: string;
  code?: string;
  details?: string;
};

function localeFromForm(formData: FormData) {
  const rawLocale = String(formData.get("locale") || "fr");
  return locales.includes(rawLocale as (typeof locales)[number]) ? rawLocale : "fr";
}

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

async function upsertProfileCompat(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  fullPayload: Record<string, unknown>,
  fallbackPayload: Record<string, unknown>
) {
  const { error } = await admin.from("profiles").upsert(fullPayload);
  if (!error) return null;
  if (!isSchemaCompatibilityError(error)) return error;

  const { error: fallbackError } = await admin.from("profiles").upsert(fallbackPayload);
  return fallbackError;
}

export async function registerPrivateAccountAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const locale = localeFromForm(formData);
  const parsed = privateRegisterSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    console.error("Invalid private registration", parsed.error.flatten().fieldErrors);
    return { error: authErrorMessage(locale, "invalid") };
  }

  const values = parsed.data;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: authErrorMessage(locale, "supabase") };

  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        account_type: "private",
        first_name: values.firstName,
        last_name: values.lastName
      }
    }
  });

  if (error) {
    console.error("Private registration failed", error);
    return { error: authErrorMessage(locale, "register") };
  }
  if (!data.user) return { error: authErrorMessage(locale, "register") };

  try {
    const admin = createSupabaseAdminClient();
    const fullName = `${values.firstName} ${values.lastName}`.trim();
    const now = new Date().toISOString();
    const profileError = await upsertProfileCompat(
      admin,
      {
        id: data.user.id,
        role: "private",
        account_type: "private",
        first_name: values.firstName,
        last_name: values.lastName,
        full_name: fullName,
        phone: values.phone,
        preferred_locale: locale,
        terms_accepted_at: now,
        privacy_accepted_at: now,
        updated_at: now
      },
      {
        id: data.user.id,
        role: "private",
        full_name: fullName,
        phone: values.phone,
        preferred_locale: locale,
        updated_at: now
      }
    );

    if (profileError) {
      console.error("Private profile creation failed", profileError);
      return { error: authErrorMessage(locale, "profile") };
    }
  } catch (error) {
    console.error("Private profile creation failed", error);
    return { error: authErrorMessage(locale, "profile") };
  }

  redirect(`/${locale}/dashboard` as never);
}

export async function loginAccountAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const locale = localeFromForm(formData);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const returnTo = safeReturnTo(locale, formData.get("returnTo"));

  if (!email || !password) {
    return { error: authErrorMessage(locale, "login") };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: authErrorMessage(locale, "supabase") };

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    console.error("Login failed", error);
    return { error: authErrorMessage(locale, "login") };
  }

  let role = "";
  try {
    const admin = createSupabaseAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle<{ role: string }>();
    role = profile?.role || "";
  } catch {
    // If the profile cannot be read, keep the session and send the user to the general dashboard.
  }

  if (returnTo) redirect(returnTo as never);
  if (role === "admin") redirect(`/${locale}/admin` as never);
  if (role === "professional") redirect(`/${locale}/dashboard/professional` as never);
  redirect((returnTo || `/${locale}/dashboard`) as never);
}

function safeReturnTo(locale: string, value: FormDataEntryValue | null) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw === `/${locale}` || raw.startsWith(`/${locale}/`)) return raw;
  return "";
}

export async function registerProfessionalAccountAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const locale = localeFromForm(formData);
  const parsed = professionalRegisterSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    languages: formData.getAll("languages").map(String),
    services: formData.getAll("services").map(String),
    specialties: formData.getAll("specialties").map(String)
  });

  if (!parsed.success) {
    console.error("Invalid professional registration", parsed.error.flatten().fieldErrors);
    return { error: authErrorMessage(locale, "invalid") };
  }

  const values = parsed.data;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: authErrorMessage(locale, "supabase") };

  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        account_type: "professional",
        first_name: values.firstName,
        last_name: values.lastName,
        company_name: values.companyName
      }
    }
  });

  if (error) {
    console.error("Professional registration failed", error);
    return { error: authErrorMessage(locale, "register") };
  }
  if (!data.user) return { error: authErrorMessage(locale, "register") };

  const now = new Date().toISOString();

  try {
    const admin = createSupabaseAdminClient();
    const fullName = `${values.firstName} ${values.lastName}`.trim();
    const profileError = await upsertProfileCompat(
      admin,
      {
        id: data.user.id,
        role: "professional",
        account_type: "professional",
        first_name: values.firstName,
        last_name: values.lastName,
        full_name: fullName,
        phone: values.phone,
        preferred_locale: locale,
        terms_accepted_at: now,
        privacy_accepted_at: now,
        updated_at: now
      },
      {
        id: data.user.id,
        role: "professional",
        full_name: fullName,
        phone: values.phone,
        preferred_locale: locale,
        updated_at: now
      }
    );

    if (profileError) {
      console.error("Professional profile user creation failed", profileError);
      return { error: authErrorMessage(locale, "profile") };
    }

    const slugBase = slugify(values.companyName);
    const slug = `${slugBase}-${data.user.id.slice(0, 6)}`;
    const completion = Math.min(
      100,
      20 +
        Number(Boolean(values.companyName)) * 10 +
        Number(Boolean(values.addressLine)) * 10 +
        Number(Boolean(values.description)) * 15 +
        values.languages.length * 5 +
        values.services.length * 3
    );

    const representedBrands = parseMultiValueText(values.representedBrands);
    const galleryUrls = parseMultiValueText(values.galleryUrls).filter((url) => url.startsWith("http://") || url.startsWith("https://"));

    let { data: professionalProfile, error: companyError } = await admin
      .from("professional_profiles")
      .insert({
        user_id: data.user.id,
        company_name: values.companyName,
        legal_name: null,
        professional_type: "broker",
        uid_vat: null,
        founded_year: null,
        approximate_inventory: null,
        slug,
        address_line: values.addressLine,
        postal_code: values.postalCode,
        city: values.city,
        canton: values.canton,
        country: values.country,
        public_phone: values.publicPhone || values.phone,
        public_email: values.publicEmail,
        whatsapp_phone: values.whatsappPhone || null,
        whatsapp_enabled: Boolean(values.whatsappPhone),
        website: values.website || null,
        description: values.description || null,
        logo_path: values.logoUrl || null,
        cover_path: values.coverUrl || null,
        languages: values.languages,
        opening_hours: values.openingHours ? { text: values.openingHours } : {},
        profile_completed_percent: completion,
        published_at: now
      })
      .select("id")
      .single();

    if (companyError && isSchemaCompatibilityError(companyError)) {
      const fallback = await admin
        .from("professional_profiles")
        .insert({
          user_id: data.user.id,
          company_name: values.companyName,
          slug,
          logo_path: values.logoUrl || null,
          address_line: values.addressLine,
          postal_code: values.postalCode,
          city: values.city,
          canton: values.canton,
          website: values.website || null,
          phones: [values.publicPhone || values.phone].filter(Boolean),
          languages: values.languages.length ? values.languages : [locale],
          description: values.description || null
        })
        .select("id")
        .single();
      professionalProfile = fallback.data;
      companyError = fallback.error;
    }

    if (companyError || !professionalProfile) {
      console.error("Professional company profile creation failed", companyError);
      return { error: authErrorMessage(locale, "profile") };
    }

    const { error: memberError } = await admin.from("professional_members").insert({
      professional_profile_id: professionalProfile.id,
      user_id: data.user.id,
      role: "owner",
      accepted_at: now
    });
    if (memberError && !isSchemaCompatibilityError(memberError)) {
      console.error("Professional membership creation failed", memberError);
      return { error: authErrorMessage(locale, "profile") };
    }

    if (values.services.length > 0) {
      const { error: servicesError } = await admin.from("broker_services").insert(
        values.services.map((service) => ({
          professional_profile_id: professionalProfile.id,
          service_code: service
        }))
      );
      if (servicesError && !isSchemaCompatibilityError(servicesError)) {
        console.error("Professional services creation failed", servicesError);
        return { error: authErrorMessage(locale, "profile") };
      }
    }

    if (values.specialties.length > 0) {
      const { error: specialtiesError } = await admin.from("broker_specialties").insert(
        values.specialties.map((specialty) => ({
          professional_profile_id: professionalProfile.id,
          specialty_code: specialty
        }))
      );
      if (specialtiesError && !isSchemaCompatibilityError(specialtiesError)) {
        console.error("Professional specialties creation failed", specialtiesError);
        return { error: authErrorMessage(locale, "profile") };
      }
    }

    if (representedBrands.length > 0) {
      const { error: brandsError } = await admin.from("broker_represented_brands").insert(
        representedBrands.map((brand) => ({
          professional_profile_id: professionalProfile.id,
          brand_name: brand
        }))
      );
      if (brandsError && !isSchemaCompatibilityError(brandsError)) {
        console.error("Professional represented brands creation failed", brandsError);
        return { error: authErrorMessage(locale, "profile") };
      }
    }

    if (galleryUrls.length > 0) {
      const { error: galleryError } = await admin.from("broker_gallery").insert(
        galleryUrls.map((url, index) => ({
          professional_profile_id: professionalProfile.id,
          storage_path: url,
          public_url: url,
          alt_text: values.companyName,
          sort_order: index
        }))
      );
      if (galleryError && !isSchemaCompatibilityError(galleryError)) {
        console.error("Professional gallery creation failed", galleryError);
        return { error: authErrorMessage(locale, "profile") };
      }
    }
  } catch (error) {
    console.error("Professional profile creation failed", error);
    return { error: authErrorMessage(locale, "profile") };
  }

  redirect(`/${locale}/dashboard/professional` as never);
}

export async function updateProfessionalProfileAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const locale = localeFromForm(formData);
  const parsed = professionalProfileUpdateSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    languages: formData.getAll("languages").map(String),
    services: formData.getAll("services").map(String),
    specialties: formData.getAll("specialties").map(String)
  });

  if (!parsed.success) {
    console.error("Invalid professional profile update", parsed.error.flatten().fieldErrors);
    return { error: authErrorMessage(locale, "invalid") };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: authErrorMessage(locale, "supabase") };

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: authErrorMessage(locale, "login") };

  const values = parsed.data;
  const now = new Date().toISOString();
  const representedBrands = parseMultiValueText(values.representedBrands);
  const galleryUrls = parseMultiValueText(values.galleryUrls).filter((url) => url.startsWith("http://") || url.startsWith("https://"));

  try {
    const admin = createSupabaseAdminClient();
    const { data: professionalProfile, error: profileReadError } = await admin
      .from("professional_profiles")
      .select("id")
      .eq("user_id", userData.user.id)
      .is("deleted_at", null)
      .maybeSingle<{ id: string }>();

    if (profileReadError || !professionalProfile) {
      console.error("Professional profile not found", profileReadError);
      return { error: authErrorMessage(locale, "profile") };
    }

    const completion = Math.min(
      100,
      20 +
        Number(Boolean(values.companyName)) * 10 +
        Number(Boolean(values.addressLine)) * 10 +
        Number(Boolean(values.description)) * 15 +
        values.languages.length * 5 +
        values.services.length * 3 +
        values.specialties.length * 3 +
        representedBrands.length * 2
    );

    const { error: updateError } = await admin
      .from("professional_profiles")
      .update({
        company_name: values.companyName,
        logo_path: values.logoUrl || null,
        cover_path: values.coverUrl || null,
        address_line: values.addressLine || null,
        postal_code: values.postalCode || null,
        city: values.city || null,
        canton: values.canton || null,
        country: values.country || "Switzerland",
        public_phone: values.publicPhone || null,
        public_email: values.publicEmail || null,
        whatsapp_phone: values.whatsappPhone || null,
        whatsapp_enabled: Boolean(values.whatsappPhone),
        website: values.website || null,
        description: values.description || null,
        languages: values.languages,
        opening_hours: values.openingHours ? { text: values.openingHours } : {},
        profile_completed_percent: completion,
        updated_at: now
      })
      .eq("id", professionalProfile.id);

    if (updateError) {
      console.error("Professional profile update failed", updateError);
      return { error: authErrorMessage(locale, "profile") };
    }

    await replaceBrokerRows(admin, "broker_services", professionalProfile.id, values.services, "service_code");
    await replaceBrokerRows(admin, "broker_specialties", professionalProfile.id, values.specialties, "specialty_code");
    await replaceBrokerRows(admin, "broker_represented_brands", professionalProfile.id, representedBrands, "brand_name");

    const { error: deleteGalleryError } = await admin.from("broker_gallery").delete().eq("professional_profile_id", professionalProfile.id);
    if (deleteGalleryError && !isSchemaCompatibilityError(deleteGalleryError)) {
      console.error("Professional gallery delete failed", deleteGalleryError);
      return { error: authErrorMessage(locale, "profile") };
    }
    if (galleryUrls.length > 0) {
      const { error: galleryError } = await admin.from("broker_gallery").insert(
        galleryUrls.map((url, index) => ({
          professional_profile_id: professionalProfile.id,
          storage_path: url,
          public_url: url,
          alt_text: values.companyName,
          sort_order: index
        }))
      );
      if (galleryError && !isSchemaCompatibilityError(galleryError)) {
        console.error("Professional gallery update failed", galleryError);
        return { error: authErrorMessage(locale, "profile") };
      }
    }
  } catch (error) {
    console.error("Professional profile update failed", error);
    return { error: authErrorMessage(locale, "profile") };
  }

  redirect(`/${locale}/dashboard/profile?saved=1` as never);
}

export async function updateProfessionalProfileFormAction(formData: FormData) {
  await updateProfessionalProfileAction({ error: "" }, formData);
}

async function replaceBrokerRows(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  table: "broker_services" | "broker_specialties" | "broker_represented_brands",
  professionalProfileId: string,
  values: string[],
  column: "service_code" | "specialty_code" | "brand_name"
) {
  const { error: deleteError } = await admin.from(table).delete().eq("professional_profile_id", professionalProfileId);
  if (deleteError && !isSchemaCompatibilityError(deleteError)) throw deleteError;
  if (!values.length) return;

  const { error } = await admin.from(table).insert(
    values.map((value) => ({
      professional_profile_id: professionalProfileId,
      [column]: value
    }))
  );
  if (error && !isSchemaCompatibilityError(error)) throw error;
}

function parseMultiValueText(value: string) {
  return value
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, all) => all.findIndex((candidate) => candidate.toLowerCase() === item.toLowerCase()) === index);
}

function authErrorMessage(locale: string, reason: "invalid" | "supabase" | "register" | "profile" | "login") {
  const messages = {
    invalid: {
      fr: "Veuillez vérifier les champs obligatoires.",
      de: "Bitte prüfen Sie die Pflichtfelder.",
      it: "Controlla i campi obbligatori.",
      en: "Please check the required fields."
    },
    supabase: {
      fr: "Supabase n'est pas encore correctement connecté.",
      de: "Supabase ist noch nicht korrekt verbunden.",
      it: "Supabase non è ancora collegato correttamente.",
      en: "Supabase is not connected correctly yet."
    },
    register: {
      fr: "Le compte n'a pas pu être créé. Vérifiez l'email, le mot de passe ou si le compte existe déjà.",
      de: "Das Konto konnte nicht erstellt werden. Prüfen Sie E-Mail, Passwort oder ob das Konto bereits existiert.",
      it: "Non è stato possibile creare l'account. Verifica email, password o se l'account esiste già.",
      en: "The account could not be created. Check the email, password or whether the account already exists."
    },
    profile: {
      fr: "Le compte a été créé, mais le profil n'a pas pu être finalisé. Vérifiez les migrations Supabase.",
      de: "Das Konto wurde erstellt, aber das Profil konnte nicht abgeschlossen werden. Prüfen Sie die Supabase-Migrationen.",
      it: "L'account è stato creato, ma il profilo non è stato completato. Verifica le migrazioni Supabase.",
      en: "The account was created, but the profile could not be completed. Check the Supabase migrations."
    },
    login: {
      fr: "Connexion impossible. Vérifiez votre email et votre mot de passe.",
      de: "Anmeldung nicht möglich. Prüfen Sie E-Mail und Passwort.",
      it: "Accesso non riuscito. Verifica email e password.",
      en: "Sign in failed. Check your email and password."
    }
  };

  return messages[reason][locale as keyof (typeof messages)[typeof reason]] ?? messages[reason].fr;
}
