import { Building2, Mail, Phone, ShipWheel, UserRound } from "lucide-react";
import { RegisterAccountForm } from "@/components/forms/register-account-form";
import { Link } from "@/i18n/routing";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AccountProfile = {
  id: string;
  role?: string | null;
  account_type?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  phone?: string | null;
  preferred_locale?: string | null;
};

type CompanyProfile = {
  id: string;
  slug?: string | null;
  company_name?: string | null;
  address_line?: string | null;
  postal_code?: string | null;
  city?: string | null;
  canton?: string | null;
  country?: string | null;
  public_phone?: string | null;
  public_email?: string | null;
  website?: string | null;
  description?: string | null;
  languages?: string[] | null;
  opening_hours?: { text?: string } | null;
};

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const labels = accountLabels(locale);
  const supabase = await createSupabaseServerClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!data.user) {
    return (
      <main className="bg-[#f6f8fb] py-10">
        <div className="container-shell">
          <RegisterAccountForm locale={locale} />
        </div>
      </main>
    );
  }

  const account = await getAccountProfile(data.user.id);
  const company = await getCompanyProfile(data.user.id);
  const displayName = account?.full_name || [account?.first_name, account?.last_name].filter(Boolean).join(" ") || data.user.email || labels.account;
  const isProfessional = Boolean(company || account?.account_type === "professional" || account?.role === "professional");

  return (
    <main className="bg-[#f6f8fb] py-8">
      <div className="container-shell grid gap-6">
        <section className="rounded-md border border-[#d9e2ec] bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase text-[#0f6fae]">{labels.account}</p>
              <h1 className="mt-2 text-3xl font-bold text-navy">{displayName}</h1>
              <p className="mt-2 text-[#607085]">{isProfessional ? labels.professionalIntro : labels.privateIntro}</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-md bg-[#e8f6ff] px-3 py-2 text-sm font-bold text-[#06233f]">
              {isProfessional ? <Building2 size={17} /> : <UserRound size={17} />}
              {isProfessional ? labels.professional : labels.private}
            </span>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-md border border-[#d9e2ec] bg-white p-6">
            <h2 className="mb-5 text-2xl font-bold text-navy">{isProfessional ? labels.companyInfo : labels.accountInfo}</h2>
            {isProfessional && company ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Info label={labels.companyName} value={company.company_name} />
                <Info label={labels.address} value={[company.address_line, company.postal_code, company.city, company.canton, company.country].filter(Boolean).join(", ")} />
                <Info label={labels.phone} value={company.public_phone || account?.phone} />
                <Info label={labels.email} value={company.public_email || data.user.email} />
                <Info label={labels.website} value={company.website} />
                <Info label={labels.languages} value={company.languages?.map((item) => item.toUpperCase()).join(", ")} />
                <Info label={labels.hours} value={company.opening_hours?.text} />
                <Info label={labels.description} value={company.description} wide />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <Info label={labels.name} value={displayName} />
                <Info label={labels.email} value={data.user.email} />
                <Info label={labels.phone} value={account?.phone} />
                <Info label={labels.language} value={(account?.preferred_locale || locale).toUpperCase()} />
              </div>
            )}
          </section>

          <aside className="grid content-start gap-4">
            <Link href="/dashboard" locale={locale} className="flex h-12 items-center justify-center gap-2 rounded-md bg-[#8bd3ff] font-bold text-[#06233f] shadow-[0_3px_0_#58b9e8]">
              <UserRound size={18} />
              {labels.dashboard}
            </Link>
            {isProfessional ? (
              <>
                <Link href="/dashboard/professional" locale={locale} className="flex h-12 items-center justify-center gap-2 rounded-md border border-[#cbd7e4] bg-white font-bold text-navy">
                  <Building2 size={18} />
                  {labels.professionalDashboard}
                </Link>
                {company?.slug ? (
                  <Link href={`/brokers/${company.slug}`} locale={locale} className="flex h-12 items-center justify-center gap-2 rounded-md border border-[#cbd7e4] bg-white font-bold text-navy">
                    <ShipWheel size={18} />
                    {labels.publicProfile}
                  </Link>
                ) : null}
              </>
            ) : null}
            <Link href="/sell" locale={locale} className="flex h-12 items-center justify-center gap-2 rounded-md border border-[#cbd7e4] bg-white font-bold text-navy">
              <ShipWheel size={18} />
              {labels.createListing}
            </Link>
            <div className="rounded-md border border-[#d9e2ec] bg-white p-4 text-sm text-[#607085]">
              <div className="mb-2 flex items-center gap-2 font-bold text-navy"><Mail size={17} />{labels.session}</div>
              <p>{data.user.email}</p>
              {account?.phone ? <p className="mt-2 flex items-center gap-2"><Phone size={15} />{account.phone}</p> : null}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

async function getAccountProfile(userId: string) {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    return data as AccountProfile | null;
  } catch {
    return null;
  }
}

async function getCompanyProfile(userId: string) {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase.from("professional_profiles").select("*").eq("user_id", userId).is("deleted_at", null).maybeSingle();
    return data as CompanyProfile | null;
  } catch {
    return null;
  }
}

