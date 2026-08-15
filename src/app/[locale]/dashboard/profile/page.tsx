import { updateProfessionalProfileFormAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { ui } from "@/i18n/ui";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cantons } from "@/lib/data/reference";

const brokerServices = ["sell_boats", "buy_boats", "consignment", "financing", "leasing", "insurance", "transport", "import", "export", "maintenance", "repair", "winter_storage", "moorings", "valuation", "administration", "sea_trials"];
const brokerSpecialties = ["motor_boats", "sailing_boats", "yachts", "jet_skis", "electric_boats", "used_boats", "new_boats"];

export default async function ProfilePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { locale } = await params;
  const { saved } = await searchParams;
  const text = ui(locale);
  const copy = profileLabels(locale);
  const profile = await getCurrentProfessionalProfile();

  return (
    <main className="container-shell py-8">
      <h1 className="text-3xl font-bold text-navy">{text.dashboard.profile}</h1>
      {saved ? <div className="mt-4 rounded-md border border-[#8bd3ff] bg-[#e8f6ff] px-4 py-3 font-semibold text-navy">{copy.saved}</div> : null}
      {profile ? (
        <form action={updateProfessionalProfileFormAction} className="mt-6 grid gap-5 rounded-md border border-[#d9e2ec] bg-white p-5">
          <input type="hidden" name="locale" value={locale} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={copy.companyName}><Input name="companyName" defaultValue={profile.company_name || ""} required /></Field>
            <Field label={copy.logo}><Input name="logoUrl" type="url" defaultValue={profile.logo_path || ""} placeholder="https://..." /></Field>
            <Field label={copy.cover}><Input name="coverUrl" type="url" defaultValue={profile.cover_path || ""} placeholder="https://..." /></Field>
            <Field label={text.dashboard.website}><Input name="website" type="url" defaultValue={profile.website || ""} placeholder="https://..." /></Field>
            <Field label={copy.address}><Input name="addressLine" defaultValue={profile.address_line || ""} /></Field>
            <Field label={copy.postalCode}><Input name="postalCode" defaultValue={profile.postal_code || ""} /></Field>
            <Field label={text.common.city}><Input name="city" defaultValue={profile.city || ""} /></Field>
            <Field label={text.common.canton}>
              <Select name="canton" defaultValue={profile.canton || ""}>
                <option value="">{text.common.all}</option>
                {cantons.map((canton) => <option key={canton}>{canton}</option>)}
              </Select>
            </Field>
            <Field label={copy.country}><Input name="country" defaultValue={profile.country || "Switzerland"} /></Field>
            <Field label={text.common.phone}><Input name="publicPhone" defaultValue={profile.public_phone || ""} /></Field>
            <Field label={copy.whatsapp}><Input name="whatsappPhone" defaultValue={profile.whatsapp_phone || ""} placeholder="+41..." /></Field>
            <Field label={text.common.email}><Input name="publicEmail" type="email" defaultValue={profile.public_email || ""} /></Field>
          </div>
          <Field label={text.common.description}><Textarea name="description" defaultValue={profile.description || ""} rows={5} /></Field>
          <Field label={copy.openingHours}><Textarea name="openingHours" defaultValue={profile.opening_hours?.text || ""} rows={3} /></Field>
          <Field label={copy.representedBrands}><Textarea name="representedBrands" defaultValue={profile.represented_brands.join("\n")} rows={3} placeholder={copy.representedBrandsPlaceholder} /></Field>
          <Field label={copy.galleryUrls}><Textarea name="galleryUrls" defaultValue={profile.gallery_urls.join("\n")} rows={3} placeholder={copy.galleryUrlsPlaceholder} /></Field>
          <CheckboxGroup title={copy.languages} name="languages" values={["fr", "de", "it", "en"]} selected={profile.languages || []} formatter={(value) => value.toUpperCase()} />
          <CheckboxGroup title={copy.specialties} name="specialties" values={brokerSpecialties} selected={profile.specialties} formatter={(value) => specialtyLabel(locale, value)} />
          <CheckboxGroup title={copy.services} name="services" values={brokerServices} selected={profile.services} formatter={(value) => serviceLabel(locale, value)} />
          <div className="text-right">
            <Button className="bg-[#8bd3ff] text-[#06233f] shadow-[0_4px_0_#58b9e8] hover:bg-[#aee2ff]">{text.dashboard.saveProfile}</Button>
          </div>
        </form>
      ) : (
        <form className="mt-6 grid max-w-3xl gap-4 rounded-md border border-[#d9e2ec] bg-white p-5">
          <Field label={text.common.name}><Input defaultValue="Demo Seller" /></Field>
          <Field label={text.dashboard.company}><Input placeholder={text.common.professional} /></Field>
          <Field label={text.dashboard.website}><Input placeholder="https://..." /></Field>
          <Field label={text.common.description}><Textarea placeholder={text.dashboard.publicDescription} /></Field>
          <Button>{text.dashboard.saveProfile}</Button>
        </form>
      )}
    </main>
  );
}

