import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { Eye, ShieldCheck, Trash2, Users, Building2, Ship } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { archiveListingAsDirectorFormAction } from "@/lib/actions/admin";
import { getAdminOverview, getDirectorAccess } from "@/lib/data/admin";
import { statusLabel } from "@/i18n/ui";
import { formatChf } from "@/lib/utils";

const labels = {
  fr: {
    title: "Panneau Director Swissnaut",
    intro: "Gestion réservée au compte directeur: comptes créés, profils professionnels et annonces publiées.",
    deniedTitle: "Accès réservé",
    deniedText: "Cette page est visible uniquement depuis le compte Director Swissnaut.",
    unavailableTitle: "Configuration nécessaire",
    users: "Comptes créés",
    professionals: "Profils professionnels",
    listings: "Annonces",
    published: "Annonces publiées",
    name: "Nom",
    email: "Email",
    role: "Rôle",
    phone: "Téléphone",
    company: "Entreprise",
    city: "Ville",
    status: "Statut",
    seller: "Vendeur",
    price: "Prix",
    created: "Créé le",
    inspect: "Voir",
    delete: "Supprimer",
    empty: "Aucune donnée pour le moment."
  },
  de: {
    title: "Director Swissnaut",
    intro: "Geschützte Verwaltung für erstellte Konten, professionelle Profile und veröffentlichte Inserate.",
    deniedTitle: "Zugriff geschützt",
    deniedText: "Diese Seite ist nur mit dem Director-Swissnaut-Konto sichtbar.",
    unavailableTitle: "Konfiguration erforderlich",
    users: "Erstellte Konten",
    professionals: "Professionelle Profile",
    listings: "Inserate",
    published: "Veröffentlichte Inserate",
    name: "Name",
    email: "E-Mail",
    role: "Rolle",
    phone: "Telefon",
    company: "Unternehmen",
    city: "Stadt",
    status: "Status",
    seller: "Verkäufer",
    price: "Preis",
    created: "Erstellt am",
    inspect: "Ansehen",
    delete: "Löschen",
    empty: "Noch keine Daten."
  },
  it: {
    title: "Pannello Director Swissnaut",
    intro: "Gestione riservata per account creati, profili professionali e annunci pubblicati.",
    deniedTitle: "Accesso riservato",
    deniedText: "Questa pagina è visibile solo dall'account Director Swissnaut.",
    unavailableTitle: "Configurazione necessaria",
    users: "Account creati",
    professionals: "Profili professionali",
    listings: "Annunci",
    published: "Annunci pubblicati",
    name: "Nome",
    email: "Email",
    role: "Ruolo",
    phone: "Telefono",
    company: "Azienda",
    city: "Città",
    status: "Stato",
    seller: "Venditore",
    price: "Prezzo",
    created: "Creato il",
    inspect: "Vedi",
    delete: "Elimina",
    empty: "Nessun dato al momento."
  },
  en: {
    title: "Director Swissnaut",
    intro: "Protected management for created accounts, professional profiles and published listings.",
    deniedTitle: "Protected access",
    deniedText: "This page is visible only from the Director Swissnaut account.",
    unavailableTitle: "Setup required",
    users: "Created accounts",
    professionals: "Professional profiles",
    listings: "Listings",
    published: "Published listings",
    name: "Name",
    email: "Email",
    role: "Role",
    phone: "Phone",
    company: "Company",
    city: "City",
    status: "Status",
    seller: "Seller",
    price: "Price",
    created: "Created",
    inspect: "View",
    delete: "Delete",
    empty: "No data yet."
  }
} as const;

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const copy = labels[locale as keyof typeof labels] || labels.fr;
  const access = await getDirectorAccess();

  if (access.status === "unauthenticated") {
    redirect(`/${locale}/?account=1` as never);
  }

  if (access.status === "denied") {
    return (
      <main className="container-shell py-10">
        <ProtectedMessage title={copy.deniedTitle} message={copy.deniedText} />
      </main>
    );
  }

  if (access.status === "unavailable") {
    return (
      <main className="container-shell py-10">
        <ProtectedMessage title={copy.unavailableTitle} message={access.message} />
      </main>
    );
  }

  const overview = await getAdminOverview();

  return (
    <main className="container-shell py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-md bg-sky-soft px-3 py-2 text-sm font-bold text-navy">
            <ShieldCheck className="h-4 w-4" />
            {access.fullName}
          </p>
          <h1 className="mt-4 text-3xl font-bold text-navy md:text-4xl">{copy.title}</h1>
          <p className="mt-2 max-w-3xl text-[#607085]">{copy.intro}</p>
        </div>
        <SignOutButton locale={locale} className="shrink-0" />
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard icon={<Users />} label={copy.users} value={overview.totals.users} />
        <StatCard icon={<Building2 />} label={copy.professionals} value={overview.totals.professionals} />
        <StatCard icon={<Ship />} label={copy.listings} value={overview.totals.listings} />
        <StatCard icon={<ShieldCheck />} label={copy.published} value={overview.totals.publishedListings} />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <Panel title={copy.users}>
          <TableWrapper empty={overview.users.length === 0} emptyLabel={copy.empty}>
            <thead className="bg-[#f6f8fb] text-navy">
              <tr>
                <HeaderCell>{copy.name}</HeaderCell>
                <HeaderCell>{copy.email}</HeaderCell>
                <HeaderCell>{copy.role}</HeaderCell>
                <HeaderCell>{copy.phone}</HeaderCell>
              </tr>
            </thead>
            <tbody>
              {overview.users.map((user) => (
                <tr key={user.id} className="border-t border-[#edf2f7]">
                  <Cell strong>{user.fullName}</Cell>
                  <Cell>{user.email || "-"}</Cell>
                  <Cell>{user.role}</Cell>
                  <Cell>{user.phone || "-"}</Cell>
                </tr>
              ))}
            </tbody>
          </TableWrapper>
        </Panel>

        <Panel title={copy.professionals}>
          <TableWrapper empty={overview.professionals.length === 0} emptyLabel={copy.empty}>
            <thead className="bg-[#f6f8fb] text-navy">
              <tr>
                <HeaderCell>{copy.company}</HeaderCell>
                <HeaderCell>{copy.email}</HeaderCell>
                <HeaderCell>{copy.city}</HeaderCell>
                <HeaderCell>{copy.status}</HeaderCell>
              </tr>
            </thead>
            <tbody>
              {overview.professionals.map((profile) => (
                <tr key={profile.id} className="border-t border-[#edf2f7]">
                  <Cell strong>{profile.companyName}</Cell>
                  <Cell>{profile.publicEmail || profile.ownerEmail || "-"}</Cell>
                  <Cell>{[profile.city, profile.canton].filter(Boolean).join(", ") || "-"}</Cell>
                  <Cell>{statusLabel(locale, profile.suspendedAt ? "suspended" : profile.publishedAt ? "published" : "draft")}</Cell>
                </tr>
              ))}
            </tbody>
          </TableWrapper>
        </Panel>
      </section>

      <Panel title={copy.listings} className="mt-8">
        <TableWrapper empty={overview.listings.length === 0} emptyLabel={copy.empty}>
          <thead className="bg-[#f6f8fb] text-navy">
            <tr>
              <HeaderCell>{copy.listings}</HeaderCell>
              <HeaderCell>{copy.seller}</HeaderCell>
              <HeaderCell>{copy.price}</HeaderCell>
              <HeaderCell>{copy.status}</HeaderCell>
              <HeaderCell>{copy.created}</HeaderCell>
              <HeaderCell />
            </tr>
          </thead>
          <tbody>
            {overview.listings.map((listing) => (
              <tr key={listing.id} className="border-t border-[#edf2f7]">
                <Cell strong>{listing.title}</Cell>
                <Cell>{listing.brokerName || listing.ownerName || listing.ownerEmail || listing.sellerType}</Cell>
                <Cell>{formatChf(listing.priceChf)}</Cell>
                <Cell>{statusLabel(locale, listing.status)}</Cell>
                <Cell>{formatDate(listing.createdAt, locale)}</Cell>
                <Cell>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className="inline-flex items-center gap-2 rounded-md border border-[#d9e2ec] bg-white px-4 py-2 font-bold text-navy"
                      href={`/${locale}/listing/${listing.slug}`}
                    >
                      <Eye className="h-4 w-4" />
                      {copy.inspect}
                    </Link>
                    <form action={archiveListingAsDirectorFormAction}>
                      <input type="hidden" name="listingId" value={listing.id} />
                      <button className="inline-flex items-center gap-2 rounded-md bg-sky px-4 py-2 font-bold text-navy shadow-[0_4px_0_#55bde8]" type="submit">
                        <Trash2 className="h-4 w-4" />
                        {copy.delete}
                      </button>
                    </form>
                  </div>
                </Cell>
              </tr>
            ))}
          </tbody>
        </TableWrapper>
      </Panel>
    </main>
  );
}

