import type { Metadata } from "next";
import { Grid2X2, List, MapPinned } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ListingCard } from "@/components/listings/listing-card";
import { SearchFilters } from "@/components/listings/search-filters";
import { SortPicker } from "@/components/listings/sort-picker";
import { getAvailableBrandsAsync, getListingsAsync, parseFilters } from "@/lib/data/listings";
import { ui } from "@/i18n/ui";

export const metadata: Metadata = {
  title: "Bateaux a vendre",
  description: "Recherche avancee de bateaux, voiliers et yachts en Suisse."
};

export default async function BoatsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const raw = await searchParams;
  const urlSearchParams = new URLSearchParams();
  Object.entries(raw).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((item) => urlSearchParams.append(key, item));
    else if (value) urlSearchParams.set(key, value);
  });
  const filters = parseFilters(urlSearchParams);
  const result = await getListingsAsync(filters);
  const availableBrands = await getAvailableBrandsAsync();
  const text = ui(locale);
  const visibleView = filters.view === "map" ? "cards" : filters.view;
  const comingSoonLabel = {
    fr: "Prochainement",
    de: "Demnächst",
    it: "Prossimamente",
    en: "Coming soon"
  }[locale] || "Prochainement";

  return (
    <main className="container-shell py-8">
      <div className="mb-6 hidden flex-wrap items-center justify-between gap-4 min-[520px]:flex">
        <div>
          <h1 className="text-3xl font-bold text-navy">{text.search.title}</h1>
          <p className="mt-2 text-[#607085]">{result.total} {text.search.resultsIn}</p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-[#d9e2ec] bg-white p-2">
          <Link href={{ pathname: "/boats", query: { ...raw, view: "cards" } }} locale={locale} className={`rounded p-2 text-navy ${visibleView === "cards" ? "bg-[#e8f6ff]" : ""}`}><Grid2X2 size={18} /></Link>
          <Link href={{ pathname: "/boats", query: { ...raw, view: "list" } }} locale={locale} className={`rounded p-2 text-navy ${visibleView === "list" ? "bg-[#e8f6ff]" : ""}`}><List size={18} /></Link>
          <span className="flex cursor-not-allowed items-center gap-1 rounded bg-[#e8f6ff] p-2 text-sm font-semibold text-navy opacity-80" aria-disabled="true">
            <MapPinned size={18} />
            {comingSoonLabel}
          </span>
        </div>
      </div>
      <form action={`/${locale}/boats`} className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="hidden min-[520px]:block">
          <SearchFilters filters={filters} locale={locale} availableBrands={availableBrands} />
        </div>
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#d9e2ec] bg-white p-3">
            <span className="text-sm text-[#607085]">{text.search.page} {result.page} {text.search.of} {result.pages}</span>
            <SortPicker locale={locale} value={filters.sort || "date_desc"} />
          </div>
          <div className={visibleView === "list" ? "grid gap-4" : "grid gap-5 xl:grid-cols-2"}>
            {result.listings.map((listing) => <ListingCard key={listing.id} listing={listing} locale={locale} view={visibleView === "list" ? "list" : "cards"} />)}
          </div>
          {result.total === 0 ? (
            <div className="rounded-md border border-[#d9e2ec] bg-white p-8 text-center text-[#607085]">{text.search.empty}</div>
          ) : null}
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: result.pages }).map((_, index) => (
              <Link key={index} href={{ pathname: "/boats", query: { ...raw, page: index + 1 } }} locale={locale} className="grid size-10 place-items-center rounded-md border border-[#d9e2ec] bg-white font-bold">
                {index + 1}
              </Link>
            ))}
          </div>
        </section>
      </form>
    </main>
  );
}
