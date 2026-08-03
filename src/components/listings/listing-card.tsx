"use client";

/* eslint-disable @next/next/no-img-element */
import { Calendar, Gauge, MapPin, Ruler, ShieldCheck } from "lucide-react";
import type { Listing } from "@/types/domain";
import { Link } from "@/i18n/routing";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { formatChf } from "@/lib/utils";
import { refLabel, ui } from "@/i18n/ui";

export function ListingCard({ listing, locale, view = "cards" }: { listing: Listing; locale: string; view?: "cards" | "list" }) {
  const text = ui(locale);
  const primary = listing.images.find((image) => image.isPrimary) || listing.images[0];
  const isJetSki = listing.listingKind === "Jet-ski";

  return (
    <article className={view === "list" ? "relative grid overflow-hidden rounded-md border border-[#d9e2ec] bg-white md:grid-cols-[280px_1fr]" : "relative overflow-hidden rounded-md border border-[#d9e2ec] bg-white"}>
      <FavoriteButton listingId={listing.id} label={text.listing.saveFavorite} className="absolute right-3 top-3 z-10" />
      <Link href={`/listing/${listing.slug}`} locale={locale} className="block">
        <img src={primary.url} alt={primary.alt} className={view === "list" ? "h-56 w-full object-cover md:h-full" : "h-52 w-full object-cover"} />
      </Link>
      <div className="grid gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              {listing.featured ? <span className="rounded bg-[#fff0f1] px-2 py-1 text-xs font-bold text-swiss-red">{text.common.featured}</span> : null}
              {listing.demo ? <span className="rounded bg-[#eef6fc] px-2 py-1 text-xs font-bold text-navy">{text.common.demo}</span> : null}
            </div>
            <Link href={`/listing/${listing.slug}`} locale={locale} className="text-lg font-bold text-navy hover:underline">
              {listing.title}
            </Link>
            <p className="mt-1 text-sm text-[#607085]">
              {refLabel(locale, isJetSki ? "Jet-ski" : listing.category)} · {refLabel(locale, listing.condition)}
            </p>
          </div>
          <div className="text-right text-xl font-bold text-navy">{formatChf(listing.priceChf)}</div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm text-[#324963] md:grid-cols-4">
          <span className="flex items-center gap-2"><Calendar size={16} />{listing.year}</span>
          <span className="flex items-center gap-2"><Ruler size={16} />{isJetSki ? `${listing.engineHours} h` : `${listing.lengthM} m`}</span>
          <span className="flex items-center gap-2"><Gauge size={16} />{listing.powerHp} hp</span>
          <span className="flex items-center gap-2"><MapPin size={16} />{isJetSki ? listing.city : refLabel(locale, listing.lake)}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf2f7] pt-4 text-sm">
          <span className="flex items-center gap-2 text-[#607085]">
            {listing.seller.verified ? <ShieldCheck size={16} className="text-[#0f6fae]" /> : null}
            {listing.seller.professionalSlug ? (
              <Link href={`/brokers/${listing.seller.professionalSlug}`} locale={locale} className="font-semibold hover:text-navy hover:underline">
                {listing.seller.companyName || listing.seller.name}
              </Link>
            ) : (
              listing.seller.companyName || listing.seller.name
            )}
          </span>
          <span className="text-[#607085]">{listing.city}, {listing.canton}</span>
        </div>
      </div>
    </article>
  );
}