function Info({ label, value, wide = false }: { label: string; value: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`rounded-md bg-[#f6f8fb] p-4 ${wide ? "md:col-span-2" : ""}`}>
      <div className="text-xs font-bold uppercase text-[#607085]">{label}</div>
      <div className="mt-1 font-semibold text-[#21354b]">{value || "-"}</div>
    </div>
  );
}

function accountLabels(locale: string) {
  const dictionaries = {
    fr: {
      account: "Compte",
      private: "Particulier",
      professional: "Professionnel",
      privateIntro: "Informations de votre compte particulier SwissYacht.",
      professionalIntro: "Informations de votre entreprise et de votre compte professionnel SwissYacht.",
      accountInfo: "Informations du compte",
      companyInfo: "Informations de l'entreprise",
      companyName: "Nom de l'entreprise",
      address: "Adresse",
      phone: "Telephone",
      email: "Email",
      website: "Page web",
      languages: "Langues",
      hours: "Horaires",
      description: "Description",
      name: "Nom",
      language: "Langue",
      dashboard: "Tableau de bord",
      professionalDashboard: "Panel professionnel",
      publicProfile: "Profil public",
      createListing: "Publier une annonce",
      session: "Session"
    },
    de: {
      account: "Konto",
      private: "Privat",
      professional: "Professionell",
      privateIntro: "Informationen zu Ihrem privaten SwissYacht-Konto.",
      professionalIntro: "Informationen zu Ihrer Firma und Ihrem SwissYacht-Profi-Konto.",
      accountInfo: "Kontoinformationen",
      companyInfo: "Unternehmensinformationen",
      companyName: "Firmenname",
      address: "Adresse",
      phone: "Telefon",
      email: "E-Mail",
      website: "Webseite",
      languages: "Sprachen",
      hours: "Oeffnungszeiten",
      description: "Beschreibung",
      name: "Name",
      language: "Sprache",
      dashboard: "Dashboard",
      professionalDashboard: "Profi-Bereich",
      publicProfile: "Oeffentliches Profil",
      createListing: "Inserat erstellen",
      session: "Sitzung"
    },
    it: {
      account: "Account",
      private: "Privato",
      professional: "Professionale",
      privateIntro: "Informazioni del tuo account privato SwissYacht.",
      professionalIntro: "Informazioni della tua azienda e del tuo account professionale SwissYacht.",
      accountInfo: "Informazioni account",
      companyInfo: "Informazioni azienda",
      companyName: "Nome azienda",
      address: "Indirizzo",
      phone: "Telefono",
      email: "Email",
      website: "Sito web",
      languages: "Lingue",
      hours: "Orari",
      description: "Descrizione",
      name: "Nome",
      language: "Lingua",
      dashboard: "Pannello",
      professionalDashboard: "Pannello professionale",
      publicProfile: "Profilo pubblico",
      createListing: "Pubblica annuncio",
      session: "Sessione"
    },
    en: {
      account: "Account",
      private: "Private seller",
      professional: "Professional",
      privateIntro: "Information for your private SwissYacht account.",
      professionalIntro: "Information for your company and professional SwissYacht account.",
      accountInfo: "Account information",
      companyInfo: "Company information",
      companyName: "Company name",
      address: "Address",
      phone: "Phone",
      email: "Email",
      website: "Website",
      languages: "Languages",
      hours: "Opening hours",
      description: "Description",
      name: "Name",
      language: "Language",
      dashboard: "Dashboard",
      professionalDashboard: "Professional dashboard",
      publicProfile: "Public profile",
      createListing: "Place advert",
      session: "Session"
    }
  };
  return dictionaries[locale as keyof typeof dictionaries] ?? dictionaries.fr;
}