function ProtectedMessage({ title, message }: { title: string; message: string }) {
  return (
    <section className="rounded-md border border-[#d9e2ec] bg-white p-8">
      <h1 className="text-3xl font-bold text-navy">{title}</h1>
      <p className="mt-3 text-[#607085]">{message}</p>
    </section>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-md border border-[#d9e2ec] bg-white p-5">
      <div className="flex items-center gap-3 text-navy">
        <span className="rounded-md bg-sky-soft p-2 [&_svg]:h-5 [&_svg]:w-5">{icon}</span>
        <span className="text-sm font-bold text-[#607085]">{label}</span>
      </div>
      <p className="mt-4 text-4xl font-bold text-navy">{value}</p>
    </div>
  );
}

function Panel({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`overflow-hidden rounded-md border border-[#d9e2ec] bg-white ${className}`}>
      <h2 className="border-b border-[#edf2f7] px-5 py-4 text-xl font-bold text-navy">{title}</h2>
      {children}
    </section>
  );
}

function TableWrapper({ children, empty, emptyLabel }: { children: ReactNode; empty: boolean; emptyLabel: string }) {
  if (empty) return <p className="p-5 text-[#607085]">{emptyLabel}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

function HeaderCell({ children }: { children?: ReactNode }) {
  return <th className="p-3 font-bold">{children}</th>;
}

function Cell({ children, strong }: { children: ReactNode; strong?: boolean }) {
  return <td className={`p-3 text-navy ${strong ? "font-bold" : ""}`}>{children}</td>;
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value));
}
