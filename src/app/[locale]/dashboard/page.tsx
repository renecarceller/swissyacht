import { BarChart3, Heart, Inbox, ShipWheel } from "lucide-react";
import { Link } from "@/i18n/routing";
import { demoListings } from "@/lib/data/demo";
import { ui } from "@/i18n/ui";

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const text = ui(locale);
  const cards = [
    [ShipWheel, text.dashboard.listings, text.dashboard.inventory, "/dashboard/listings"],
    [Inbox, text.dashboard.messages, text.dashboard.inquiries, "/dashboard/messages"],
    [Heart, text.dashboard.favorites, text.dashboard.savedBoats, "/dashboard/favorites"],
    [BarChart3, text.dashboard.futureSubscription, text.dashboard.plansPromotions, "/dashboard/settings"]
  ];

  return (
    <main className="container-shell py-8">
      <h1 className="text-3xl font-bold text-navy">{text.dashboard.title}</h1>
      <p className="mt-2 text-[#607085]">{text.dashboard.intro}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {cards.map(([Icon, title, text, href]) => (
          <Link key={String(title)} href={String(href)} locale={locale} className="rounded-md border border-[#d9e2ec] bg-white p-5">
            <Icon className="mb-4 text-[#0f6fae]" />
            <div className="font-bold text-navy">{String(title)}</div>
            <p className="mt-1 text-sm text-[#607085]">{String(text)}</p>
          </Link>
        ))}
      </div>
      <section className="mt-8 rounded-md border border-[#d9e2ec] bg-white p-5">
        <h2 className="mb-4 text-xl font-bold text-navy">{text.dashboard.demoActivity}</h2>
        <div className="grid gap-3">
          {demoListings.slice(0, 4).map((listing) => (
            <div key={listing.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf2f7] pb-3">
              <span className="font-semibold">{listing.title}</span>
              <span className="rounded bg-[#eef6fc] px-2 py-1 text-xs font-bold text-navy">{listing.status}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
