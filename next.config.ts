import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  typedRoutes: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "80mb"
    }
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "commons.wikimedia.org" },
      { protocol: "https", hostname: "*.supabase.co" }
    ]
  }
};

export default withNextIntl(nextConfig);
