"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { privateRegisterSchema, professionalProfileUpdateSchema, professionalRegisterSchema } from "@/lib/validation/listing";
import { slugify } from "@/lib/utils";
import { locales } from "@/lib/data/reference";

export type AuthActionState = {
  error: string;
};

type AccountMetadata = Record<string, string>;

type SupabaseMutationError = {
  message?: string;
  code?: string;
  details?: string;
};

type SignInFailureReason = "supabase" | "login" | "confirm";
type AuthFailureReason = "invalid" | "register" | "profile" | "existing" | SignInFailureReason;
type AuthUserCreationResult = { ok: true; user: SignedInUser } | { ok: false; reason: AuthFailureReason; error: string };
type SignedInUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
  email_confirmed_at?: string | null;
};

function localeFromForm(formData: FormData) {
  const rawLocale = String(formData.get("locale") || "fr");
  return locales.includes(rawLocale as (typeof locales)[number]) ? rawLocale : "fr";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
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
  client: SupabaseClient,
  fullPayload: Record<string, unknown>,
  fallbackPayload: Record<string, unknown>
) {
  const { error } = await client.from("profiles").upsert(fullPayload);
  if (!error) return null;
  if (!isSchemaCompatibilityError(error)) return error;

  const { error: fallbackError } = await client.from("profiles").upsert(fallbackPayload);
  return fallbackError;
}

function tryCreateSupabaseAdminClient() {
  try {
    return createSupabaseAdminClient();
  } catch (error) {
    console.error("Supabase admin client unavailable", error);
    return null;
  }
}

async function createSupabaseMutationClient() {
  const admin = tryCreateSupabaseAdminClient();
  if (admin) return admin;
  return createSupabaseServerClient();
}

function logAccountSetupWarning(step: string, error: unknown) {
  console.warn(`[auth] ${step} failed but the authenticated session can continue`, error);
}

export async function registerPrivateAccountAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const locale = localeFromForm(formData);
  const returnTo = safeReturnTo(locale, formData.get("returnTo"));
  const parsed = privateRegisterSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    console.error("Invalid private registration", parsed.error.flatten().fieldErrors);
    return { error: authErrorMessage(locale, "invalid") };
  }

  const values = parsed.data;
  const email = normalizeEmail(values.email);
  const authUser = await createConfirmedAuthUser(locale, email, values.password, {
    account_type: "private",
    first_name: values.firstName,
    last_name: values.lastName,
    phone: values.phone
  });

  if (!authUser.ok) {
    if (authUser.reason === "existing") {
      const existingSignIn = await signInConfirmedAccount(email, values.password);
      if (existingSignIn.ok && existingSignIn.data.user) {
        const role = await ensureProfileForSignedInUser(existingSignIn.data.user as SignedInUser, locale);
        redirectAfterAuthenticated(locale, returnTo, role);
      }
    }

    return { error: authUser.error };
  }

  const signedIn = await signInConfirmedAccount(email, values.password);
  if (!signedIn.ok) return { error: authErrorMessage(locale, signedIn.reason ?? "login") };

  try {
    const supabase = await createSupabaseMutationClient();
    if (!supabase) return { error: authErrorMessage(locale, "supabase") };
    const fullName = `${values.firstName} ${values.lastName}`.trim();
    const now = new Date().toISOString();
    const profileError = await upsertProfileCompat(
      supabase,
      {
        id: authUser.user.id,
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
        id: authUser.user.id,
        role: "private",
        full_name: fullName,
        phone: values.phone,
        preferred_locale: locale,
        updated_at: now
      }
    );

    if (profileError) {
      logAccountSetupWarning("private profile creation", profileError);
    }
  } catch (error) {
    logAccountSetupWarning("private profile creation", error);
  }

  redirect((returnTo || `/${locale}/dashboard`) as never);
}

export async function loginAccountAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const locale = localeFromForm(formData);
  const email = normalizeEmail(String(formData.get("email") || ""));
  const password = String(formData.get("password") || "");
  const returnTo = safeReturnTo(locale, formData.get("returnTo"));

  if (!email || !password) {
    return { error: authErrorMessage(locale, "login") };
  }

  const { data, error, reason } = await signInConfirmedAccount(email, password);
  if (error || !data.user) {
    console.error("Login failed", error);
    return { error: authErrorMessage(locale, reason ?? "login") };
  }

  let role = "";
  try {
    role = await ensureProfileForSignedInUser(data.user as SignedInUser, locale);
  } catch (error) {
    logAccountSetupWarning("signed-in profile repair", error);
    role = roleFromUserMetadata(data.user as SignedInUser);
  }

  if (returnTo) redirect(returnTo as never);
  if (role === "admin") redirect(`/${locale}/admin` as never);
  if (role === "professional") redirect(`/${locale}/dashboard/professional` as never);
  redirect((returnTo || `/${locale}/dashboard`) as never);
}