async function getCurrentProfessionalProfile() {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;
    const admin = createSupabaseAdminClient();
    let { data, error } = await admin
      .from("professional_profiles")
      .select("*, broker_services(service_code), broker_specialties(specialty_code), broker_represented_brands(brand_name), broker_gallery(public_url, storage_path, sort_order)")
      .eq("user_id", userData.user.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error && isSchemaCompatibilityError(error)) {
      const fallback = await admin
        .from("professional_profiles")
        .select("*, broker_services(service_code), broker_gallery(public_url, storage_path, sort_order)")
        .eq("user_id", userData.user.id)
        .is("deleted_at", null)
        .maybeSingle();
      data = fallback.data;
      error = fallback.error;
    }

    if (error) return null;
    if (!data) return null;
    return {
      ...data,
      services: Array.isArray(data.broker_services) ? data.broker_services.map((item: { service_code?: string }) => item.service_code).filter(Boolean) : [],
      specialties: Array.isArray(data.broker_specialties) ? data.broker_specialties.map((item: { specialty_code?: string }) => item.specialty_code).filter(Boolean) : [],
      represented_brands: Array.isArray(data.broker_represented_brands) ? data.broker_represented_brands.map((item: { brand_name?: string }) => item.brand_name).filter(Boolean) : [],
      gallery_urls: Array.isArray(data.broker_gallery) ? data.broker_gallery.map((item: { public_url?: string; storage_path?: string }) => item.public_url || item.storage_path).filter(Boolean) : []
    };
  } catch {
    return null;
  }
}

function isSchemaCompatibilityError(error: unknown) {
  const issue = error as { message?: string; code?: string; details?: string } | null;
  const text = `${issue?.code || ""} ${issue?.message || ""} ${issue?.details || ""}`.toLowerCase();
  return text.includes("pgrst204") || text.includes("schema cache") || text.includes("could not find") || text.includes("does not exist");
}

function CheckboxGroup({ title, name, values, selected, formatter }: { title: string; name: string; values: string[]; selected: string[]; formatter: (value: string) => string }) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-navy">{title}</div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {values.map((value) => (
          <label key={value} className="rounded-md border border-[#d9e2ec] bg-white px-3 py-2 text-sm">
            <input type="checkbox" name={name} value={value} defaultChecked={selected.includes(value)} className="mr-2" />
            {formatter(value)}
          </label>
        ))}
      </div>
    </div>
  );
}

