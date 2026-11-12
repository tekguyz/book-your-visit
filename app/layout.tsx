import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { siteDescription, siteName, siteTagline, siteUrl } from "@/lib/site";
import "./globals.css";

// Fonts and colors follow DESIGN.md.
const fraunces = Fraunces({ subsets: ["latin"], weight: "700", variable: "--font-fraunces" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree" });

// The link preview: title, description and app/opengraph-image.tsx.
export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: { default: `${siteName} · ${siteTagline}`, template: `%s · ${siteName}` },
  description: siteDescription,
  openGraph: {
    type: "website",
    siteName,
    title: `${siteName} · ${siteTagline}`,
    description: siteDescription,
    url: "/",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: `${siteName} · ${siteTagline}`, description: siteDescription },
};

export const viewport: Viewport = { themeColor: "#fbf6ee" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${figtree.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col text-body text-ink">{children}</body>
    </html>
  );
}
