import type { Metadata, Viewport } from "next";
import { Oxygen } from "next/font/google";
import "./globals.css";
import WalkingRazor from "@/components/WalkingRazor";
import { PUBLIC_BASE_URL } from "@/lib/constants";

const oxygen = Oxygen({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-oxygen",
});

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

const baseUrl = PUBLIC_BASE_URL.replace(/\/$/, "");

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Foo Depart",
  url: baseUrl,
  description:
    "Real-time public transport departures from Foo Bar at Stockholm University. Bus, subway, and commuter train departures near DISK.",
  applicationCategory: "TransportationApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "SEK",
  },
  author: {
    "@type": "Organization",
    name: "Foo Depart",
    url: baseUrl,
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(PUBLIC_BASE_URL),
  title: {
    default: "Foo Depart – Real-time Departures at Foo Bar",
    template: "%s | Foo Depart",
  },
  description:
    "Real-time public transport departures from Foo Bar at Stockholm University. See the next bus, subway, and commuter train departures near DISK.",
  keywords: [
    "Foo Bar",
    "DISK",
    "departures",
    "Stockholm University",
    "public transport",
    "real-time departures",
    "transit",
    "bus",
    "subway",
    "tunnelbana",
    "pendeltåg",
    "commuter train",
    "Resrobot",
    "SL",
    "Sweden",
  ],
  authors: [{ name: "Foo Depart" }],
  creator: "Foo Depart",
  applicationName: "Foo Depart",
  category: "transit",
  openGraph: {
    type: "website",
    locale: "en_SE",
    url: PUBLIC_BASE_URL,
    siteName: "Foo Depart",
    title: "Foo Depart – Real-time Departures at Foo Bar",
    description:
      "Real-time public transport departures from Foo Bar at Stockholm University. Bus, subway, and commuter train departures near DISK.",
  },
  twitter: {
    card: "summary",
    title: "Foo Depart – Real-time Departures at Foo Bar",
    description:
      "Real-time public transport departures from Foo Bar at Stockholm University.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${oxygen.variable} antialiased font-sans`}
        style={{ fontFamily: "var(--font-oxygen)" }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
        <WalkingRazor />
      </body>
    </html>
  );
}