export async function logoutAccountAction(formData: FormData) {
  const locale = localeFromForm(formData);
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect(`/${locale}` as never);
}

function safeReturnTo(locale: string, value: FormDataEntryValue | null) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw === `/${locale}` || raw.startsWith(`/${locale}/`)) return raw;
  return "";
}

export async function registerProfessionalAccountAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const locale = localeFromForm(formData);
  const returnTo = safeReturnTo(locale, formData.get("returnTo"));
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
  const email = normalizeEmail(values.email);
  const authUser = await createConfirmedAuthUser(locale, email, values.password, {
    account_type: "professional",
    first_name: values.firstName,
    last_name: values.lastName,
    phone: values.phone,
    company_name: values.companyName
  });

  if (!authUser.ok) {
    if (authUser.reason === "existing") {
      const existingSignIn = await signInConfirmedAccount(email, values.password);
      if (existingSignIn.ok && existingSignIn.data.user) {
        const role = await ensureProfileForSignedInUser(existingSignIn.data.user as SignedInUser, locale);
        redirectAfterAuthenticated(locale, returnTo, role);
      }
    }

    return { error: authUser.error };
  }

  const signedIn = await signInConfirmedAccount(email, values.password);
  if (!signedIn.ok) return { error: authErrorMessage(locale, signedIn.reason ?? "login") };

  const now = new Date().toISOString();

  try {
    const admin = await createSupabaseMutationClient();
    if (!admin) return { error: authErrorMessage(locale, "supabase") };
    const fullName = `${values.firstName} ${values.lastName}`.trim();
    const profileError = await upsertProfileCompat(
      admin,
      {
        id: authUser.user.id,
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
        id: authUser.user.id,
        role: "professional",
        full_name: fullName,
        phone: values.phone,
        preferred_locale: locale,
        updated_at: now
      }
    );

    if (profileError) {
      logAccountSetupWarning("professional user profile creation", profileError);
    }

    const slugBase = slugify(values.companyName);
    const slug = `${slugBase}-${authUser.user.id.slice(0, 6)}`;
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
        user_id: authUser.user.id,
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
          user_id: authUser.user.id,
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
      logAccountSetupWarning("professional company profile creation", companyError);
      redirect((returnTo || `/${locale}/dashboard/professional`) as never);
    }

    const { error: memberError } = await admin.from("professional_members").insert({
      professional_profile_id: professionalProfile.id,
      user_id: authUser.user.id,
      role: "owner",
      accepted_at: now
    });
    if (memberError && !isSchemaCompatibilityError(memberError)) {
      logAccountSetupWarning("professional membership creation", memberError);
    }

    if (values.services.length > 0) {
      const { error: servicesError } = await admin.from("broker_services").insert(
        values.services.map((service) => ({
          professional_profile_id: professionalProfile.id,
          service_code: service
        }))
      );
      if (servicesError && !isSchemaCompatibilityError(servicesError)) {
        logAccountSetupWarning("professional services creation", servicesError);
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
        logAccountSetupWarning("professional specialties creation", specialtiesError);
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
        logAccountSetupWarning("professional represented brands creation", brandsError);
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
        logAccountSetupWarning("professional gallery creation", galleryError);
      }
    }
  } catch (error) {
    logAccountSetupWarning("professional profile creation", error);
  }

  redirect((returnTo || `/${locale}/dashboard/professional`) as never);
}

function redirectAfterAuthenticated(locale: string, returnTo: string, role: string) {
  if (returnTo) redirect(returnTo as never);
  if (role === "admin") redirect(`/${locale}/admin` as never);
  if (role === "professional") redirect(`/${locale}/dashboard/professional` as never);
  redirect(`/${locale}/dashboard` as never);
}

function roleFromUserMetadata(user: SignedInUser) {
  const normalizedEmail = normalizeEmail(user.email || "");
  const metadata = user.user_metadata || {};
  const appMetadata = user.app_metadata || {};

  if (normalizedEmail === "director@swissnaut.ch") return "admin";
  if (appMetadata.account_type === "professional" || metadata.account_type === "professional") return "professional";
  return "private";
}

