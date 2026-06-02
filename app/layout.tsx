import type { Metadata } from "next";
import { Geist_Mono, Inter, Playfair_Display } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactElement, ReactNode } from "react";

import "./globals.css";
import { SiteFooter } from "@/components/domain/SiteFooter";
import { SiteHeader } from "@/components/domain/SiteHeader";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — L’actualité internationale en images`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    locale: siteConfig.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement {
  return (
    <html
      lang="fr"
      className={cn(
        "h-full font-sans antialiased",
        inter.variable,
        geistMono.variable,
        playfairDisplay.variable,
      )}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="sr-only rounded-md focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:not-sr-only focus:bg-brand focus:px-4 focus:py-2 focus:font-medium focus:text-brand-foreground focus:ring-2 focus:ring-ring focus:outline-none"
        >
          Aller au contenu principal
        </a>
        <NuqsAdapter>
          <SiteHeader />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </NuqsAdapter>
      </body>
    </html>
  );
}
