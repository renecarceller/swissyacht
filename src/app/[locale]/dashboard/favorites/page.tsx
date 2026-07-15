import { ListingCard } from "@/components/listings/listing-card";
import { demoListings } from "@/lib/data/demo";
import { ui } from "@/i18n/ui";

export default async function FavoritesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const text = ui(locale);
  return (
    <main className="container-shell py-8">
      <h1 className="text-3xl font-bold text-navy">{text.dashboard.favorites}</h1>
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {demoListings.slice(2, 5).map((listing) => <ListingCard key={listing.id} listing={listing} locale={locale} />)}
      </div>
    </main>
  );
}