async function createConfirmedAuthUser(locale: string, email: string, password: string, metadata: AccountMetadata): Promise<AuthUserCreationResult> {
  const admin = tryCreateSupabaseAdminClient();

  if (admin) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: {
        account_type: metadata.account_type
      },
      user_metadata: metadata
    });

    if (error || !data.user) {
      console.error("Confirmed auth user creation failed", error);
      if (isAuthUserAlreadyExistsError(error)) {
        return { ok: false, reason: "existing", error: authErrorMessage(locale, "existing") };
      }

      return createAuthUserWithSignup(locale, email, password, metadata);
    }

    return { ok: true as const, user: data.user };
  }

  return createAuthUserWithSignup(locale, email, password, metadata);
}

async function createAuthUserWithSignup(
  locale: string,
  email: string,
  password: string,
  metadata: AccountMetadata
): Promise<AuthUserCreationResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, reason: "supabase", error: authErrorMessage(locale, "supabase") };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });

  const identities = (data.user as { identities?: unknown[] } | null)?.identities;
  if (error || !data.user || (Array.isArray(identities) && identities.length === 0)) {
    console.error("Auth user signup failed", error);
    const reason = isAuthUserAlreadyExistsError(error) || Array.isArray(identities) ? "existing" : "register";
    return { ok: false, reason, error: authErrorMessage(locale, reason) };
  }

  const createdUser = data.user as SignedInUser;
  if (!data.session && !createdUser.email_confirmed_at) {
    console.error("Auth user signup requires email confirmation. Add SUPABASE_SERVICE_ROLE_KEY to create confirmed users directly.");
    return { ok: false, reason: "confirm", error: authErrorMessage(locale, "confirm") };
  }

  return { ok: true as const, user: createdUser };
}

async function signInConfirmedAccount(email: string, password: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, reason: "supabase" as const, data: { user: null }, error: new Error("Supabase client unavailable") };

  let result;
  try {
    result = await supabase.auth.signInWithPassword({ email: normalizeEmail(email), password });
  } catch (error) {
    console.error("Login request failed", error);
    return { ok: false, reason: "supabase" as const, data: { user: null }, error };
  }

  if (result.error && !result.data.user) {
    const repair = await repairExistingAuthUserEmail(email);
    if (repair === "confirmed") {
      try {
        result = await supabase.auth.signInWithPassword({ email: normalizeEmail(email), password });
      } catch (error) {
        console.error("Login retry after confirmation failed", error);
        return { ok: false, reason: "supabase" as const, data: { user: null }, error };
      }
    } else if (repair === "needsConfirmation") {
      return { ok: false, reason: "confirm" as const, ...result };
    }
  }

  if (!isEmailConfirmationError(result.error) || result.data.user) {
    return { ok: !result.error && Boolean(result.data.user), reason: result.error ? ("login" as const) : undefined, ...result };
  }

  return { ok: false, reason: "confirm" as const, ...result };
}

function isEmailConfirmationError(error: unknown) {
  const issue = error as SupabaseMutationError | null;
  const text = `${issue?.message || ""} ${issue?.code || ""}`.toLowerCase();
  return text.includes("email not confirmed") || text.includes("not confirmed") || text.includes("confirm");
}

function isAuthUserAlreadyExistsError(error: unknown) {
  const issue = error as SupabaseMutationError | null;
  const text = `${issue?.message || ""} ${issue?.code || ""} ${issue?.details || ""}`.toLowerCase();
  return text.includes("already") || text.includes("exists") || text.includes("registered") || text.includes("duplicate");
}

async function repairExistingAuthUserEmail(email: string): Promise<"confirmed" | "needsConfirmation" | "notFound" | "unavailable" | "alreadyConfirmed"> {
  try {
    const admin = tryCreateSupabaseAdminClient();
    if (!admin) return "unavailable";
    const { data: users, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listError) {
      console.error("Auth user lookup failed", listError);
      return "unavailable";
    }

    const normalized = normalizeEmail(email);
    const user = users.users.find((candidate) => candidate.email?.toLowerCase() === normalized);
    if (!user) return "notFound";
    if (user.email_confirmed_at) return "alreadyConfirmed";

    const { error: confirmError } = await admin.auth.admin.updateUserById(user.id, { email_confirm: true });
    if (confirmError) {
      console.error("Auth user confirmation failed", confirmError);
      return "needsConfirmation";
    }

    return "confirmed";
  } catch (error) {
    console.error("Auth user confirmation failed", error);
    return "unavailable";
  }
}

