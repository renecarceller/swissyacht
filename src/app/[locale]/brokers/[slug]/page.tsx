/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Building2, Clock, ExternalLink, Languages, Mail, MapPin, Phone, ShipWheel } from "lucide-react";
import { ListingCard } from "@/components/listings/listing-card";
import { Link } from "@/i18n/routing";
import { brokerSortValue, getBrokerListings, getProfessionalProfileBySlug } from "@/lib/data/brokers";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const broker = await getProfessionalProfileBySlug(slug);
  if (!broker) return {};

  return {
    title: `${broker.companyName} | Swissnaut`,
    description: `${broker.companyName}: catalogue de bateaux, informations, services et contact direct sur Swissnaut.`,
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
  searchParams: Promise<{ sort?: string }>;
}) {
  const { locale, slug } = await params;
  const { sort } = await searchParams;
  const broker = await getProfessionalProfileBySlug(slug);
  if (!broker) notFound();
  const currentSort = brokerSortValue(sort || null);
  const listings = await getBrokerListings(broker, currentSort);
  const labels = brokerLabels(locale);

  return (
    <main className="bg-[#f6f8fb] pb-12">
      <section className="relative min-h-[300px] bg-navy text-white">
        {broker.coverUrl ? <img src={broker.coverUrl} alt="" className="absolute inset-0 size-full object-cover opacity-45" /> : null}
        <div className="absolute inset-0 bg-gradient-to-b from-[#06233f]/60 to-[#06233f]" />
        <div className="container-shell relative flex min-h-[300px] items-end pb-8 pt-16">
          <div className="grid gap-5 md:grid-cols-[110px_1fr] md:items-end">
            <div className="flex size-24 items-center justify-center overflow-hidden rounded-md border border-white/40 bg-white text-navy">
              {broker.logoUrl ? <img src={broker.logoUrl} alt={broker.companyName} className="size-full object-contain p-2" /> : <Building2 size={42} />}
            </div>
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                {broker.badges.map((badge) => <span key={badge} className="rounded bg-[#8bd3ff] px-3 py-1 text-xs font-bold text-[#06233f]">{badgeLabel(locale, badge)}</span>)}
              </div>
              <h1 className="text-4xl font-bold">{broker.companyName}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-white/85">
                <MapPin size={18} />
                {[broker.city, broker.canton].filter(Boolean).join(", ")}
                <span>·</span>
                {labels.professional}
                <span>·</span>
                {listings.length} {labels.boats}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell -mt-7 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <section className="rounded-md border border-[#d9e2ec] bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-2xl font-bold text-navy">{labels.about}</h2>
            <p className="leading-7 text-[#324963]">{broker.description || labels.noDescription}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Info icon={<MapPin />} label={labels.address} value={[broker.addressLine, broker.postalCode, broker.city, broker.country].filter(Boolean).join(", ")} />
              <Info icon={<Languages />} label={labels.languages} value={broker.languages.map((language) => language.toUpperCase()).join(", ")} />
              <Info icon={<Clock />} label={labels.hours} value={broker.openingHours?.text || labels.byAppointment} />
              <Info icon={<ShipWheel />} label={labels.memberSince} value={new Date(broker.memberSince).toLocaleDateString(`${locale}-CH`)} />
            </div>
          </section>

          <section className="rounded-md border border-[#d9e2ec] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-navy">{labels.services}</h2>
            <div className="flex flex-wrap gap-2">
              {broker.services.length ? broker.services.map((service) => (
                <span key={service} className="rounded bg-[#eef6fc] px-3 py-2 text-sm font-semibold text-navy">{serviceLabel(locale, service)}</span>
              )) : <span className="text-[#607085]">{labels.noServices}</span>}
            </div>
          </section>

          <section className="rounded-md border border-[#d9e2ec] bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-navy">{labels.catalog}</h2>
                <p className="mt-1 text-sm text-[#607085]">{listings.length} {labels.results}</p>
              </div>
              <form className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm font-semibold text-[#607085]">{labels.sort}</label>
                <select id="sort" name="sort" defaultValue={currentSort} className="focus-ring h-11 rounded-md border border-[#cbd7e4] bg-white px-3 text-sm">
                  <option value="date_desc">{labels.sortDate}</option>
                  <option value="price_asc">{labels.sortPriceAsc}</option>
                  <option value="price_desc">{labels.sortPriceDesc}</option>
                  <option value="year_desc">{labels.sortYearDesc}</option>
                  <option value="year_asc">{labels.sortYearAsc}</option>
                </select>
                <button className="h-11 rounded-md bg-[#8bd3ff] px-4 text-sm font-bold text-[#06233f] shadow-[0_3px_0_#58b9e8]">{labels.apply}</button>
              </form>
            </div>
            <div className="grid gap-5">
              {listings.map((listing) => <ListingCard key={listing.id} listing={listing} locale={locale} view="list" />)}
              {listings.length === 0 ? <div className="rounded-md bg-[#f6f8fb] p-6 text-[#607085]">{labels.empty}</div> : null}
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-4">
          <section className="rounded-md border border-[#d9e2ec] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-navy">{labels.contact}</h2>
            <div className="grid gap-3">
              {broker.publicPhone ? <a className="flex h-11 items-center justify-center gap-2 rounded-md bg-[#8bd3ff] font-bold text-[#06233f] shadow-[0_3px_0_#58b9e8]" href={`tel:${broker.publicPhone}`}><Phone size={17} />{labels.call}</a> : null}
              {broker.publicEmail ? <a className="flex h-11 items-center justify-center gap-2 rounded-md border border-[#cbd7e4] font-bold text-navy" href={`mailto:${broker.publicEmail}`}><Mail size={17} />{labels.email}</a> : null}
              {broker.website ? <a className="flex h-11 items-center justify-center gap-2 rounded-md border border-[#cbd7e4] font-bold text-navy" href={broker.website} target="_blank" rel="noreferrer"><ExternalLink size={17} />{labels.website}</a> : null}
            </div>
          </section>
          <section className="rounded-md border border-[#d9e2ec] bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-xl font-bold text-navy">{labels.map}</h2>
            <div className="grid aspect-[4/3] place-items-center rounded-md bg-[#e8f3fb] text-center text-sm font-semibold text-[#607085]">
              {broker.latitude && broker.longitude ? `${broker.latitude}, ${broker.longitude}` : labels.mapPlaceholder}
            </div>
          </section>
          {broker.gallery.length ? (
            <section className="rounded-md border border-[#d9e2ec] bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-xl font-bold text-navy">{labels.gallery}</h2>
              <div className="grid grid-cols-2 gap-2">
                {broker.gallery.map((image: { id: string; url: string; alt: string }) => <img key={image.id} src={image.url} alt={image.alt} className="h-28 rounded-md object-cover" />)}
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

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-md bg-[#f6f8fb] p-3">
      <span className="text-[#0f6fae] [&>svg]:size-5">{icon}</span>
      <span><span className="block text-xs font-bold uppercase text-[#607085]">{label}</span><span className="font-semibold text-[#21354b]">{value}</span></span>
    </div>
  );
}

function brokerLabels(locale: string) {
  const dictionaries = {
    fr: { professional: "Professionnel nautique", boats: "bateaux", about: "Informations de l'entreprise", noDescription: "Ce professionnel n'a pas encore ajouté de description publique.", address: "Adresse", languages: "Langues", hours: "Horaires", byAppointment: "Sur rendez-vous", memberSince: "Membre depuis", services: "Services", noServices: "Aucun service indiqué.", catalog: "Catalogue de bateaux", results: "résultats", sort: "Trier", apply: "Appliquer", sortDate: "Date récente", sortPriceAsc: "Prix croissant", sortPriceDesc: "Prix décroissant", sortYearDesc: "Année récente", sortYearAsc: "Année ancienne", empty: "Aucun bateau actif pour ce professionnel.", contact: "Contacter", call: "Appeler", email: "Envoyer un email", website: "Page web", map: "Carte", mapPlaceholder: "Carte à connecter avec les coordonnées du broker.", gallery: "Galerie", allBoats: "Voir tous les bateaux" },
    de: { professional: "Nautischer Profi", boats: "Boote", about: "Unternehmensinformationen", noDescription: "Dieser Profi hat noch keine öffentliche Beschreibung hinzugefügt.", address: "Adresse", languages: "Sprachen", hours: "Öffnungszeiten", byAppointment: "Nach Vereinbarung", memberSince: "Mitglied seit", services: "Services", noServices: "Keine Services angegeben.", catalog: "Bootskatalog", results: "Resultate", sort: "Sortieren", apply: "Anwenden", sortDate: "Neueste", sortPriceAsc: "Preis aufsteigend", sortPriceDesc: "Preis absteigend", sortYearDesc: "Neues Baujahr", sortYearAsc: "Altes Baujahr", empty: "Keine aktiven Boote für diesen Profi.", contact: "Kontakt", call: "Anrufen", email: "E-Mail senden", website: "Webseite", map: "Karte", mapPlaceholder: "Karte mit Broker-Koordinaten verbinden.", gallery: "Galerie", allBoats: "Alle Boote anzeigen" },
    it: { professional: "Professionista nautico", boats: "barche", about: "Informazioni azienda", noDescription: "Questo professionista non ha ancora aggiunto una descrizione pubblica.", address: "Indirizzo", languages: "Lingue", hours: "Orari", byAppointment: "Su appuntamento", memberSince: "Membro dal", services: "Servizi", noServices: "Nessun servizio indicato.", catalog: "Catalogo barche", results: "risultati", sort: "Ordina", apply: "Applica", sortDate: "Data recente", sortPriceAsc: "Prezzo crescente", sortPriceDesc: "Prezzo decrescente", sortYearDesc: "Anno recente", sortYearAsc: "Anno vecchio", empty: "Nessuna barca attiva per questo professionista.", contact: "Contatto", call: "Chiama", email: "Invia email", website: "Sito web", map: "Mappa", mapPlaceholder: "Mappa da collegare con le coordinate del broker.", gallery: "Galleria", allBoats: "Vedi tutte le barche" },
    en: { professional: "Marine professional", boats: "boats", about: "Company information", noDescription: "This professional has not added a public description yet.", address: "Address", languages: "Languages", hours: "Opening hours", byAppointment: "By appointment", memberSince: "Member since", services: "Services", noServices: "No services listed.", catalog: "Boat catalogue", results: "results", sort: "Sort", apply: "Apply", sortDate: "Recent date", sortPriceAsc: "Price ascending", sortPriceDesc: "Price descending", sortYearDesc: "Newest year", sortYearAsc: "Oldest year", empty: "No active boats for this professional.", contact: "Contact", call: "Call", email: "Send email", website: "Website", map: "Map", mapPlaceholder: "Map ready to connect with broker coordinates.", gallery: "Gallery", allBoats: "See all boats" }
  };
  return dictionaries[locale as keyof typeof dictionaries] ?? dictionaries.fr;
}

function badgeLabel(locale: string, badge: string) {
  const labels: Record<string, string> = {
    verified_broker: locale === "de" ? "Verifiziert" : locale === "it" ? "Verificato" : locale === "en" ? "Verified" : "Vérifié",
    premium_partner: "Premium Partner",
    swiss_company: locale === "de" ? "Schweizer Firma" : locale === "it" ? "Azienda svizzera" : locale === "en" ? "Swiss company" : "Entreprise suisse"
  };
  return labels[badge] || badge;
}

function serviceLabel(_locale: string, service: string) {
  return service.replaceAll("_", " ");
}
