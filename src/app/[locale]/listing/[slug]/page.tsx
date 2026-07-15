/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, Eye, Heart, MapPin, Phone, Ruler, Share2, ShieldAlert } from "lucide-react";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { ListingCard } from "@/components/listings/listing-card";
import { getListingBySlug, getSimilarListings } from "@/lib/data/listings";
import { listingJsonLd } from "@/lib/seo/json-ld";
import { formatChf } from "@/lib/utils";
import { refLabel, ui } from "@/i18n/ui";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = getListingBySlug(slug);
  if (!listing) return {};

  return {
    title: `${listing.title} - ${formatChf(listing.priceChf)}`,
    description: `${listing.brand} ${listing.model}, ${listing.year}, ${listing.lengthM} m, ${listing.lake}, ${listing.canton}.`,
    openGraph: {
      title: listing.title,
      images: listing.images.map((image) => image.url)
    }
  };
}

export default async function ListingPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const listing = getListingBySlug(slug);
  if (!listing) notFound();
  const similar = getSimilarListings(listing);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const text = ui(locale);
  const specLabels = text.listing.specs.split("|");

  return (
    <main className="container-shell py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listingJsonLd(listing, appUrl, locale)) }} />
      <div className="mb-4 text-sm text-[#607085]">{text.listing.breadcrumbHome} / {text.listing.breadcrumbBoats} / {listing.brand} / {listing.title}</div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="grid gap-6">
          <div className="overflow-hidden rounded-md border border-[#d9e2ec] bg-white">
            <img src={listing.images[0].url} alt={listing.images[0].alt} className="h-[420px] w-full object-cover" />
            <div className="grid grid-cols-3 gap-2 p-2">
              {listing.images.slice(1).map((image) => <img key={image.id} src={image.url} alt={image.alt} className="h-28 w-full rounded object-cover" />)}
            </div>
          </div>
          <section className="rounded-md border border-[#d9e2ec] bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-navy">{listing.title}</h1>
                <p className="mt-2 text-[#607085]">{refLabel(locale, listing.category)} · {refLabel(locale, listing.condition)}</p>
              </div>
              <div className="text-3xl font-bold text-navy">{formatChf(listing.priceChf)}</div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Spec icon={<Calendar size={18} />} label={text.common.year} value={listing.year} />
              <Spec icon={<Ruler size={18} />} label={text.common.length} value={`${listing.lengthM} m`} />
              <Spec icon={<MapPin size={18} />} label={text.common.location} value={`${listing.city}, ${listing.canton}`} />
              <Spec icon={<Eye size={18} />} label={text.common.views} value={listing.views} />
            </div>
          </section>
          <section className="rounded-md border border-[#d9e2ec] bg-white p-6">
            <h2 className="mb-4 text-xl font-bold text-navy">{text.listing.technical}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                [specLabels[0], listing.brand],
                [specLabels[1], listing.model],
                [specLabels[2], refLabel(locale, listing.fuelType)],
                [specLabels[3], refLabel(locale, listing.engineType)],
                [specLabels[4], listing.engineCount],
                [specLabels[5], `${listing.powerHp} hp`],
                [specLabels[6], `${listing.engineHours} h`],
                [specLabels[7], `${listing.beamM} m`],
                [specLabels[8], `${listing.weightKg} kg`],
                [specLabels[9], refLabel(locale, listing.hullMaterial)],
                [specLabels[10], refLabel(locale, listing.lake)],
                [specLabels[11], listing.marina]
              ].map(([label, value]) => (
                <div key={label} className="rounded-md bg-[#f6f8fb] p-3">
                  <div className="text-xs font-bold uppercase text-[#607085]">{label}</div>
                  <div className="mt-1 font-semibold">{value}</div>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-md border border-[#d9e2ec] bg-white p-6">
            <h2 className="mb-3 text-xl font-bold text-navy">{text.common.description}</h2>
            <p className="leading-7 text-[#324963]">{listing.demo ? text.listing.demoDescription : listing.description}</p>
            <h3 className="mb-3 mt-6 font-bold text-navy">{text.common.equipment}</h3>
            <div className="flex flex-wrap gap-2">
              {listing.equipment.map((item) => <span key={item} className="rounded bg-[#eef6fc] px-3 py-2 text-sm font-semibold text-navy">{item}</span>)}
            </div>
          </section>
        </section>
        <aside className="grid content-start gap-4">
          <div className="rounded-md border border-[#d9e2ec] bg-white p-5">
            <h2 className="text-lg font-bold text-navy">{listing.seller.companyName || listing.seller.name}</h2>
            <p className="mt-1 text-sm text-[#607085]">{listing.seller.type === "professional" ? text.listing.sellerProfessional : text.common.private}</p>
            <div className="mt-4 grid gap-2">
              <button className="flex h-11 items-center justify-center gap-2 rounded-md border border-[#cbd7e4] font-bold text-navy"><Phone size={17} />{text.listing.showPhone}</button>
              <button className="flex h-11 items-center justify-center gap-2 rounded-md border border-[#cbd7e4] font-bold text-navy"><Heart size={17} />{text.listing.saveFavorite}</button>
              <button className="flex h-11 items-center justify-center gap-2 rounded-md border border-[#cbd7e4] font-bold text-navy"><Share2 size={17} />{text.listing.share}</button>
            </div>
            <p className="mt-4 font-mono text-xs text-[#607085]">{text.listing.listingId}: {listing.id}</p>
            <p className="mt-1 text-xs text-[#607085]">{text.listing.published}: {new Date(listing.publishedAt).toLocaleDateString(`${locale}-CH`)}</p>
          </div>
          <InquiryForm listing={listing} locale={locale} />
          <div className="rounded-md border border-[#f2c7cc] bg-[#fff8f8] p-4 text-sm leading-6 text-[#7a2430]">
            <div className="mb-2 flex items-center gap-2 font-bold"><ShieldAlert size={18} />{text.listing.fraudTitle}</div>
            {text.listing.fraudText}
          </div>
        </aside>
      </div>
      <section className="mt-10">
        <h2 className="mb-5 text-2xl font-bold text-navy">{text.listing.similar}</h2>
        <div className="grid gap-5 lg:grid-cols-3">
          {similar.map((item) => <ListingCard key={item.id} listing={item} locale={locale} />)}
        </div>
      </section>
    </main>
  );
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-[#f6f8fb] p-3">
      <span className="text-[#0f6fae]">{icon}</span>
      <span><span className="block text-xs font-bold uppercase text-[#607085]">{label}</span><span className="font-semibold">{value}</span></span>
    </div>
  );
}
