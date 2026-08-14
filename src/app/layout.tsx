import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Swissnaut",
    template: "%s | Swissnaut"
  },
  description: "Swiss-only marketplace for boats, sailboats, and yachts.",
  openGraph: {
    title: "Swissnaut",
    description: "A Swiss marketplace for boats and marine professionals.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
