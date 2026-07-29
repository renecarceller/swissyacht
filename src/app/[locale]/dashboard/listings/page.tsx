import { Link } from "@/i18n/routing";
import { getAllListings } from "@/lib/data/listings";
import { formatChf } from "@/lib/utils";
import { ui } from "@/i18n/ui";

export default async function DashboardListingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const text = ui(locale);
  const listings = getAllListings();
  return (
    <main className="container-shell py-8">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-navy">{text.dashboard.listings}</h1>
        <Link href="/sell" locale={locale} className="rounded-md bg-[#8bd3ff] px-4 py-3 font-bold text-[#06233f] shadow-[0_4px_0_#58b9e8] transition hover:bg-[#aee2ff]">{text.dashboard.createListing}</Link>
      </div>
      <div className="overflow-hidden rounded-md border border-[#d9e2ec] bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[#f6f8fb] text-navy">
            <tr><th className="p-3">{text.dashboard.listings}</th><th className="p-3">{text.common.price}</th><th className="p-3">{text.common.status}</th><th className="p-3">{text.common.views}</th><th className="p-3">{text.common.actions}</th></tr>
          </thead>
          <tbody>
            {listings.slice(0, 8).map((listing) => (
              <tr key={listing.id} className="border-t border-[#edf2f7]">
                <td className="p-3 font-semibold">{listing.title}</td>
                <td className="p-3">{formatChf(listing.priceChf)}</td>
                <td className="p-3">{listing.status}</td>
                <td className="p-3">{listing.views}</td>
                <td className="p-3"><button className="font-bold text-[#0f6fae]">{text.common.edit}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
