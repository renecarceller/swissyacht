import { getAllListings } from "@/lib/data/listings";
import { formatChf } from "@/lib/utils";
import { ui } from "@/i18n/ui";

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const text = ui(locale);
  const sections = text.admin.sections.split("|");
  const listings = getAllListings();

  return (
    <main className="container-shell py-8">
      <h1 className="text-3xl font-bold text-navy">{text.admin.title}</h1>
      <p className="mt-2 text-[#607085]">{text.admin.intro}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {sections.map((section) => <button key={section} className="rounded-md border border-[#d9e2ec] bg-white p-3 text-sm font-bold text-navy">{section}</button>)}
      </div>
      <section className="mt-8 overflow-hidden rounded-md border border-[#d9e2ec] bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[#f6f8fb] text-navy">
            <tr><th className="p-3">{text.dashboard.listings}</th><th className="p-3">{text.common.price}</th><th className="p-3">{text.common.status}</th><th className="p-3">{text.admin.adminActions}</th></tr>
          </thead>
          <tbody>
            {listings.slice(0, 10).map((listing) => (
              <tr key={listing.id} className="border-t border-[#edf2f7]">
                <td className="p-3 font-semibold">{listing.title}</td>
                <td className="p-3">{formatChf(listing.priceChf)}</td>
                <td className="p-3">{listing.status}</td>
                <td className="p-3"><div className="flex gap-2"><button>{text.admin.approve}</button><button>{text.admin.reject}</button><button>{text.admin.feature}</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
