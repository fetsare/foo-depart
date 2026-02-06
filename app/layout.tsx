import type { Metadata } from "next";
import { Oxygen } from "next/font/google";
import "./globals.css";

const oxygen = Oxygen({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-oxygen",
});

export const metadata: Metadata = {
  title: "Foo Depart",
  description: "Departures from Foo Bar",
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
        style={{ fontFamily: 'var(--font-oxygen)' }}
      >
        {children}
      </body>
    </html>
  );
}
