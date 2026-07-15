import type { Listing } from "@/types/domain";

export function listingJsonLd(listing: Listing, appUrl: string, locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    image: listing.images.map((image) => image.url),
    description: listing.description,
    sku: listing.id,
    brand: {
      "@type": "Brand",
      name: listing.brand
    },
    category: listing.category,
    offers: {
      "@type": "Offer",
      priceCurrency: "CHF",
      price: listing.priceChf,
      availability: "https://schema.org/InStock",
      url: `${appUrl}/${locale}/listing/${listing.slug}`,
      seller: {
        "@type": listing.seller.type === "professional" ? "Organization" : "Person",
        name: listing.seller.companyName || listing.seller.name
      }
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Year", value: listing.year },
      { "@type": "PropertyValue", name: "Length", value: `${listing.lengthM} m` },
      { "@type": "PropertyValue", name: "Lake", value: listing.lake },
      { "@type": "PropertyValue", name: "Canton", value: listing.canton }
    ]
  };
}
