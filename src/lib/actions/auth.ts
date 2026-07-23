"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { privateRegisterSchema, professionalRegisterSchema } from "@/lib/validation/listing";
import { slugify } from "@/lib/utils";
import { locales } from "@/lib/data/reference";

function localeFromForm(formData: FormData) {
  const rawLocale = String(formData.get("locale") || "fr");
  return locales.includes(rawLocale as (typeof locales)[number]) ? rawLocale : "fr";
}

export async function registerPrivateAccountAction(formData: FormData) {
  const locale = localeFromForm(formData);
  const parsed = privateRegisterSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    throw new Error(`Invalid private registration: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
  }

  const values = parsed.data;
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase is not configured.");

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

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Supabase did not return a user.");

  const admin = createSupabaseAdminClient();
  const { error: profileError } = await admin.from("profiles").upsert({
    id: data.user.id,
    role: "private",
    account_type: "private",
    first_name: values.firstName,
    last_name: values.lastName,
    full_name: `${values.firstName} ${values.lastName}`.trim(),
    phone: values.phone,
    preferred_locale: locale,
    terms_accepted_at: new Date().toISOString(),
    privacy_accepted_at: new Date().toISOString()
  });

  if (profileError) throw new Error(profileError.message);
  redirect(`/${locale}/dashboard` as never);
}

export async function registerProfessionalAccountAction(formData: FormData) {
  const locale = localeFromForm(formData);
  const parsed = professionalRegisterSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    languages: formData.getAll("languages").map(String),
    services: formData.getAll("services").map(String)
  });

  if (!parsed.success) {
    throw new Error(`Invalid professional registration: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
  }

  const values = parsed.data;
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase is not configured.");

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

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Supabase did not return a user.");

  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { error: profileError } = await admin.from("profiles").upsert({
    id: data.user.id,
    role: "professional",
    account_type: "professional",
    first_name: values.firstName,
    last_name: values.lastName,
    full_name: `${values.firstName} ${values.lastName}`.trim(),
    phone: values.phone,
    preferred_locale: locale,
    terms_accepted_at: now,
    privacy_accepted_at: now
  });

  if (profileError) throw new Error(profileError.message);

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

  const { data: professionalProfile, error: companyError } = await admin
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

  if (companyError) throw new Error(companyError.message);
  if (!professionalProfile) throw new Error("Professional profile was not created.");

  const { error: memberError } = await admin.from("professional_members").insert({
    professional_profile_id: professionalProfile.id,
    user_id: data.user.id,
    role: "owner",
    accepted_at: now
  });
  if (memberError) throw new Error(memberError.message);

  if (values.services.length > 0) {
    const { error: servicesError } = await admin.from("broker_services").insert(
      values.services.map((service) => ({
        professional_profile_id: professionalProfile.id,
        service_code: service
      }))
    );
    if (servicesError) throw new Error(servicesError.message);
  }

  redirect(`/${locale}/dashboard/professional` as never);
}
