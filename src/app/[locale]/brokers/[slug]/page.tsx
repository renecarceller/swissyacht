/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Building2, CalendarCheck, Clock, ExternalLink, Languages, Mail, MapPin, MessageCircle, Phone, ShipWheel } from "lucide-react";
import { ListingCard } from "@/components/listings/listing-card";
import { Link } from "@/i18n/routing";
import { brokerSortValue, getBrokerListings, getProfessionalProfileBySlug } from "@/lib/data/brokers";
import type { Listing, ListingImage } from "@/types/domain";

type BrokerSearchParams = {
  sort?: string;
  brand?: string;
  model?: string;
  category?: string;
  priceMin?: string;
  priceMax?: string;
  yearMin?: string;
  yearMax?: string;
  lengthMin?: string;
  lengthMax?: string;
  powerMin?: string;
  powerMax?: string;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const broker = await getProfessionalProfileBySlug(slug);
  if (!broker) return {};

  return {
    title: `${broker.companyName} | Swissnaut`,
    description: broker.description || `${broker.companyName}: catalogue de bateaux et contact direct sur Swissnaut.`,
    openGraph: {
      title: `${broker.companyName} | Swissnaut`,
      description: broker.description,
      images: broker.coverUrl ? [broker.coverUrl] : []
    }
  };
}

