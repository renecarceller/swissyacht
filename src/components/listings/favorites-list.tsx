"use client";

import type { Listing } from "@/types/domain";
import { Link } from "@/i18n/routing";
import { ListingCard } from "@/components/listings/listing-card";
import { useFavoriteListingIds } from "@/components/listings/favorite-button";

export function FavoritesList({
  listings,
  locale,
  emptyTitle,
  emptyText,
  browseLabel
}: {
  listings: Listing[];
  locale: string;
  emptyTitle: string;
  emptyText: string;
  browseLabel: string;
}) {
  const favoriteIds = useFavoriteListingIds();
  const favorites = listings.filter((listing) => favoriteIds.includes(listing.id));

  if (!favorites.length) {
    return (
      <div className="mt-6 rounded-md border border-[#d9e2ec] bg-white p-8 text-center">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-[#eef9ff] text-3xl text-[#8bd3ff]">♥</div>
        <h2 className="text-2xl font-bold text-navy">{emptyTitle}</h2>
        <p className="mx-auto mt-3 max-w-xl leading-7 text-[#607085]">{emptyText}</p>
        <Link href="/boats" locale={locale} className="mt-6 inline-flex h-11 items-center rounded-md bg-[#8bd3ff] px-5 font-bold text-[#06233f] shadow-[0_3px_0_#58b9e8]">
          {browseLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-3">
      {favorites.map((listing) => <ListingCard key={listing.id} listing={listing} locale={locale} />)}
    </div>
  );
}
