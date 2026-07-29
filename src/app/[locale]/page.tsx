import { Building2, CheckCircle2, ClipboardList, Heart, MapPin, Search, ShieldCheck, ShipWheel, Sparkles } from "lucide-react";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ListingCard } from "@/components/listings/listing-card";
import { QuickSearch } from "@/components/listings/quick-search";
import { getBrandCountsAsync, getCategoryCountsAsync, getFeaturedListingsAsync, getSearchRangeHistogramsAsync } from "@/lib/data/listings";
import { lakes } from "@/lib/data/reference";
import { refLabel, ui } from "@/i18n/ui";

export default async function HomePage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const rawSearchParams = await searchParams;
  const initialValues = Object.fromEntries(
    Object.entries(rawSearchParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  );
  setRequestLocale(locale);
  const text = ui(locale);
  const featured = await getFeaturedListingsAsync();
  const brandCounts = await getBrandCountsAsync();
  const categoryCounts = await getCategoryCountsAsync();
  const rangeHistograms = await getSearchRangeHistogramsAsync();

  return (
    <main className="w-full max-w-full overflow-x-hidden pb-24 min-[520px]:pb-0">
      <section className="w-full max-w-full overflow-x-hidden bg-white min-[520px]:hidden">
        <div className="relative h-56 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1520242279429-1f64b18816ef?auto=format&fit=crop&w=1100&q=80"
            alt="Swiss marina"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06233f]/70 via-[#06233f]/35 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-4 py-5 text-white">
            <p className="max-w-[18rem] text-3xl font-semibold leading-[1.1]">{text.home.title}</p>
            <p className="mt-3 max-w-[19rem] text-base font-semibold leading-6 text-white/90">{text.home.subtitle}</p>
            <p className="mt-3 max-w-[21rem] text-sm leading-6 text-white/82">{text.home.description}</p>
          </div>
        </div>
        <QuickSearch locale={locale} brandCounts={brandCounts} categoryCounts={categoryCounts} rangeHistograms={rangeHistograms} initialValues={initialValues} />
        <Link href="/boats?sort=date_desc" locale={locale} className="mx-4 mb-2 mt-4 flex min-w-0 items-center justify-between gap-3 border-t border-[#d6d6d6] pt-4 text-2xl font-semibold text-[#0f6fae]">
          <span className="min-w-0 truncate">{text.search.savedSearches}</span>
          <span className="text-4xl leading-none">›</span>
        </Link>
      </section>

      <section className="relative hidden min-h-[620px] overflow-hidden bg-white text-white min-[520px]:block">
        <Image
          src="https://images.unsplash.com/photo-1520242279429-1f64b18816ef?auto=format&fit=crop&w=2200&q=85"
          alt="Swiss nautical coastline"
          fill
          priority
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
        <div className="container-shell relative flex min-h-[620px] flex-col justify-center pb-16 pt-20">
          <div className="max-w-4xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-white/12 px-3 py-2 text-sm font-semibold backdrop-blur">
              <ShieldCheck size={17} />
              {text.home.trust}
            </div>
            <h1 className="text-5xl font-bold leading-[1.08] md:text-6xl xl:text-7xl">{text.home.title}</h1>
            <p className="mt-6 max-w-3xl text-2xl font-semibold leading-10 text-white xl:text-3xl xl:leading-[1.35]">{text.home.subtitle}</p>
            <p className="mt-5 max-w-3xl text-lg leading-9 text-[#d6e4f2] xl:text-xl xl:leading-10">{text.home.description}</p>
          </div>
          <div className="mt-10">
            <QuickSearch locale={locale} brandCounts={brandCounts} categoryCounts={categoryCounts} rangeHistograms={rangeHistograms} initialValues={initialValues} />
          </div>
        </div>
      </section>

      <section className="container-shell py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-navy">{text.home.featured}</h2>
          <Link href="/boats?sort=date_desc" locale={locale} className="text-sm font-bold text-[#0f6fae]">{text.home.moreListings}</Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {featured.map((listing) => <ListingCard key={listing.id} listing={listing} locale={locale} />)}
        </div>
      </section>

      <section className="mt-8 bg-white py-14">
        <div className="container-shell grid gap-8 md:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center gap-2 font-bold text-[#0f6fae]"><Building2 size={20} />{text.home.professionalsEyebrow}</div>
            <h2 className="text-3xl font-bold text-navy">{text.home.professionalsTitle}</h2>
            <p className="mt-4 leading-7 text-[#607085]">
              {text.home.professionalsText}
            </p>
            <Link href="/professionals" locale={locale} className="mt-6 inline-flex rounded-md bg-navy px-5 py-3 font-bold text-white">{text.home.createPro}</Link>
          </div>
          <div className="grid gap-3">
            {text.home.proFeatures.split("|").map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md border border-[#d9e2ec] p-4">
                <CheckCircle2 className="text-[#0f6fae]" />
                <span className="font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell grid gap-8 py-14 md:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="mb-3 flex items-center gap-2 font-bold text-swiss-red"><Sparkles size={20} />{text.home.sellEyebrow}</div>
          <h2 className="text-3xl font-bold text-navy">{text.home.sellTitle}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {text.home.sellSteps.split("|").map((step, index) => (
            <div key={step} className="rounded-md border border-[#d9e2ec] bg-white p-5">
              <div className="mb-4 grid size-9 place-items-center rounded-md bg-[#eef6fc] font-bold text-navy">{index + 1}</div>
              <h3 className="font-bold text-navy">{step}</h3>
              <p className="mt-2 text-sm leading-6 text-[#607085]">{text.home.sellStepText}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-shell py-10">
        <h2 className="mb-6 text-2xl font-bold text-navy">{text.home.popularLakes}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lakes.slice(0, 9).map((lake) => (
            <Link key={lake} href={{ pathname: "/boats", query: { lake } }} locale={locale} className="flex items-center gap-3 rounded-md bg-white p-4 font-semibold text-navy">
              <MapPin size={18} className="text-[#0f6fae]" />
              {refLabel(locale, lake)}
            </Link>
          ))}
        </div>
      </section>
      <MobileBottomNav locale={locale} />
    </main>
  );
}

function MobileBottomNav({ locale }: { locale: string }) {
  const labels = {
    fr: ["Rechercher", "Favoris", "Listes", "Vendre"],
    de: ["Suchen", "Favoriten", "Listen", "Verkaufen"],
    it: ["Cerca", "Preferiti", "Liste", "Vendere"],
    en: ["Search", "Favorites", "Lists", "Sell"]
  }[locale as "fr" | "de" | "it" | "en"] ?? ["Rechercher", "Favoris", "Listes", "Vendre"];

  const items = [
    { href: "/", label: labels[0], icon: Search, active: true },
    { href: "/dashboard/favorites", label: labels[1], icon: Heart, favorite: true },
    { href: "/dashboard/listings", label: labels[2], icon: ClipboardList },
    { href: "/sell", label: labels[3], icon: ShipWheel, sell: true }
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid w-full max-w-full grid-cols-4 overflow-hidden border-t border-[#d2d2d2] bg-white pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-2 shadow-[0_-10px_24px_rgba(0,0,0,0.08)] min-[520px]:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            locale={locale}
            aria-label={item.label}
            title={item.label}
            className={`relative grid min-h-16 min-w-0 place-items-center overflow-hidden px-1 transition ${item.active ? "text-navy" : "text-[#666]"} ${item.favorite ? "text-[#8bd3ff]" : ""} ${item.sell ? "text-navy" : ""}`}
          >
            <span className="grid size-12 place-items-center rounded-full transition hover:bg-[#eef9ff]">
              <Icon className="size-8" fill={item.favorite ? "currentColor" : "none"} strokeWidth={item.sell ? 2.2 : 2.5} />
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