export default async function BrokerPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<BrokerSearchParams>;
}) {
  const { locale, slug } = await params;
  const filters = await searchParams;
  const broker = await getProfessionalProfileBySlug(slug);
  if (!broker) notFound();

  const currentSort = brokerSortValue(filters.sort || null);
  const allListings = await getBrokerListings(broker, currentSort);
  const listings = filterBrokerListings(allListings, filters);
  const labels = brokerLabels(locale);
  const address = [broker.addressLine, broker.postalCode, broker.city, broker.canton, broker.country].filter(Boolean).join(", ");
  const hasCompanyInfo = Boolean(broker.description || address || broker.languages.length || broker.openingHours?.text || broker.memberSince);
  const brands = uniqueValues(allListings.map((listing) => listing.brand));
  const categories = uniqueValues(allListings.map((listing) => listing.category));

  return (
    <main className="bg-[#f6f8fb] pb-12">
      <section className="relative min-h-[320px] bg-navy text-white">
        {broker.coverUrl ? <img src={broker.coverUrl} alt="" className="absolute inset-0 size-full object-cover opacity-45" /> : null}
        <div className="absolute inset-0 bg-gradient-to-b from-[#06233f]/60 to-[#06233f]" />
        <div className="container-shell relative flex min-h-[320px] items-end pb-8 pt-16">
          <div className="grid gap-5 md:grid-cols-[110px_1fr] md:items-end">
            <div className="flex size-24 items-center justify-center overflow-hidden rounded-md border border-white/40 bg-white text-navy">
              {broker.logoUrl ? <img src={broker.logoUrl} alt={broker.companyName} className="size-full object-contain p-2" /> : <Building2 size={42} />}
            </div>
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                {broker.badges.filter((badge) => badge === "verified_broker" || badge === "swiss_company").map((badge) => (
                  <span key={badge} className="rounded bg-[#8bd3ff] px-3 py-1 text-xs font-bold text-[#06233f]">{badgeLabel(locale, badge)}</span>
                ))}
              </div>
              <h1 className="text-4xl font-bold">{broker.companyName}</h1>
              <p className="mt-3 flex flex-wrap items-center gap-2 text-white/85">
                {[broker.city, broker.canton].filter(Boolean).length ? (
                  <>
                    <MapPin size={18} />
                    {[broker.city, broker.canton].filter(Boolean).join(", ")}
                    <span>·</span>
                  </>
                ) : null}
                <span>{allListings.length} {labels.boats}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell -mt-7 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          {hasCompanyInfo ? (
            <section className="rounded-md border border-[#d9e2ec] bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-2xl font-bold text-navy">{labels.about}</h2>
              {broker.description ? <p className="leading-7 text-[#324963]">{broker.description}</p> : null}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {address ? <Info icon={<MapPin />} label={labels.address} value={address} /> : null}
                {broker.languages.length ? <Info icon={<Languages />} label={labels.languages} value={broker.languages.map((language) => language.toUpperCase()).join(", ")} /> : null}
                {broker.openingHours?.text ? <Info icon={<Clock />} label={labels.hours} value={broker.openingHours.text} /> : null}
                {broker.memberSince ? <Info icon={<ShipWheel />} label={labels.memberSince} value={new Date(broker.memberSince).toLocaleDateString(`${locale}-CH`)} /> : null}
              </div>
            </section>
          ) : null}

          {broker.specialties.length ? (
            <TagSection title={labels.specialties} values={broker.specialties.map((specialty) => specialtyLabel(locale, specialty))} />
          ) : null}

          {broker.services.length ? (
            <TagSection title={labels.services} values={broker.services.map((service) => serviceLabel(locale, service))} />
          ) : null}

          {broker.representedBrands.length ? (
            <TagSection title={labels.representedBrands} values={broker.representedBrands} />
          ) : null}

          <section className="rounded-md border border-[#d9e2ec] bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-navy">{labels.catalog}</h2>
                <p className="mt-1 text-sm text-[#607085]">{listings.length} {labels.results}</p>
              </div>
            </div>
            <form className="mb-5 grid gap-3 rounded-md bg-[#f6f8fb] p-4 md:grid-cols-4">
              <FieldControl label={labels.brand} name="brand" defaultValue={filters.brand || ""} options={brands} allLabel={labels.all} />
              <FieldControl label={labels.model} name="model" defaultValue={filters.model || ""} />
              <FieldControl label={labels.type} name="category" defaultValue={filters.category || ""} options={categories} allLabel={labels.all} />
              <RangeControl label={labels.price} minName="priceMin" maxName="priceMax" minValue={filters.priceMin} maxValue={filters.priceMax} />
              <RangeControl label={labels.year} minName="yearMin" maxName="yearMax" minValue={filters.yearMin} maxValue={filters.yearMax} />
              <RangeControl label={labels.length} minName="lengthMin" maxName="lengthMax" minValue={filters.lengthMin} maxValue={filters.lengthMax} />
              <RangeControl label={labels.power} minName="powerMin" maxName="powerMax" minValue={filters.powerMin} maxValue={filters.powerMax} />
              <div className="flex items-end gap-2 md:col-span-4">
                <label className="grid gap-1 text-sm font-semibold text-[#607085]">
                  {labels.sort}
                  <select name="sort" defaultValue={currentSort} className="focus-ring h-11 rounded-md border border-[#cbd7e4] bg-white px-3 text-sm text-navy">
                    <option value="date_desc">{labels.sortDate}</option>
                    <option value="price_asc">{labels.sortPriceAsc}</option>
                    <option value="price_desc">{labels.sortPriceDesc}</option>
                    <option value="year_desc">{labels.sortYearDesc}</option>
                    <option value="year_asc">{labels.sortYearAsc}</option>
                  </select>
                </label>
                <button className="h-11 rounded-md bg-[#8bd3ff] px-5 text-sm font-bold text-[#06233f] shadow-[0_3px_0_#58b9e8]">{labels.apply}</button>
              </div>
            </form>
            <div className="grid gap-5">
              {listings.map((listing) => <ListingCard key={listing.id} listing={listing} locale={locale} view="list" />)}
              {listings.length === 0 ? <div className="rounded-md bg-[#f6f8fb] p-6 text-[#607085]">{labels.empty}</div> : null}
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-4">
          {(broker.publicPhone || broker.publicEmail || broker.website || (broker.whatsappEnabled && broker.whatsappPhone)) ? (
            <section className="rounded-md border border-[#d9e2ec] bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-navy">{labels.contact}</h2>
              <div className="grid gap-3">
                {broker.publicPhone ? <a className="flex h-11 items-center justify-center gap-2 rounded-md bg-[#8bd3ff] font-bold text-[#06233f] shadow-[0_3px_0_#58b9e8]" href={`tel:${broker.publicPhone}`}><Phone size={17} />{labels.call}</a> : null}
                {broker.publicEmail ? <a className="flex h-11 items-center justify-center gap-2 rounded-md border border-[#cbd7e4] font-bold text-navy" href={`mailto:${broker.publicEmail}`}><Mail size={17} />{labels.email}</a> : null}
                {broker.website ? <a className="flex h-11 items-center justify-center gap-2 rounded-md border border-[#cbd7e4] font-bold text-navy" href={broker.website} target="_blank" rel="noreferrer"><ExternalLink size={17} />{labels.website}</a> : null}
                {broker.whatsappEnabled && broker.whatsappPhone ? <a className="flex h-11 items-center justify-center gap-2 rounded-md border border-[#cbd7e4] font-bold text-navy" href={`https://wa.me/${broker.whatsappPhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle size={17} />WhatsApp</a> : null}
                {broker.publicEmail ? <a className="flex h-11 items-center justify-center gap-2 rounded-md border border-[#cbd7e4] font-bold text-navy" href={`mailto:${broker.publicEmail}?subject=${encodeURIComponent(labels.visitSubject)}`}><CalendarCheck size={17} />{labels.requestVisit}</a> : null}
                {broker.publicEmail ? <a className="flex h-11 items-center justify-center gap-2 rounded-md border border-[#cbd7e4] font-bold text-navy" href={`mailto:${broker.publicEmail}?subject=${encodeURIComponent(labels.seaTrialSubject)}`}><ShipWheel size={17} />{labels.requestSeaTrial}</a> : null}
              </div>
            </section>
          ) : null}
          <section className="rounded-md border border-[#d9e2ec] bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-xl font-bold text-navy">{labels.map}</h2>
            <div className="grid aspect-[4/3] place-items-center rounded-md bg-[#e8f3fb] p-4 text-center text-sm font-semibold text-[#607085]">
              {broker.latitude && broker.longitude ? `${broker.latitude}, ${broker.longitude}` : address ? labels.mapAddressReady : labels.mapPlaceholder}
            </div>
          </section>
          {broker.gallery.length ? (
            <section className="rounded-md border border-[#d9e2ec] bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-xl font-bold text-navy">{labels.gallery}</h2>
              <div className="grid grid-cols-2 gap-2">
                {broker.gallery.map((image: ListingImage) => <img key={image.id} src={image.url} alt={image.alt} className="h-28 rounded-md object-cover" />)}
              </div>
            </section>
          ) : null}
          <Link href="/boats" locale={locale} className="rounded-md border border-[#cbd7e4] bg-white px-4 py-3 text-center font-bold text-navy">
            {labels.allBoats}
          </Link>
        </aside>
      </section>
    </main>
  );
}

function filterBrokerListings(listings: Listing[], filters: BrokerSearchParams) {
  return listings.filter((listing) => {
    const checks = [
      !filters.brand || listing.brand === filters.brand,
      !filters.model || `${listing.brand} ${listing.model}`.toLowerCase().includes(filters.model.toLowerCase()),
      !filters.category || listing.category === filters.category,
      inRange(listing.priceChf, filters.priceMin, filters.priceMax),
      inRange(listing.year, filters.yearMin, filters.yearMax),
      inRange(listing.lengthM, filters.lengthMin, filters.lengthMax),
      inRange(listing.powerHp, filters.powerMin, filters.powerMax)
    ];
    return checks.every(Boolean);
  });
}

function inRange(value: number, min?: string, max?: string) {
  const minNumber = Number(min || Number.NEGATIVE_INFINITY);
  const maxNumber = Number(max || Number.POSITIVE_INFINITY);
  return value >= minNumber && value <= maxNumber;
}

function uniqueValues(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-md bg-[#f6f8fb] p-3">
      <span className="text-[#0f6fae] [&>svg]:size-5">{icon}</span>
      <span><span className="block text-xs font-bold uppercase text-[#607085]">{label}</span><span className="font-semibold text-[#21354b]">{value}</span></span>
    </div>
  );
}

function TagSection({ title, values }: { title: string; values: readonly string[] }) {
  return (
    <section className="rounded-md border border-[#d9e2ec] bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-bold text-navy">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => <span key={value} className="rounded bg-[#eef6fc] px-3 py-2 text-sm font-semibold text-navy">{value}</span>)}
      </div>
    </section>
  );
}

function FieldControl({ label, name, defaultValue, options, allLabel }: { label: string; name: string; defaultValue?: string; options?: string[]; allLabel?: string }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-[#607085]">
      {label}
      {options ? (
        <select name={name} defaultValue={defaultValue} className="focus-ring h-11 rounded-md border border-[#cbd7e4] bg-white px-3 text-sm text-navy">
          <option value="">{allLabel}</option>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input name={name} defaultValue={defaultValue} className="focus-ring h-11 rounded-md border border-[#cbd7e4] bg-white px-3 text-sm text-navy" />
      )}
    </label>
  );
}

function RangeControl({ label, minName, maxName, minValue, maxValue }: { label: string; minName: string; maxName: string; minValue?: string; maxValue?: string }) {
  return (
    <div className="grid gap-1 text-sm font-semibold text-[#607085]">
      {label}
      <div className="grid grid-cols-2 gap-2">
        <input name={minName} defaultValue={minValue} inputMode="numeric" placeholder="Min" className="focus-ring h-11 min-w-0 rounded-md border border-[#cbd7e4] bg-white px-3 text-sm text-navy" />
        <input name={maxName} defaultValue={maxValue} inputMode="numeric" placeholder="Max" className="focus-ring h-11 min-w-0 rounded-md border border-[#cbd7e4] bg-white px-3 text-sm text-navy" />
      </div>
    </div>
  );
}

function brokerLabels(locale: string) {
  const dictionaries = {
    fr: { boats: "annonces publiées", about: "Informations de l'entreprise", address: "Adresse", languages: "Langues", hours: "Horaires", memberSince: "Membre depuis", specialties: "Spécialités", services: "Services", representedBrands: "Marques représentées", catalog: "Catalogue de bateaux", results: "résultats", sort: "Trier", apply: "Appliquer", sortDate: "Date récente", sortPriceAsc: "Prix croissant", sortPriceDesc: "Prix décroissant", sortYearDesc: "Année récente", sortYearAsc: "Année ancienne", empty: "Aucun bateau actif pour ce professionnel.", contact: "Contacter", call: "Appeler", email: "Envoyer un email", website: "Page web", requestVisit: "Solliciter une visite", requestSeaTrial: "Solliciter un essai", visitSubject: "Demande de visite", seaTrialSubject: "Demande d'essai de navigation", map: "Carte", mapAddressReady: "Carte prête à connecter avec l'adresse renseignée.", mapPlaceholder: "Carte prête à connecter avec les coordonnées du broker.", gallery: "Galerie de l'entreprise", allBoats: "Voir tous les bateaux", brand: "Marque", model: "Modèle", type: "Type", price: "Prix", year: "Année", length: "Longueur", power: "Puissance", all: "Tous" },
    de: { boats: "veröffentlichte Inserate", about: "Unternehmensinformationen", address: "Adresse", languages: "Sprachen", hours: "Öffnungszeiten", memberSince: "Mitglied seit", specialties: "Spezialitäten", services: "Services", representedBrands: "Vertretene Marken", catalog: "Bootskatalog", results: "Resultate", sort: "Sortieren", apply: "Anwenden", sortDate: "Neueste", sortPriceAsc: "Preis aufsteigend", sortPriceDesc: "Preis absteigend", sortYearDesc: "Neues Baujahr", sortYearAsc: "Altes Baujahr", empty: "Keine aktiven Boote für diesen Profi.", contact: "Kontakt", call: "Anrufen", email: "E-Mail senden", website: "Webseite", requestVisit: "Besichtigung anfragen", requestSeaTrial: "Probefahrt anfragen", visitSubject: "Besichtigungsanfrage", seaTrialSubject: "Probefahrtanfrage", map: "Karte", mapAddressReady: "Karte bereit zur Verbindung mit der hinterlegten Adresse.", mapPlaceholder: "Karte bereit zur Verbindung mit Broker-Koordinaten.", gallery: "Firmengalerie", allBoats: "Alle Boote anzeigen", brand: "Marke", model: "Modell", type: "Typ", price: "Preis", year: "Jahr", length: "Länge", power: "Leistung", all: "Alle" },
    it: { boats: "annunci pubblicati", about: "Informazioni azienda", address: "Indirizzo", languages: "Lingue", hours: "Orari", memberSince: "Membro dal", specialties: "Specialità", services: "Servizi", representedBrands: "Marchi rappresentati", catalog: "Catalogo barche", results: "risultati", sort: "Ordina", apply: "Applica", sortDate: "Data recente", sortPriceAsc: "Prezzo crescente", sortPriceDesc: "Prezzo decrescente", sortYearDesc: "Anno recente", sortYearAsc: "Anno vecchio", empty: "Nessuna barca attiva per questo professionista.", contact: "Contatto", call: "Chiama", email: "Invia email", website: "Sito web", requestVisit: "Richiedi visita", requestSeaTrial: "Richiedi prova in acqua", visitSubject: "Richiesta visita", seaTrialSubject: "Richiesta prova in acqua", map: "Mappa", mapAddressReady: "Mappa pronta da collegare all'indirizzo inserito.", mapPlaceholder: "Mappa pronta da collegare alle coordinate del broker.", gallery: "Galleria azienda", allBoats: "Vedi tutte le barche", brand: "Marca", model: "Modello", type: "Tipo", price: "Prezzo", year: "Anno", length: "Lunghezza", power: "Potenza", all: "Tutti" },
    en: { boats: "published listings", about: "Company information", address: "Address", languages: "Languages", hours: "Opening hours", memberSince: "Member since", specialties: "Specialties", services: "Services", representedBrands: "Represented brands", catalog: "Boat catalogue", results: "results", sort: "Sort", apply: "Apply", sortDate: "Recent date", sortPriceAsc: "Price ascending", sortPriceDesc: "Price descending", sortYearDesc: "Newest year", sortYearAsc: "Oldest year", empty: "No active boats for this professional.", contact: "Contact", call: "Call", email: "Send email", website: "Website", requestVisit: "Request a visit", requestSeaTrial: "Request a sea trial", visitSubject: "Visit request", seaTrialSubject: "Sea trial request", map: "Map", mapAddressReady: "Map ready to connect with the saved address.", mapPlaceholder: "Map ready to connect with broker coordinates.", gallery: "Company gallery", allBoats: "See all boats", brand: "Brand", model: "Model", type: "Type", price: "Price", year: "Year", length: "Length", power: "Power", all: "All" }
  };
  return dictionaries[locale as keyof typeof dictionaries] ?? dictionaries.fr;
}

function badgeLabel(locale: string, badge: string) {
  const labels: Record<string, string> = {
    verified_broker: locale === "de" ? "Verifiziert" : locale === "it" ? "Verificato" : locale === "en" ? "Verified" : "Broker vérifié",
    swiss_company: locale === "de" ? "Schweizer Firma" : locale === "it" ? "Azienda svizzera" : locale === "en" ? "Swiss company" : "Entreprise suisse"
  };
  return labels[badge] || badge;
}

function serviceLabel(locale: string, service: string) {
  const labels: Record<string, Record<string, string>> = {
    buy_boats: { fr: "Achat", de: "Ankauf", it: "Acquisto", en: "Buying" },
    sell_boats: { fr: "Vente", de: "Verkauf", it: "Vendita", en: "Sales" },
    brokerage: { fr: "Brokerage", de: "Brokerage", it: "Brokerage", en: "Brokerage" },
    consignment: { fr: "Consignation", de: "Kommission", it: "Conto vendita", en: "Consignment" },
    rental: { fr: "Location", de: "Vermietung", it: "Noleggio", en: "Rental" },
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
  return labels[service]?.[locale] ?? labels[service]?.fr ?? service.replaceAll("_", " ");
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
  return labels[specialty]?.[locale] ?? labels[specialty]?.fr ?? specialty.replaceAll("_", " ");
}
