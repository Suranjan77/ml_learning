import type { Metadata, Viewport } from "next";
import { DM_Mono, Outfit, Shippori_Mincho } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { getAbsoluteUrl, siteConfig } from "@/lib/site";

const shippori = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-shippori",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getAbsoluteUrl()),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [...siteConfig.keywords],
  authors: [{ name: "Suranjan Poudel" }],
  creator: "Suranjan Poudel",
  publisher: "Suranjan Poudel",
  category: "education",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: getAbsoluteUrl(),
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [{ url: "/social/home.png", width: 1200, height: 630, alt: siteConfig.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/social/home.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/logo-favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/logo-favicon.svg",
    apple: "/logo-favicon.svg",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#F5F2EC",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${shippori.variable} ${outfit.variable} ${dmMono.variable} min-h-screen bg-background font-body text-on-surface antialiased`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
