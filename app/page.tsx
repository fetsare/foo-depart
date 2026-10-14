import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import DepartureBoard from "@/components/DepartureBoard";
import Contributors from "@/components/Contributors";
import { fetchRawDepartures } from "@/lib/actions";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { validateConfig } from "@/lib/constants";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  // render per request instead of ISR: each ISR regeneration writes ~7 cache
  // entries (HTML, RSC, segments), which blew through Vercel's free ISR write
  // quota. Trafiklab calls are still deduplicated by the fetch cache.
  await connection();
  validateConfig();

  const rawData = await fetchRawDepartures();

  return (
    <>
      <SpeedInsights />
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <DepartureBoard rawDepartures={rawData} />
      </Suspense>
      <Contributors />
    </>
  );
}