async function ensureProfileForSignedInUser(user: SignedInUser, locale: string) {
  try {
    const admin = await createSupabaseMutationClient();
    if (!admin) return "";
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle<{ role: string | null }>();

    if (profile?.role) return profile.role;

    const metadata = user.user_metadata || {};
    const firstName = typeof metadata.first_name === "string" ? metadata.first_name : "";
    const lastName = typeof metadata.last_name === "string" ? metadata.last_name : "";
    const phone = typeof metadata.phone === "string" ? metadata.phone : user.phone || null;
    const fullName = `${firstName} ${lastName}`.trim() || user.email || "Compte Swissnaut";
    const role = roleFromUserMetadata(user);
    const now = new Date().toISOString();

    const profileError = await upsertProfileCompat(
      admin,
      {
        id: user.id,
        role,
        account_type: role === "admin" ? "admin" : role,
        first_name: firstName || null,
        last_name: lastName || null,
        full_name: fullName,
        phone,
        preferred_locale: locale,
        updated_at: now
      },
      {
        id: user.id,
        role,
        full_name: fullName,
        phone,
        preferred_locale: locale,
        updated_at: now
      }
    );

    if (profileError) console.error("Signed-in profile repair failed", profileError);
    return role;
  } catch (error) {
    console.error("Signed-in profile repair failed", error);
    return "";
  }
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

  let userData;
  try {
    ({ data: userData } = await supabase.auth.getUser());
  } catch (error) {
    console.error("Professional profile session read failed", error);
    return { error: authErrorMessage(locale, "supabase") };
  }

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
  admin: SupabaseClient,
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

function authErrorMessage(locale: string, reason: AuthFailureReason) {
  const messages = {
    invalid: {
      fr: "Veuillez vérifier tous les champs obligatoires, le mot de passe et l'acceptation des conditions.",
      de: "Bitte prüfen Sie alle Pflichtfelder, das Passwort und die Zustimmung zu den Bedingungen.",
      it: "Controlla tutti i campi obbligatori, la password e l'accettazione delle condizioni.",
      en: "Please check all required fields, the password and the acceptance of the terms."
    },
    supabase: {
      fr: "Supabase n'est pas correctement connecté. Vérifiez les variables Supabase du projet.",
      de: "Supabase ist nicht korrekt verbunden. Prüfen Sie die Supabase-Variablen des Projekts.",
      it: "Supabase non è collegato correttamente. Verifica le variabili Supabase del progetto.",
      en: "Supabase is not connected correctly. Check the project's Supabase variables."
    },
    register: {
      fr: "Le compte n'a pas pu être créé. Vérifiez l'email, le mot de passe ou si le compte existe déjà.",
      de: "Das Konto konnte nicht erstellt werden. Prüfen Sie E-Mail, Passwort oder ob das Konto bereits existiert.",
      it: "Non è stato possibile creare l'account. Verifica email, password o se l'account esiste già.",
      en: "The account could not be created. Check the email, password or whether the account already exists."
    },
    existing: {
      fr: "Ce compte existe déjà. Utilisez l'onglet Se connecter avec le même email et mot de passe.",
      de: "Dieses Konto existiert bereits. Nutzen Sie den Tab Anmelden mit derselben E-Mail und demselben Passwort.",
      it: "Questo account esiste già. Usa la scheda Accedi con la stessa email e password.",
      en: "This account already exists. Use the Sign in tab with the same email and password."
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
    },
    confirm: {
      fr: "Ce compte existe, mais il n'est pas encore activé. Vérifiez l'email de confirmation ou la clé serveur Supabase.",
      de: "Dieses Konto existiert, ist aber noch nicht aktiviert. Prüfen Sie die Bestätigungs-E-Mail oder den Supabase-Serverschlüssel.",
      it: "Questo account esiste, ma non è ancora attivo. Controlla l'email di conferma o la chiave server Supabase.",
      en: "This account exists, but it is not active yet. Check the confirmation email or the Supabase server key."
    }
  };

  return messages[reason][locale as keyof (typeof messages)[typeof reason]] ?? messages[reason].fr;
}
