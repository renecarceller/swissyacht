import { Building2, CheckCircle2, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { RegisterAccountForm } from "@/components/forms/register-account-form";
import { ListingCard } from "@/components/listings/listing-card";
import { QuickSearch } from "@/components/listings/quick-search";
import { getBrandCounts, getCategoryCounts, getFeaturedListings } from "@/lib/data/listings";
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
  const featured = getFeaturedListings();
  const brandCounts = getBrandCounts();
  const categoryCounts = getCategoryCounts();

  return (
    <main>
      <section className="grid min-h-[calc(100vh-4rem)] place-items-center bg-[#f6f8fb] py-10">
        <div className="container-shell w-full">
          <RegisterAccountForm locale={locale} />
        </div>
      </section>

      <section className="relative min-h-[620px] overflow-hidden bg-navy text-white">
        <Image
          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=85"
          alt="Swiss lake marina"
          fill
          priority
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#061b31]/40 via-[#061b31]/65 to-[#061b31]" />
        <div className="container-shell relative flex min-h-[620px] flex-col justify-center pb-16 pt-20">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-white/12 px-3 py-2 text-sm font-semibold backdrop-blur">
              <ShieldCheck size={17} />
              {text.home.trust}
            </div>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl">{text.home.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#d6e4f2]">{text.home.subtitle}</p>
          </div>
          <div className="mt-10">
            <QuickSearch locale={locale} brandCounts={brandCounts} categoryCounts={categoryCounts} initialValues={initialValues} />
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
    </main>
  );
}
