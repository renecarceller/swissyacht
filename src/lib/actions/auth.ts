"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { privateRegisterSchema, professionalRegisterSchema } from "@/lib/validation/listing";
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

  try {
    const admin = createSupabaseAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle<{ role: string }>();

    if (profile?.role === "admin") redirect(`/${locale}/admin` as never);
    if (profile?.role === "professional") {
      redirect(`/${locale}/dashboard/professional` as never);
    }
  } catch {
    // If the profile cannot be read, keep the session and send the user to the general dashboard.
  }

  redirect(`/${locale}/dashboard` as never);
}

export async function registerProfessionalAccountAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const locale = localeFromForm(formData);
  const parsed = professionalRegisterSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    languages: formData.getAll("languages").map(String),
    services: formData.getAll("services").map(String)
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
  } catch (error) {
    console.error("Professional profile creation failed", error);
    return { error: authErrorMessage(locale, "profile") };
  }

  redirect(`/${locale}/dashboard/professional` as never);
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