function profileLabels(locale: string) {
  const dictionaries = {
    fr: { saved: "Profil professionnel enregistré.", companyName: "Nom de l'entreprise", logo: "Logo", cover: "Image de couverture", address: "Adresse", postalCode: "Code postal", country: "Pays", whatsapp: "WhatsApp", openingHours: "Horaires", languages: "Langues", specialties: "Spécialités", representedBrands: "Marques représentées", representedBrandsPlaceholder: "Une marque par ligne", galleryUrls: "Galerie de l'entreprise", galleryUrlsPlaceholder: "URLs d'images, une par ligne", services: "Services offerts" },
    de: { saved: "Profi-Profil gespeichert.", companyName: "Firmenname", logo: "Logo", cover: "Titelbild", address: "Adresse", postalCode: "Postleitzahl", country: "Land", whatsapp: "WhatsApp", openingHours: "Öffnungszeiten", languages: "Sprachen", specialties: "Spezialitäten", representedBrands: "Vertretene Marken", representedBrandsPlaceholder: "Eine Marke pro Zeile", galleryUrls: "Firmengalerie", galleryUrlsPlaceholder: "Bild-URLs, eine pro Zeile", services: "Angebotene Services" },
    it: { saved: "Profilo professionale salvato.", companyName: "Nome azienda", logo: "Logo", cover: "Immagine di copertina", address: "Indirizzo", postalCode: "Codice postale", country: "Paese", whatsapp: "WhatsApp", openingHours: "Orari", languages: "Lingue", specialties: "Specialità", representedBrands: "Marchi rappresentati", representedBrandsPlaceholder: "Un marchio per riga", galleryUrls: "Galleria azienda", galleryUrlsPlaceholder: "URL immagini, una per riga", services: "Servizi offerti" },
    en: { saved: "Professional profile saved.", companyName: "Company name", logo: "Logo", cover: "Cover image", address: "Address", postalCode: "Postal code", country: "Country", whatsapp: "WhatsApp", openingHours: "Opening hours", languages: "Languages", specialties: "Specialties", representedBrands: "Represented brands", representedBrandsPlaceholder: "One brand per line", galleryUrls: "Company gallery", galleryUrlsPlaceholder: "Image URLs, one per line", services: "Services offered" }
  };
  return dictionaries[locale as keyof typeof dictionaries] ?? dictionaries.fr;
}

function serviceLabel(locale: string, service: string) {
  const labels: Record<string, Record<string, string>> = {
    sell_boats: { fr: "Vente", de: "Verkauf", it: "Vendita", en: "Sales" },
    buy_boats: { fr: "Achat", de: "Ankauf", it: "Acquisto", en: "Buying" },
    consignment: { fr: "Consignation", de: "Kommission", it: "Conto vendita", en: "Consignment" },
    financing: { fr: "Financement", de: "Finanzierung", it: "Finanziamento", en: "Financing" },
    leasing: { fr: "Leasing", de: "Leasing", it: "Leasing", en: "Leasing" },
    insurance: { fr: "Assurance", de: "Versicherung", it: "Assicurazione", en: "Insurance" },
    transport: { fr: "Transport", de: "Transport", it: "Trasporto", en: "Transport" },
    import: { fr: "Importation", de: "Import", it: "Importazione", en: "Import" },
    export: { fr: "Exportation", de: "Export", it: "Esportazione", en: "Export" },
    maintenance: { fr: "Maintenance", de: "Wartung", it: "Manutenzione", en: "Maintenance" },
    repair: { fr: "Réparation", de: "Reparatur", it: "Riparazione", en: "Repair" },
    winter_storage: { fr: "Invernage", de: "Winterlager", it: "Rimessaggio invernale", en: "Winter storage" },
    moorings: { fr: "Amarrage", de: "Liegeplatz", it: "Ormeggio", en: "Mooring" },
    valuation: { fr: "Évaluations", de: "Bewertungen", it: "Perizie", en: "Valuations" },
    administration: { fr: "Gestion documentaire", de: "Dokumentenverwaltung", it: "Gestione documentale", en: "Document handling" },
    sea_trials: { fr: "Essais de navigation", de: "Probefahrten", it: "Prove in acqua", en: "Sea trials" }
  };
  return labels[service]?.[locale] ?? labels[service]?.fr ?? service;
}

function specialtyLabel(locale: string, specialty: string) {
  const labels: Record<string, Record<string, string>> = {
    motor_boats: { fr: "Bateaux à moteur", de: "Motorboote", it: "Barche a motore", en: "Motor boats" },
    sailing_boats: { fr: "Voiliers", de: "Segelboote", it: "Barche a vela", en: "Sailing boats" },
    yachts: { fr: "Yachts", de: "Yachten", it: "Yacht", en: "Yachts" },
    jet_skis: { fr: "Motos nautiques", de: "Jetskis", it: "Moto d'acqua", en: "Jet skis" },
    electric_boats: { fr: "Bateaux électriques", de: "Elektroboote", it: "Barche elettriche", en: "Electric boats" },
    used_boats: { fr: "Bateaux d'occasion", de: "Gebrauchtboote", it: "Barche usate", en: "Used boats" },
    new_boats: { fr: "Bateaux neufs", de: "Neue Boote", it: "Barche nuove", en: "New boats" }
  };
  return labels[specialty]?.[locale] ?? labels[specialty]?.fr ?? specialty;
}
