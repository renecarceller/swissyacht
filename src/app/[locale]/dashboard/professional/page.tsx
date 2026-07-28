import { BarChart3, Building2, Inbox, ShipWheel, Upload, Users } from "lucide-react";
import { Link } from "@/i18n/routing";

export default async function ProfessionalDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const labels = professionalDashboardLabels(locale);
  const cards = [
    [ShipWheel, labels.boats, labels.boatsText, "/dashboard/listings"],
    [Inbox, labels.leads, labels.leadsText, "/dashboard/messages"],
    [Building2, labels.company, labels.companyText, "/dashboard/profile"],
    [BarChart3, labels.stats, labels.statsText, "/dashboard/settings"],
    [Upload, labels.import, labels.importText, "/dashboard/listings"],
    [Users, labels.team, labels.teamText, "/dashboard/settings"]
  ] as const;

  return (
    <main className="container-shell py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy">{labels.title}</h1>
        <p className="mt-2 max-w-2xl text-[#607085]">{labels.intro}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(([Icon, title, text, href]) => (
          <Link key={title} href={href} locale={locale} className="rounded-md border border-[#d9e2ec] bg-white p-5">
            <Icon className="mb-4 text-[#0f6fae]" />
            <div className="font-bold text-navy">{title}</div>
            <p className="mt-1 text-sm text-[#607085]">{text}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

function professionalDashboardLabels(locale: string) {
  const dictionaries = {
    fr: { title: "Panel professionnel", intro: "Gérez votre entreprise, votre catalogue, vos contacts et votre visibilité.", boats: "Mes bateaux", boatsText: "Inventaire, brouillons et annonces publiées.", leads: "Leads et contacts", leadsText: "Demandes reçues depuis vos annonces.", company: "Profil entreprise", companyText: "Logo, adresse, horaires, services et galerie.", stats: "Statistiques", statsText: "Visites, favoris et demandes.", import: "Importer annonces", importText: "Base préparée pour CSV et Excel.", team: "Équipe", teamText: "Préparé pour owner, admin, editor et viewer." },
    de: { title: "Profi-Bereich", intro: "Verwalten Sie Firma, Katalog, Kontakte und Sichtbarkeit.", boats: "Meine Boote", boatsText: "Inventar, Entwürfe und veröffentlichte Inserate.", leads: "Leads und Kontakte", leadsText: "Anfragen aus Ihren Inseraten.", company: "Firmenprofil", companyText: "Logo, Adresse, Zeiten, Services und Galerie.", stats: "Statistiken", statsText: "Aufrufe, Favoriten und Anfragen.", import: "Inserate importieren", importText: "Vorbereitet für CSV und Excel.", team: "Team", teamText: "Vorbereitet für Owner, Admin, Editor und Viewer." },
    it: { title: "Pannello professionale", intro: "Gestisci azienda, catalogo, contatti e visibilità.", boats: "Le mie barche", boatsText: "Inventario, bozze e annunci pubblicati.", leads: "Lead e contatti", leadsText: "Richieste ricevute dagli annunci.", company: "Profilo azienda", companyText: "Logo, indirizzo, orari, servizi e galleria.", stats: "Statistiche", statsText: "Visite, preferiti e richieste.", import: "Importa annunci", importText: "Preparato per CSV ed Excel.", team: "Team", teamText: "Preparato per owner, admin, editor e viewer." },
    en: { title: "Professional dashboard", intro: "Manage your company, catalogue, contacts and visibility.", boats: "My boats", boatsText: "Inventory, drafts and published listings.", leads: "Leads and contacts", leadsText: "Requests received from your listings.", company: "Company profile", companyText: "Logo, address, hours, services and gallery.", stats: "Statistics", statsText: "Views, favourites and requests.", import: "Import listings", importText: "Prepared for CSV and Excel.", team: "Team", teamText: "Prepared for owner, admin, editor and viewer." }
  };
  return dictionaries[locale as keyof typeof dictionaries] ?? dictionaries.fr;
}
