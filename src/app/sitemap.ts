import type { MetadataRoute } from "next";
import { brands, cantons, categories, lakes, locales } from "@/lib/data/reference";
import { slugify } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    urls.push({ url: `${appUrl}/${locale}`, lastModified: now });
    urls.push({ url: `${appUrl}/${locale}/boats`, lastModified: now });
    categories.forEach((category) => urls.push({ url: `${appUrl}/${locale}/boats/${slugify(category)}`, lastModified: now }));
    brands.forEach((brand) => urls.push({ url: `${appUrl}/${locale}/marque/${slugify(brand)}`, lastModified: now }));
    lakes.forEach((lake) => urls.push({ url: `${appUrl}/${locale}/lac/${slugify(lake)}`, lastModified: now }));
    cantons.forEach((canton) => urls.push({ url: `${appUrl}/${locale}/canton/${slugify(canton)}`, lastModified: now }));
  }

  return urls;
}
