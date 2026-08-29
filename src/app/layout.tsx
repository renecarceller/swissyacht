import type { Metadata } from "next";
import "./globals.css";

const siteDescription =
  "Swissnaut est la plateforme dédiée au marché nautique suisse. Bateaux à vendre, professionnels et particuliers réunis au même endroit, avec une recherche pensée pour trouver, comparer et vendre des bateaux partout en Suisse.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  applicationName: "Swissnaut",
  title: {
    default: "Swissnaut",
    template: "%s | Swissnaut"
  },
  description: siteDescription,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "64x64" },
      { url: "/favicon.png", type: "image/png", sizes: "64x64" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" }
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }]
  },
  openGraph: {
    title: "Swissnaut",
    description: siteDescription,
    siteName: "Swissnaut",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Swissnaut",
    description: siteDescription
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
