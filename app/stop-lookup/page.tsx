import type { Metadata } from "next";
import StopLookupPage from "./StopLookup";

export const metadata: Metadata = {
  title: "Stop ID Lookup",
  description:
    "Search for Resrobot stop IDs to configure departure boards near Foo Bar at Stockholm University.",
  alternates: { canonical: "/stop-lookup" },
  robots: { index: false, follow: false },
};

export default function StopLookup() {
  return <StopLookupPage />;
}
